<?php

namespace App\Http\Middleware;

use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth; // <-- Ajoute cet import

class CheckUserType
{
    public function handle(Request $request, Closure $next, string ...$types): mixed
    {
        // Utilisation de la Façade Auth pour aider l'IDE
        if (!Auth::check()) {
            return response()->json([
                'message' => 'Non authentifié.',
            ], 401);
        }

        $user = Auth::user();

        // Vérification de la méthode normalizeType
        // Assure-toi qu'elle existe dans ton modèle User.php !
        $userType = User::normalizeType($user->type);
        $allowedTypes = array_map(fn (string $type) => User::normalizeType($type), $types);

        if (!in_array($userType, $allowedTypes, true)) {
            return response()->json([
                'message' => 'Accès interdit : type insuffisant.',
                'debug_type' => $userType // Optionnel pour le debug
            ], 403);
        }

        return $next($request);
    }
}
