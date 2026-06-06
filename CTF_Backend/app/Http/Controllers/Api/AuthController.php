<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Illuminate\Auth\Events\PasswordReset;

class AuthController extends Controller
{
    // ─────────────────────────────────────────
    // Register
    // ─────────────────────────────────────────
    public function register(Request $request): JsonResponse
    {

        $data = $request->validate([
            'username' => 'required|string|max:30|unique:users|alpha_dash',
            'fullname' => 'nullable|string|max:100',
            'email'    => 'required|email|unique:users',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $user = User::create([
            'username' => $data['username'],
            'fullname' => $data['fullname'] ?? null,
            'email'    => $data['email'],
            'password' => $data['password'],
            'type'     => User::TYPE_PARTICIPANT,
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Compte créé avec succès.',
            'user'    => [
                'id'       => $user->id,
                'username' => $user->username,
                'email'    => $user->email,
                'type'     => $user->type,
                'rank'     => $user->rank,
            ],
            'token'   => $token,
        ], 201);
    }

    // ─────────────────────────────────────────
    // Login
    // ─────────────────────────────────────────
    public function login(Request $request): JsonResponse
    {
        // 1. On valide les données
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required|string',

        ]);

        // 2. On essaie de connecter l'utilisateur
        if (!Auth::attempt($request->only('email', 'password'))) {
            return response()->json([
                'message' => 'Email ou mot de passe incorrect.',
            ], 401);
        }

        /** @var User $user */
        $user = Auth::user();

        if (!$user->is_active) {
            Auth::logout();
            return response()->json([
                'message' => 'Compte désactivé. Contactez l\'administrateur.',
            ], 403);
        }
        // 3. On supprime les anciens tokens
        $user->tokens()->delete();
        // 4. On crée un nouveau token
        $token = $user->createToken('auth_token')->plainTextToken;
        // 5. On met à jour la date de dernière connexion
        $user->update(['last_seen_at' => now()]);
        // 6. On renvoie la réponse  au frontend

        return response()->json([
            'message' => 'Connexion réussie.',
            'user'    => [
                'id'       => $user->id,
                'username' => $user->username,
                'email'    => $user->email,
                'type'     => $user->type,
                'rank'     => $user->rank,
                'score'    => $user->score,
            ],
            'token'   => $token,
        ]);
    }

    // ─────────────────────────────────────────
    // Mot de passe oublié (lien par email)
    // ─────────────────────────────────────────
    public function forgotPassword(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        $status = Password::sendResetLink($request->only('email'));

        if ($status === Password::RESET_LINK_SENT) {
            return response()->json([
                'message' => 'Lien de réinitialisation envoyé. Vérifiez votre boîte mail.',
            ]);
        }

        return response()->json([
            'message' => __($status),
        ], 422);
    }

    public function resetPassword(Request $request): JsonResponse
{
    $request->validate([
        'token'    => 'required',
        'email'    => 'required|email',
        'password' => 'required|string|min:8|confirmed',
    ]);

    $status = Password::reset(
        $request->only('email', 'password', 'password_confirmation', 'token'),
        function (User $user, string $password) {
            $user->forceFill([
                'password'       => $password,
                'remember_token' => Str::random(60),
            ])->save();

            event(new PasswordReset($user));
        }
    );

    if ($status === Password::PASSWORD_RESET) {
        return response()->json([
            'message' => 'Mot de passe réinitialisé avec succès.',
        ]);
    }

    return response()->json([
        'message' => match($status) {
            Password::INVALID_TOKEN => 'Token invalide ou expiré.',
            Password::INVALID_USER  => 'Aucun compte trouvé avec cet email.',
            default                 => __($status),
        },
    ], 422);
}

    // ─────────────────────────────────────────
    // Logout
    // ─────────────────────────────────────────
    public function logout(Request $request): JsonResponse
    {
        /** @var User $user */
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Déconnexion réussie.',
        ]);
    }

    // ─────────────────────────────────────────
    // Me
    // ─────────────────────────────────────────
    public function me(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        return response()->json([
            'id'           => $user->id,
            'username'     => $user->username,
            'fullname'     => $user->fullname,
            'email'        => $user->email,
            'avatar'       => $user->avatar,
            'bio'          => $user->bio,
            'country'      => $user->country,
            'type'         => $user->type,
            'score'        => $user->score,
            'rank'         => $user->rank,
            'skills'       => $user->skills,
            'is_active'    => $user->is_active,
            'last_seen_at' => $user->last_seen_at,
        ]);
    }


}
