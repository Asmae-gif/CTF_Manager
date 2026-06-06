<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Category;
use Illuminate\Validation\Rule;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;

class UserController extends Controller
{
    // ─────────────────────────────────────────
    // GET api/user/profile
    // Voir son propre profil
    // ─────────────────────────────────────────
    public function profile(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user()->load(['userBadges.badge', 'userBadges.competition']);

        return response()->json([
            'id'           => $user->id,
            'username'     => $user->username,
            'fullname'     => $user->fullname,
            'email'        => $user->email,
            
            'avatar'       => $user->avatar
                                ? url(Storage::url($user->avatar))
                                : null,
            'bio'          => $user->bio,
            'country'      => $user->country,
            'type'         => $user->type,
            'score'        => $user->score,
            'rank'         => $user->rank,
            'skills'       => $user->skills,
            'is_active'    => $user->is_active,
            'last_seen_at' => $user->last_seen_at,
            'created_at'   => $user->created_at,
            'badges'       => $this->formatBadges($user),
        ]);
    }

    // ─────────────────────────────────────────
    // PUT api/user/profile
    // Modifier son propre profil
    // ─────────────────────────────────────────
    public function updateProfile(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        // retrieve allowed skill slugs from categories to keep validation dynamic
        $allowedSkills = Category::query()->pluck('slug')->toArray();

        $data = $request->validate([
            'fullname' => 'nullable|string|max:100',
            'bio'      => 'nullable|string|max:500',
            'country'  => 'nullable|string|size:2',
            'skills'   => 'nullable|array',
            'skills.*' => ['string', Rule::in($allowedSkills)],
            'avatar'   => 'nullable|image|max:2048',
            'password' => 'nullable|string|min:8|confirmed',
        ]);

        // Upload avatar
        if ($request->hasFile('avatar')) {
            if ($user->avatar) {
                Storage::delete($user->avatar);
            }
            $data['avatar'] = $request->file('avatar')
                                ->store('avatars', 'public');
        }

        // Password
        if (empty($data['password'])) {
            unset($data['password']);
        }

        $user->update($data);

        return response()->json([
            'message' => 'Profil mis à jour.',
            'user'    => [
                'id'       => $user->id,
                'username' => $user->username,
                'fullname' => $user->fullname,
                'avatar'   => $user->avatar
                                ? url(Storage::url($user->avatar))
                                : null,
                'bio'      => $user->bio,
                'country'  => $user->country,
                'skills'   => $user->skills,
                'rank'     => $user->rank,
            ],
        ]);
    }

    // ─────────────────────────────────────────
    // GET api/users
    // Liste tous les users — admin seulement
    // ─────────────────────────────────────────
    public function index(Request $request): JsonResponse
{
    $users = User::query()
        ->when($request->type, fn($q) => $q->where('type', $request->type))
        ->when($request->search, fn($q) => $q->where(function ($q) use ($request) {
            $q->where('username', 'like', "%{$request->search}%")
              ->orWhere('email', 'like', "%{$request->search}%");
        }))
        ->select(
            'id', 'username', 'fullname', 'email',
            'avatar', 'country', 'type',
            'score', 'is_active', 'created_at'
        )
        ->orderByDesc('score')
        ->paginate(20);



    return response()->json($users);
}

    // ─────────────────────────────────────────
    // GET api/users/{user}
    // Voir le profil public d'un user
    // ─────────────────────────────────────────
    public function show(User $user): JsonResponse
    {
        $user->load(['userBadges.badge', 'userBadges.competition']);

        return response()->json([
            'id'       => $user->id,
            'username' => $user->username,
            'fullname' => $user->fullname,
            'avatar'   => $user->avatar
                            ? url(Storage::url($user->avatar))
                            : null,
            'bio'      => $user->bio,
            'country'  => $user->country,
            'type'     => $user->type,
            'score'    => $user->score,
            'rank'     => $user->rank,
            'skills'   => $user->skills,
            'badges'   => $this->formatBadges($user),
        ]);
    }

    // ─────────────────────────────────────────
    // PATCH api/users/{user}/toggle
    // Activer / désactiver un user — admin
    // ─────────────────────────────────────────
    public function toggleActive(User $user): JsonResponse
    {
        $user->update(['is_active' => !$user->is_active]);

        return response()->json([
            'message'   => $user->is_active
                            ? 'Compte activé.'
                            : 'Compte désactivé.',
            'is_active' => $user->is_active,
        ]);
    }

    // ─────────────────────────────────────────
    // DELETE api/users/{user}
    // Supprimer un user — admin
    // ─────────────────────────────────────────
    public function destroy(User $user): JsonResponse
    {
        $user->delete();

        return response()->json([
            'message' => 'Utilisateur supprimé.',
        ]);
    }
public function adminUpdate(Request $request, User $user): JsonResponse
{
    $data = $request->validate([
        'username' => 'sometimes|string|max:30',
        'email'    => 'sometimes|email|unique:users,email,' . $user->id,
    ]);

    $user->update($data);

    return response()->json(['message' => 'Membre mis a jour.', 'user' => $user]);
}
    // ─────────────────────────────────────────
    // GET api/leaderboard
    // Classement public
    // ─────────────────────────────────────────
    public function leaderboard(): JsonResponse
    {
        $users = User::active()
            ->leaderboard()
            ->with(['userBadges.badge', 'userBadges.competition'])
            ->select('id', 'username', 'avatar', 'country', 'score', 'type')
            ->paginate(50);

        $users->getCollection()->transform(function (User $user) {
            return [
                'id' => $user->id,
                'username' => $user->username,
                'avatar' => $user->avatar ? Storage::url($user->avatar) : null,
                'country' => $user->country,
                'score' => $user->score,
                'type' => $user->type,
                'rank' => $user->rank,
                'badges' => $this->formatBadges($user),
            ];
        });

        return response()->json($users);
    }

    /**
     * @return array<int, array{emoji: string|null, name: string, slug: string, competition: string|null, placement: int, awarded_at: string|null}>
     */
    private function formatBadges(User $user): array
    {
        return $user->userBadges
            ->sortByDesc(fn ($ub) => $ub->created_at?->timestamp ?? 0)
            ->take(30)
            ->values()
            ->map(function ($ub) {
                return [
                    'emoji' => $ub->badge?->emoji,
                    'name' => $ub->badge?->name ?? '',
                    'slug' => $ub->badge?->slug ?? '',
                    'competition' => $ub->competition?->title,
                    'placement' => (int) $ub->placement,
                    'awarded_at' => $ub->created_at?->toIso8601String(),
                ];
            })
            ->all();
    }
}
