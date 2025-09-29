<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class OnlyProgrammer
{
     public function handle(Request $request, Closure $next): Response
    {
        // Exemple simple : accès seulement si une clé secrète est dans l'URL ou en header
        $secretKey = 'cle123programmer';

        if ($request->query('key') !== $secretKey) {
            return response()->json(['message' => 'Accès refusé'], 403);
        }

        return $next($request);
    }
}
