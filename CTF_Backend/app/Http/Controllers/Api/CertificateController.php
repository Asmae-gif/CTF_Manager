<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Competition;
use App\Services\CertificateService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class CertificateController extends Controller
{
    public function __construct(private CertificateService $certificates) {}

    // GET /competitions/{competition}/certificate/status
    public function status(Request $request, Competition $competition)
    {
        $user = $request->user();

        // ✅ Vérifie avec canIssue (compétition ended + membre)
        $can  = $this->certificates->canIssueParticipationCertificate($user, $competition);

        return response()->json([
            'available' => $can,
            'url'       => null,
        ]);
    }

    // GET /competitions/{competition}/certificate/pdf
    public function download(Request $request, Competition $competition)
    {
        $user = $request->user();

        // ✅ Vérifie que la compétition est terminée ET que l'user était inscrit
        if (!$this->certificates->canIssueParticipationCertificate($user, $competition)) {
            return response()->json(['message' => 'Certificat non disponible.'], 403);
        }

        // ✅ Génère à la demande si pas encore généré
        $path = "certificates/{$competition->id}/{$user->id}.pdf";

        if (!Storage::disk('public')->exists($path)) {
            $team = $this->certificates->userTeamInCompetition($user, $competition);
            $path = $this->certificates->generatePdf($competition, $user, $team?->name);
        }

        // ✅ Télécharge
        $absolutePath = Storage::disk('public')->path($path);

        if (!file_exists($absolutePath)) {
            return response()->json(['message' => 'PDF non trouvé.'], 404);
        }

        return response()->download(
            $absolutePath,
            "certificat-{$competition->slug}-{$user->username}.pdf",
            ['Content-Type' => 'application/pdf']
        );
    }
}
