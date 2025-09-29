<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Utilisateur;
use Illuminate\Support\Facades\Hash;

class LoginController extends Controller
{
    public function login(Request $request)
{
    // 1. Validation avec messages personnalisés
    $validated = $request->validate([
        'login' => ['required', 'string'],
        'passwordLogin' => ['required', 'string'],
    ], [
        'login.required' => 'Le champ login est obligatoire.',
        'passwordLogin.required' => 'Le mot de passe est obligatoire.',
    ]);

    // 2. Recherche de l'utilisateur
    $utilisateur = Utilisateur::where('login', $validated['login'])->first();

    if (!$utilisateur) {
        // Pour sécurité, on retourne un message générique
        return response()->json([
            'message' => 'Identifiants incorrects.',
            'error' => 'user_not_found'
        ], 401);
    }

    // 3. Vérification du mot de passe
    if (!Hash::check($validated['passwordLogin'], $utilisateur->passwordLogin)) {
        return response()->json([
            'message' => 'mot de passe  incorrects.',
            'error' => 'wrong_password'
        ], 401);
    }

    // 4. Génération du token
    $token = $utilisateur->createToken('token-utilisateur')->plainTextToken;

    // 5. Retour des infos utilisateur + token
    return response()->json([
        'message' => 'Connexion réussie',
        'utilisateur' => [
            'id' => $utilisateur->id,
            'name' => $utilisateur->name,
            'role' => $utilisateur->role,
            'entreprise' => $utilisateur->entreprise ? [
                'id' => $utilisateur->entreprise->id_entreprise,
                'nom' => $utilisateur->entreprise->nom,
                'logo_url' => $utilisateur->entreprise->logo_url ? asset('storage/' . $utilisateur->entreprise->logo_url) : null,
            ] : null,
        ],
        'token' => $token,
    ]);
}



}
