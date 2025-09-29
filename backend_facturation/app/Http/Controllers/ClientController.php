<?php

namespace App\Http\Controllers;
use Illuminate\Support\Facades\Storage;

use App\Models\Client;
use App\Models\Facture;
use App\Models\Utilisateur;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ClientController extends Controller
{
    // 🔎 Récupérer le profil du client connecté
    public function profil()
    {
        $utilisateur = Auth::user();

        $client = Client::where('email', $utilisateur->email)->first();

        return response()->json([
            'client' => $client,
            'utilisateur' => $utilisateur,
        ]);
    }

 public function clients()
    {
            $user = Auth::user();
    if (!$user) {
        return response()->json(['error' => 'Non authentifié'], 401);
    }
        $entrepriseId = $user->entreprise_id;
        $clients = Client::where('entreprise_id', $entrepriseId)
                                ->get();
        return response()->json($clients);
    }

    // ✏️ Modifier les infos du client connecté
   public function updateProfil(Request $request)
{
    $utilisateur = Auth::user();

    // if ($utilisateur->role !== 'client') {
    //     return response()->json(['message' => 'Accès non autorisé'], 403);
    // }

    $validator = \Validator::make($request->all(), [
        'nom' => 'required|string|max:255',
        'adresse' => 'required|string|max:255',
        'telephone' => 'required|string|max:20',
        'email' => 'required|email',
        'photo_contact_url' => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
    ]);

    if ($validator->fails()) {
        return response()->json([
            'status' => false,
            'errors' => $validator->errors()
        ], 422);
    }

    $client = Client::where('email', $utilisateur->email)->first();

    if (!$client) {
        return response()->json(['message' => 'Client non trouvé'], 404);
    }

   if ($request->hasFile('photo_contact_url')) {
    // Supprimer l'ancienne photo si elle existe
    if ($client->photo_contact_url) {
        Storage::disk('public')->delete($client->photo_contact_url);
    }

    // Stocker la nouvelle et mettre à jour le champ
    $client->photo_contact_url = $request->file('photo_contact_url')->store('photos', 'public');
}


    $client->update([
        'nom' => $request->nom,
        'adresse' => $request->adresse,
        'telephone' => $request->telephone,
        'email' => $request->email,
    ]);

    // Synchroniser l'email de l'utilisateur connecté aussi
    $utilisateur->email = $request->email;
    $utilisateur->save();

    return response()->json(['message' => 'Profil mis à jour', 'client' => $client]);
}


    // 🧾 Voir ses propres factures
    public function mesFactures()
    {
        $utilisateur = Auth::user();

        // if ($utilisateur->role !== 'client') {
        //     return response()->json(['message' => 'Accès non autorisé'], 403);
        // }

        // 🔍 Trouver le client par email
        $client = Client::where('email', $utilisateur->email)->first();

        if (!$client) {
            return response()->json(['message' => 'Client non trouvé'], 404);
        }

        $factures =Facture::with(['client', 'lignes'])
                         -> where('id_client', $client->id_client)->get();

        return response()->json(['factures' => $factures]);
    }
    public function destroy($id)
{
    $user = Auth::user();
    if (!$user) {
        return response()->json(['message' => 'Non authentifié'], 401);
    }

    // Vérifie que le client appartient à la même entreprise que l'utilisateur
    $client = Client::where('id_client', $id)
                    ->where('entreprise_id', $user->entreprise_id)
                    ->first();

    if (!$client) {
        return response()->json(['message' => 'Client non trouvé ou accès refusé'], 404);
    }

    try {
        $client->delete();
        return response()->json(['message' => 'Client supprimé avec succès']);
    } catch (\Exception $e) {
        return response()->json(['message' => 'Erreur lors de la suppression'], 500);
    }
}
public function update(Request $request, $id)
{
    $user = Auth::user();

    // Vérifie client et entreprise
    $client = Client::where('id_client', $id)
                    ->where('entreprise_id', $user->entreprise_id)
                    ->first();

    if (!$client) {
        return response()->json(['message' => 'Client non trouvé ou accès refusé'], 404);
    }

    $request->validate([
        'nom' => 'required|string|max:255',
        'email' => 'required|email',
        'telephone' => 'required|string|max:20',
        'adresse' => 'required|string|max:255',
    ]);

    $client->update($request->only('nom', 'email', 'telephone', 'adresse'));

    return response()->json(['message' => 'Client mis à jour avec succès', 'client' => $client]);
}

}
