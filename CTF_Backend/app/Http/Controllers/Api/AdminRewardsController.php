<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Competition;
use App\Models\UserBadge;
use App\Services\CertificateService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Symfony\Component\HttpFoundation\Response;

class AdminRewardsController extends Controller
{
    public function awardedBadges(Request $request): JsonResponse
    {
        $query = UserBadge::query()
            ->with(['user:id,username,fullname', 'badge', 'competition:id,title', 'team:id,name'])
            ->orderByDesc('created_at');

        if ($request->filled('competition_id')) {
            $query->where('competition_id', $request->integer('competition_id'));
        }

        return response()->json($query->paginate($request->integer('per_page', 25)));
    }

    public function certificatePreview(Competition $competition, CertificateService $certificates): Response
    {
        return $certificates->streamPreviewPdf($competition);
    }
}
