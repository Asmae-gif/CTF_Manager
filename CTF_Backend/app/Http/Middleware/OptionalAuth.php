<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class OptionalAuth
{
    public function handle(Request $request, Closure $next)
    {
        // Essaie d'authentifier avec Sanctum si un token est présent
        // Et définit Sanctum comme guard actif pour cette requête.
        $token = $request->bearerToken();
        if ($token) {
            Auth::shouldUse('sanctum');
            try {
                Auth::guard('sanctum')->user();
            } catch (\Exception $e) {
                // Ignorer les erreurs d'authentification
            }
        }

        return $next($request);
    }
}
