<?php

namespace App\Services;

use App\Models\Badge;
use App\Models\Competition;
use App\Models\CompetitionTeamResult;
use Illuminate\Support\Facades\Log;

class CompetitionFinalizationService
{
    public function __construct(
        private CertificateService $certificates  // ✅ injection
    ) {}

    public function finalize(Competition $competition): void
    {
        // ── 1. Classement ──────────────────────────────────────────────
        $teams = $competition->teams()
            ->with('members')
            ->withCount(['submissions as solved_count' => fn($q) => $q->where('is_correct', true)])
            ->orderByDesc('score')
            ->orderBy('updated_at')
            ->get();

        foreach ($teams as $rank => $team) {
            CompetitionTeamResult::updateOrCreate(
                ['competition_id' => $competition->id, 'team_id' => $team->id],
                ['rank' => $rank + 1, 'score' => $team->score]
            );
        }

        // ── 2. Badges + certificats ─────────────────────────────────────
        $badgeMap = [
            1 => Badge::where('slug', Badge::SLUG_GOLD)->first(),
            2 => Badge::where('slug', Badge::SLUG_SILVER)->first(),
            3 => Badge::where('slug', Badge::SLUG_BRONZE)->first(),
        ];

        foreach ($teams as $rank => $team) {
            $placement = $rank + 1;
            $badge     = $badgeMap[$placement] ?? null;

            // Attribuer le badge à chaque membre de l'équipe
            if ($badge) {
                foreach ($team->members as $member) {
                    \App\Models\UserBadge::updateOrCreate(
                        [
                            'user_id'       => $member->id,
                            'badge_id'      => $badge->id,
                            'competition_id' => $competition->id,
                        ],
                        [
                            'team_id'   => $team->id,
                            'placement' => $placement,
                        ]
                    );
                }
            }

            // Générer les certificats
            if ($placement <= 3) {
                foreach ($team->members as $member) {
                    try {
                        $this->certificates->generatePdf($competition, $member, $team->name);
                    } catch (\Exception $e) {
                        // Log l'erreur mais continue
                        Log::error("Erreur génération certificat: {$e->getMessage()}");
                    }
                }
            }
        }

        // ── 3. Marquer finalisé ─────────────────────────────────────────
        $competition->update(['finalized_at' => now()]);
    }
}
