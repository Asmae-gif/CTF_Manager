<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Competition;
use App\Models\User;
use App\Services\CompetitionFinalizationService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class CompetitionController extends Controller
{
    // ─────────────────────────────────────────
    // GET /api/competitions
    // Liste publique des compétitions
    // ─────────────────────────────────────────
    public function index(Request $request): JsonResponse
    {
        $competitions = Competition::public()
            ->when($request->status, fn($q) => $q->where('status', $request->status))
            ->when($request->search, fn($q) => $q->where('title', 'like', "%{$request->search}%"))
            ->withCount('teams')
            ->orderByDesc('created_at')
            ->paginate(10);

        return response()->json($competitions);
    }

    // ─────────────────────────────────────────
    // GET /api/competitions/{competition}
    // Détail d'une compétition
    // ─────────────────────────────────────────
    public function show(Competition $competition): JsonResponse
    {
        $user = Auth::guard('sanctum')->user();
        $team = $user ? $user->leadingTeam : null;
        $team_registered_here = $team && $team->competition_id === $competition->id;
        $can_join = false;
        if ($user && $team && !$team_registered_here && $competition->isUpcoming()) {
            // Peut rejoindre si pas inscrit OU inscrit à une compétition terminée
            if ($team->competition_id === null) {
                $can_join = true;
            } else {
                $currentCompetition = \App\Models\Competition::find($team->competition_id);
                if ($currentCompetition && $currentCompetition->isEnded()) {
                    $can_join = true;
                }
            }
        }
        return response()->json([
            'id'               => $competition->id,
            'title'            => $competition->title,
            'slug'             => $competition->slug,
            'description'      => $competition->description,
            'status'           => $competition->status,
            'starts_at'        => $competition->starts_at,
            'ends_at'          => $competition->ends_at,
            'max_teams'        => $competition->max_teams,
            'max_team_members' => $competition->max_team_members,
            'is_public'        => $competition->is_public,
            'is_running'       => $competition->is_running,
            'banner'           => $competition->banner
                                    ? Storage::url($competition->banner)
                                    : null,
            'creator'          => $competition->creator
                ? [
                    'id'       => $competition->creator->id,
                    'username' => $competition->creator->username,
                ]
                : null,
            'organizer_name'     => $competition->organizer_name,
            'first_place_prize'  => $competition->first_place_prize,
            'second_place_prize' => $competition->second_place_prize,
            'third_place_prize'  => $competition->third_place_prize,
            'finalized_at'       => $competition->finalized_at,
            'created_at'         => $competition->created_at,
            'team_registered_here' => $team_registered_here,
            'can_join'             => $can_join,
        ]);
    }

    // ─────────────────────────────────────────
    // POST /api/competitions
    // Créer une compétition — admin seulement
    // ─────────────────────────────────────────
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'title'            => 'required|string|max:100|unique:competitions',
            'description'      => 'nullable|string',
            'starts_at'        => 'required|date|after:now',
            'ends_at'          => 'required|date|after:starts_at',
            'max_teams'        => 'nullable|integer|min:2',
            'max_team_members' => 'nullable|integer|min:1|max:10',
            'is_public'        => 'boolean',
            'banner'           => 'nullable|image|max:2048',
            'organizer_name'     => 'nullable|string|max:120',
            'first_place_prize'  => 'nullable|string|max:255',
            'second_place_prize' => 'nullable|string|max:255',
            'third_place_prize'  => 'nullable|string|max:255',
        ]);

        // Upload banner
        if ($request->hasFile('banner')) {
            $data['banner'] = $request->file('banner')
                                ->store('banners', 'public');
        }

        /** @var User $user */
        $user = $request->user();
        $data['created_by'] = $user->id;
        $data['status']     = Competition::STATUS_DRAFT;
        $data['slug']       = Str::slug($data['title']);

        $competition = Competition::create($data);

        return response()->json([
            'message'     => 'Compétition créée.',
            'competition' => $competition,
        ], 201);
    }

    // ─────────────────────────────────────────
    // PUT /api/competitions/{competition}
    // Modifier une compétition — admin
    // ─────────────────────────────────────────
    public function update(Request $request, Competition $competition): JsonResponse
    {
        $data = $request->validate([
            'title'            => "required|string|max:100|unique:competitions,title,{$competition->id}",
            'description'      => 'nullable|string',
            'starts_at'        => 'required|date',
            'ends_at'          => 'required|date|after:starts_at',
            'max_teams'        => 'nullable|integer|min:2',
            'max_team_members' => 'nullable|integer|min:1|max:10',
            'is_public'        => 'boolean',
            'banner'           => 'nullable|image|max:2048',
            'organizer_name'     => 'nullable|string|max:120',
            'first_place_prize'  => 'nullable|string|max:255',
            'second_place_prize' => 'nullable|string|max:255',
            'third_place_prize'  => 'nullable|string|max:255',
        ]);

        if ($request->hasFile('banner')) {
            if ($competition->banner) {
                Storage::delete($competition->banner);
            }
            $data['banner'] = $request->file('banner')
                                ->store('banners', 'public');
        }

        $competition->update($data);

        return response()->json([
            'message'     => 'Compétition mise à jour.',
            'competition' => $competition,
        ]);
    }

    // ─────────────────────────────────────────
    // DELETE /api/competitions/{competition}
    // Supprimer — admin
    // ─────────────────────────────────────────
    public function destroy(Competition $competition): JsonResponse
    {
        $competition->delete();

        return response()->json([
            'message' => 'Compétition supprimée.',
        ]);
    }

    // ─────────────────────────────────────────
    // PATCH /api/competitions/{competition}/status
    // Changer le statut — admin
    // ─────────────────────────────────────────
    public function updateStatus(Request $request, Competition $competition, CompetitionFinalizationService $finalization): JsonResponse
    {
        $request->validate([
            'status' => 'required|in:draft,upcoming,active,ended',
        ]);

        // Vérification logique des statuts
        $current = $competition->status;
        $new     = $request->status;

        $allowed = [
            'draft'    => ['upcoming'],
            'upcoming' => ['active', 'draft'],
            'active'   => ['ended'],
            'ended'    => [],
        ];

        if (!in_array($new, $allowed[$current])) {
            return response()->json([
                'message' => "Transition de statut impossible : {$current} → {$new}",
            ], 422);
        }

        $competition->update(['status' => $new]);

        if ($new === Competition::STATUS_ENDED) {
            $finalization->finalize($competition->fresh());
        }

        return response()->json([
            'message' => "Statut mis à jour : {$new}",
            'status'  => $competition->fresh()->status,
            'finalized_at' => $competition->fresh()->finalized_at,
        ]);
    }


    // ─────────────────────────────────────────
