<?php
namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class ForceJsonResponse
{
    public function handle(Request $request, Closure $next)
    {
        if ($request->is('api/competitions/*/certificate/pdf')
            || $request->is('api/admin/competitions/*/certificate-preview')) {
            return $next($request);
        }

        $request->headers->set('Accept', 'application/json');

        return $next($request);
    }
}