<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Submission;
use App\Models\Team;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ScoreboardController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $competitionId = $request->query('competition_id');

        $teams = Team::query()
            ->active()
            ->when($competitionId, fn($q) => $q->where('competition_id', (int) $competitionId))

            // ✅ CORRECTION 1 — solved_count via sous-requête correcte
            ->withCount([
                'submissions as solved_count' => fn($q) =>
                    $q->where('is_correct', true)
                      ->groupBy('challenge_id') // ← distinct remplacé par groupBy
            ])

            ->withCount('members')

            // ✅ Dernière résolution correcte
            ->withMax([
                'submissions as last_solve_at' => fn($q) =>
                    $q->where('is_correct', true)
            ], 'created_at')

            ->with([
                'leader:id,username,fullname',
                'leader.userBadges' => function ($q) use ($competitionId) {
                    if ($competitionId) {
                        $q->where('competition_id', (int) $competitionId);
                    }
                },
                'leader.userBadges.badge',
                'leader.userBadges.competition',
            ])

            ->orderByDesc('score')
            ->orderBy('last_solve_at')
            ->get();

        // ✅ CORRECTION 2 — first_bloods calculé EN UNE SEULE requête
        // au lieu d'une requête par équipe dans le map()
        $teamIds = $teams->pluck('id')->all();

        $firstBloodCounts = Submission::query()
            ->select('team_id', DB::raw('COUNT(DISTINCT challenge_id) as count'))
            ->where('is_correct', true)
            ->whereIn('team_id', $teamIds)
            ->whereRaw('submissions.created_at = (
                SELECT MIN(s2.created_at)
                FROM submissions s2
                WHERE s2.challenge_id = submissions.challenge_id
                AND s2.is_correct = 1
            )')
            ->groupBy('team_id')
            ->pluck('count', 'team_id'); // → [team_id => count]

        // Construction du classement
        $ranked = $teams->map(function ($team, $index) use ($firstBloodCounts) {
            return [
                'rank' => $index + 1,

                'team' => [
                    'id'     => $team->id,
                    'name'   => $team->name,
                    'avatar' => $team->avatar,
                ],

                'leader' => $team->leader ? [
                    'id'       => $team->leader->id,
                    'username' => $team->leader->username,
                    'fullname' => $team->leader->fullname,
                    'badges'   => $team->leader->userBadges
                        ->map(fn($ub) => [
                            'emoji'       => $ub->badge?->emoji,
                            'name'        => $ub->badge?->name,
                            'slug'        => $ub->badge?->slug,
                            'competition' => $ub->competition?->title,
                            'placement'   => (int) $ub->placement,
                        ])->values()->all(),
                ] : null,

                'score'         => $team->score,
                'solved_count'  => $team->solved_count ?? 0,
                'members_count' => $team->members_count,
                'first_bloods'  => $firstBloodCounts[$team->id] ?? 0, // ✅ depuis le tableau
                'last_solve_at' => $team->last_solve_at,
                'created_at'    => $team->created_at,
            ];
        });

        return response()->json([
            'success'     => true,
            'total_teams' => $ranked->count(),
            'scoreboard'  => $ranked,
        ]);
    }
}