// POST /api/competitions/{competition}/join
// Capital inscrit son équipe — capital seulement
// ─────────────────────────────────────────
public function join(Request $request, Competition $competition): JsonResponse
{
    $user = $request->user();
    $team = $user->leadingTeam;

    if (!$team) {
        return response()->json(['message' => 'Vous n\'avez pas d\'équipe.'], 422);
    }

    if (!$competition->isUpcoming()) {
        return response()->json(['message' => 'Inscription fermée.'], 422);
    }


    // Vérifier que la team n'est pas déjà inscrite à une compétition non terminée
    if ($team->competition_id !== null) {
        $currentCompetition = Competition::find($team->competition_id);
        if ($currentCompetition && !$currentCompetition->isEnded()) {
            return response()->json(['message' => 'Équipe déjà inscrite à une compétition.'], 422);
        }
    }

    // Vérifier que la compétition n'est pas pleine
    if ($competition->max_teams && $competition->teams()->count() >= $competition->max_teams) {
        return response()->json(['message' => 'Compétition complète.'], 422);
    }

    $team->update(['competition_id' => $competition->id]);

    return response()->json(['message' => "Équipe {$team->name} inscrite à {$competition->title}."]);
}

public function leave(Request $request, Competition $competition): JsonResponse
{
    $user = $request->user();
    $team = $user->leadingTeam;

    if (!$team || $team->competition_id !== $competition->id) {
        return response()->json(['message' => 'Votre équipe n\'est pas inscrite ici.'], 422);
    }

    $team->update(['competition_id' => null]);

    return response()->json(['message' => "Équipe {$team->name} désinscrite."]);
}

// ─────────────────────────────────────────
// GET /api/competitions/{competition}/teams
// Voir les équipes inscrites — tout le monde
// ─────────────────────────────────────────
public function teams(Competition $competition): JsonResponse
{
    $teams = $competition->teams()
        ->withCount('members')
        ->orderByDesc('score')
        ->get()
        ->map(fn ($team) => [
            'id'         => $team->id,
            'name'       => $team->name,
            'score'      => $team->score,
            'members'    => $team->members_count,
        ]);

    return response()->json([
        'competition' => $competition->title,
        'teams'       => $teams,
    ]);
}
}
