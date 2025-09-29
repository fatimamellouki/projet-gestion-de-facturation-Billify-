<?php

namespace App\Http\Controllers;
use App\Models\Client;

use App\Models\Utilisateur;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;
class AuthController extends Controller
{
   public function register(Request $request)
{
    $validator = Validator::make($request->all(), [
        'name' => 'required|string|max:255',
        'lastName' => 'required|string|max:255',
        'email' => 'required|email',
        'telephone' => 'required|string',
        'address' => 'required|string',
        'login' => 'required|string|unique:utilisateurs,login',
        'passwordLogin' => 'required|string|min:6',
        'role' => 'required|in:admin,comptable,client,franchise',
        'entreprise_id' => 'nullable|exists:entreprises,id_entreprise',
    ]);

    // Validation standard échouée
    if ($validator->fails()) {
        return response()->json([
            'status' => false,
            'errors' => $validator->errors()
        ], 422);
    }

    // Validation personnalisée : combinaison email + entreprise_id unique
    $exists = \App\Models\Utilisateur::where('email', $request->email)
        ->where('entreprise_id', $request->entreprise_id)
        ->exists();

    if ($exists) {
        return response()->json([
            'status' => false,
            'errors' => [
                'email' => ['Cet email est déjà utilisé pour cette entreprise.'],
            ]
        ], 422);
    }

    // Continue si OK
    $validated = $validator->validated();
    unset($validated['confirmPasswordLogin']);

    $utilisateur = Utilisateur::create([
        'name' => $request->name,
        'lastName' => $request->lastName,
        'email' => $request->email,
        'telephone' => $request->telephone,
        'address' => $request->address,
        'login' => $request->login,
        'passwordLogin' => Hash::make($request->passwordLogin),
        'role' => $request->role,
        'entreprise_id' => $request->entreprise_id,
    ]);

    if ($utilisateur->role === 'client') {
        Client::create([
            'nom' => $utilisateur->name . ' ' . $utilisateur->lastName,
            'adresse' => $utilisateur->address,
            'email' => $utilisateur->email,
            'telephone' => $utilisateur->telephone,
            'entreprise_id' => $utilisateur->entreprise_id,
            'photo_contact_url' => null,
        ]);
    }

    $token = $utilisateur->createToken('api_token')->plainTextToken;

    return response()->json([
        'status' => true,
        'message' => 'Inscription réussie',
        'token' => $token,
        'utilisateur_id' => $utilisateur->id,
    ], 201);
}
    // Récupérer tous les franchises (auditeurs)
    public function franchises()
    {
$user = Auth::user();
    if (!$user) {
        return response()->json(['error' => 'Non authentifié'], 401);
    }
            $entrepriseId = $user->entreprise_id;
        $franchises = Utilisateur::where('role', 'franchise')
                                    ->where('entreprise_id', $entrepriseId)
                                    ->get();

        return response()->json($franchises);
    }

    // Récupérer tous les comptables
    public function comptables()
    {
        $user = Auth::user();
    if (!$user) {
        return response()->json(['error' => 'Non authentifié'], 401);
    }
        $entrepriseId = $user->entreprise_id;
        $comptables = Utilisateur::where('role', 'comptable')
                                    ->where('entreprise_id', $entrepriseId)
                                    ->get();
        return response()->json($comptables);
    }


public function me(Request $request)
{
    $user = Auth::user(); // récupère l'utilisateur authentifié

    if (!$user) {
        return response()->json([
            'status' => false,
            'message' => 'Utilisateur non authentifié',
        ], 401);
    }

    return response()->json([
        'status' => true,
        'utilisateur' => $user,
    ]);
}




    public function update(Request $request)
{
    $user = Auth::user(); // récupère l'utilisateur connecté

    if (!$user) {
        return response()->json([
            'status' => false,
            'message' => 'Utilisateur non authentifié',
        ], 401);
    }

    $validator = Validator::make($request->all(), [
        'name' => 'string|max:255',
        'lastName' => 'string|max:255',
        'email' => 'email|unique:utilisateurs,email,' . $user->id,
        'telephone' => 'string',
        'address' => 'string',
        'login' => 'required|string|unique:utilisateurs,login,'. $user->id,
        'passwordLogin' => 'nullable|string|min:6',
    ]);

    if ($validator->fails()) {
        return response()->json([
            'status' => false,
            'errors' => $validator->errors(),
        ], 422);
    }

    $data = $validator->validated();

    if (!empty($data['passwordLogin'])) {
        $data['passwordLogin'] = Hash::make($data['passwordLogin']);
    } else {
        unset($data['passwordLogin']);
    }

    $user->update($data);

    return response()->json([
        'status' => true,
        'message' => 'Informations mises à jour avec succès',
        'utilisateur' => $user,
    ]);
}

}

