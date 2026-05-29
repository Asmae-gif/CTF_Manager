<?php

namespace App\Services;

use App\Models\Competition;
use App\Models\CompetitionTeamResult;
use App\Models\Team;
use App\Models\User;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Storage;

class CertificateService
{
    // ── Trouver l'équipe du user dans la compétition ───────────────────
    public function userTeamInCompetition(User $user, Competition $competition): ?Team
    {
        return Team::query()
            ->where('competition_id', $competition->id)
            ->where(function ($q) use ($user) {
                $q->where('leader_id', $user->id)
                  ->orWhereHas('members', fn($m) => $m->where('users.id', $user->id));
            })
            ->first();
    }

    // ── Peut-il avoir un certificat ? ──────────────────────────────────
    public function canIssueParticipationCertificate(User $user, Competition $competition): bool
    {
        if (!$competition->isEnded()) {
            return false;
        }
        return $this->userTeamInCompetition($user, $competition) !== null;
    }

    // ── Construire les données du certificat ───────────────────────────
    public function buildCertificateData(User $user, Competition $competition): array
    {
        $team            = $this->userTeamInCompetition($user, $competition);
        $participantName = $user->fullname ?: $user->username;
        $organizer       = $competition->organizer_name
            ?: ($competition->creator?->fullname ?: $competition->creator?->username ?: 'Organisation');

        $prizeLine = null;
        $teamRank  = null;

        if ($team && $competition->finalized_at) {
            $result = CompetitionTeamResult::query()
                ->where('competition_id', $competition->id)
                ->where('team_id', $team->id)
                ->first();

            if ($result && $result->rank <= 3) {
                $teamRank = (int) $result->rank;
                $prize    = match ($result->rank) {
                    1 => $competition->first_place_prize,
                    2 => $competition->second_place_prize,
                    3 => $competition->third_place_prize,
                    default => null,
                };
                $prizeLine = $prize
                    ? "Prix ({$this->ordinalFr($result->rank)} place) : {$prize}"
                    : "Classement équipe : {$this->ordinalFr($result->rank)} place";
            }
        }

        return [
            'participant_name'  => $participantName,
            'competition_title' => $competition->title,
            'date'              => optional($competition->ends_at)->format('d/m/Y') ?? now()->format('d/m/Y'),
            'organizer'         => $organizer,
            'prize_line'        => $prizeLine,
            'team_name'         => $team?->name,
            'team_rank'         => $teamRank,
        ];
    }

    // ✅ Générer PDF et le stocker ──────────────────────────────────────
    public function generatePdf(Competition $competition, User $user, ?string $teamName = null): string
    {
        $data = $this->buildCertificateData($user, $competition);

        $pdf  = Pdf::loadView('certificates.participation', $data)
                   ->setPaper('a4', 'landscape');

        $dir  = "certificates/{$competition->id}";
        $path = "{$dir}/{$user->id}.pdf";

        // ✅ Crée le dossier s'il n'existe pas
        if (!Storage::disk('public')->exists($dir)) {
            Storage::disk('public')->makeDirectory($dir);
        }

        $stored = Storage::disk('public')->put($path, $pdf->output());

        // ✅ Log pour débugger
        if (!$stored) {
            throw new \RuntimeException("Failed to store PDF at {$path}");
        }

        return $path;
    }

    // ── Download PDF pour le participant ───────────────────────────────
    public function downloadPdf(User $user, Competition $competition): \Illuminate\Http\Response
    {
        $data     = $this->buildCertificateData($user, $competition);
        $pdf      = Pdf::loadView('certificates.participation', $data)->setPaper('a4', 'landscape');
        $filename = 'certificat-' . $competition->slug . '-' . $user->username . '.pdf';

        return $pdf->download($filename);
    }

    // ── Preview admin ──────────────────────────────────────────────────
    public function streamPreviewPdf(Competition $competition, ?User $sampleUser = null): \Illuminate\Http\Response
    {
        $data = $sampleUser && $this->userTeamInCompetition($sampleUser, $competition)
            ? $this->buildCertificateData($sampleUser, $competition)
            : $this->buildAdminPreviewData($competition);

        $pdf = Pdf::loadView('certificates.participation', $data)->setPaper('a4', 'landscape');

        return $pdf->stream('apercu-certificat-' . $competition->slug . '.pdf');
    }

    public function buildAdminPreviewData(Competition $competition): array
    {
        $organizer = $competition->organizer_name
            ?: ($competition->creator?->fullname ?: 'Organisation');

        return [
            'participant_name'  => 'Participant (aperçu)',
            'competition_title' => $competition->title,
            'date'              => optional($competition->ends_at)->format('d/m/Y') ?? now()->format('d/m/Y'),
            'organizer'         => $organizer,
            'prize_line'        => $competition->first_place_prize
                ? 'Prix (1re place) : ' . $competition->first_place_prize
                : null,
            'team_name'         => 'Équipe (aperçu)',
            'team_rank'         => 1,
        ];
    }

    private function ordinalFr(int $rank): string
    {
        return match ($rank) {
            1       => '1re',
            2       => '2e',
            3       => '3e',
            default => $rank . 'e',
        };
    }
}
