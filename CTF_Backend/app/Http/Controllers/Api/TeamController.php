<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Team;
use App\Models\User;
use Illuminate\Http\Request;

class TeamController extends Controller
{
    /** Créer une équipe (team_leader) */
    public function store(Request $request)
    {
        $data = $request->validate([
            'name'        => 'required|string|max:80|unique:teams',
            'description' => 'nullable|string|max:500',
            'avatar'      => 'nullable|url',
        ]);

        $user = $request->user();

      if ($user->isParticipant()) {
        $user->update(['type' => User::TYPE_TEAM_LEADER]);
        $user->refresh(); // recharge le modèle après update
    }

    $data['leader_id'] = $user->id;

        $team = Team::create($data);

        // Ajouter le leader comme premier membre
        $team->members()->attach($request->user()->id, ['role' => 'leader', 'joined_at' => now(),]);

        return response()->json($team->load('leader', 'members'), 201);
    }
public function banTeam($teamId)
{
    cache()->put('banned:team:' . $teamId, ['reason' => 'Banni par admin', 'auto' => false], now()->addDays(7));
    return response()->json(['message' => 'Equipe bannie.']);
}

public function unbanTeam($teamId)
{
    cache()->forget('banned:team:' . $teamId);
    return response()->json(['message' => 'Equipe debannie.']);
}
    /** Lister toutes les équipes */
public function index()
{
    $teams = Team::with(['leader', 'members', 'competition'])
                 ->latest()
                 ->get();

    return response()->json($teams);
}

    /** Voir le profil d'une équipe */

public function show(Request $request, Team $team)
{
    $user = $request->user();
    $isMember = $team->members->contains($user->id);

    if (!$isMember) {
        $team->makeHidden(['invite_code']);
    }

    return response()->json($team->load('leader', 'members', 'competition'));
}


    /** Modifier l'équipe (leader ou admin) */
    public function update(Request $request, Team $team)
    {
        $this->authorizeLeaderOrAdmin($request, $team);

        $data = $request->validate([
            'name'        => 'sometimes|string|max:80',
            'description' => 'nullable|string|max:500',
            'avatar'      => 'nullable|url',
        ]);

        $team->update($data);
        return response()->json($team);
    }

    /** Supprimer l'équipe */
    public function destroy(Request $request, Team $team)
    {
        $this->authorizeLeaderOrAdmin($request, $team);
        $team->delete();
        return response()->json(['message' => 'Équipe supprimée.']);
    }

    /** Inviter un participant */
    public function invite(Request $request, Team $team)
    {
        $this->authorizeLeaderOrAdmin($request, $team);

        $data = $request->validate([
            'user_id'  => 'sometimes|exists:users,id',
            'username' => 'sometimes|string|exists:users,username',
        ]);

        if (empty($data['user_id']) && empty($data['username'])) {
            return response()->json([
                'message' => 'user_id ou username requis.',
            ], 422);
        }

        $user = isset($data['user_id'])
            ? User::findOrFail($data['user_id'])
            : User::where('username', $data['username'])->firstOrFail();

        // Vérifier que l'user n'est pas déjà dans une équipe
        if ($team->members->contains($user->id)) {
            return response()->json(
                ['message' => 'Utilisateur déjà dans l\'équipe.'], 422
            );
        }

        $max = $team->competition?->max_team_members;
if ($max && $team->members->count() >= $max) {
    return response()->json(['message' => 'Équipe complète.'], 422);
}

        $team->members()->attach($user->id, ['role' => 'member']);

        return response()->json(['message' => 'Membre ajouté.']);
    }
public function updateMemberRole(Request $request, Team $team, User $user)
{
    $data = $request->validate([
        'role' => 'required|in:leader,member',
    ]);

    // Si on promeut en leader → changer l'ancien leader en membre
    if ($data['role'] === 'leader') {
        // Rétrograder l'ancien leader
        $team->members()->updateExistingPivot($team->leader_id, ['role' => 'member']);
        // Mettre à jour leader_id
        $team->update(['leader_id' => $user->id]);
    }

    // Mettre à jour le rôle dans la pivot
    $team->members()->updateExistingPivot($user->id, ['role' => $data['role']]);

    return response()->json(['message' => 'Role mis a jour.']);
}
    /** Retirer un membre */
    public function removeMember(Request $request, Team $team, User $user)
{
    $currentUser = $request->user();
    
    // Seul l'admin peut retirer le leader
    if ($user->id === $team->leader_id && $currentUser->type !== 'admin') {
        return response()->json(
            ['message' => 'Impossible de retirer le leader.'], 403
        );
    }

    // Si on retire le leader → supprimer l'équipe entière
    if ($user->id === $team->leader_id && $currentUser->type === 'admin') {
        $team->delete();
        return response()->json(['message' => 'Leader retiré — équipe supprimée.']);
    }

    $team->members()->detach($user->id);
    return response()->json(['message' => 'Membre retiré.']);
}

    //rejoindre via invite_code
public function join(Request $request)
{
    $data = $request->validate([
        'invite_code' => 'required|string',
    ]);

    $team = Team::where('invite_code', $data['invite_code'])->firstOrFail();
    $user = $request->user();

    if ($user->type !== 'participant') {
        return response()->json(['message' => 'Seuls les participants peuvent rejoindre.'], 403);
    }

    if ($team->members->contains($user->id)) {
        return response()->json(['message' => 'Vous êtes déjà dans cette équipe.'], 422);
    }
$max = $team->competition?->max_team_members;

        if ($max && $team->members()->count() >= $max) {
        return response()->json(['message' => 'Équipe complète.'], 422);
    }

    $team->members()->attach($user->id, ['role' => 'member']);

    return response()->json([
        'message' => 'Vous avez rejoint ' . $team->name,
        'team'    => $team->load('members'),
    ]);
}
private function authorizeLeaderOrAdmin(Request $request, Team $team): void
{
    $user = $request->user();
    $isLeader = $team->leader_id === $user->id;
    $isAdmin  = $user->type === 'admin';

    if (!$isLeader && !$isAdmin) {
        abort(403, 'Action non autorisée.');
    }
}
}
