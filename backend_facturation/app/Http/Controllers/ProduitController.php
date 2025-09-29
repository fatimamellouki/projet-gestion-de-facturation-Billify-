<?php

namespace App\Http\Controllers;

use App\Models\Produit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ProduitController extends Controller
{
    // Liste tous les produits
    public function index()
    {
        $user= auth()->user();
       $entreprise_id = $user->entreprise_id;
        $produits = Produit::with(['entreprise', 'categorie'])
            ->where('entreprise_id', $entreprise_id)
            ->orderBy('created_at', 'desc')
            ->get();
        return response()->json($produits);
    }

    // Créer un produit
   public function store(Request $request)
{
    $validated = $request->validate([
        'reference' => 'required|string|max:50',
        'nom' => 'required|string|max:100',
        'description' => 'nullable|string',
        'prix_unitaire_ht' => 'required|numeric',
        'taux_tva' => 'required|numeric',
        'categorie_id' => 'required|exists:categories,id_categorie',
        'entreprise_id' => 'required|exists:entreprises,id_entreprise',
        'image_url' => 'nullable|file|mimes:jpg,jpeg,png,svg|max:2048',
    ]);

    // Récupérer l’entreprise de l’utilisateur connecté
    $user = $request->user(); // ou auth()->user()
    $validated['entreprise_id'] = $user->entreprise_id;

    if ($request->hasFile('image_url')) {
        $path = $request->file('image_url')->store('produits', 'public');
        $validated['image_url'] = $path;
    }

    $produit = Produit::create($validated);

    return response()->json($produit, 201);
}


    // Afficher un produit spécifique
    public function show($id)
    {
        $produit = Produit::with('entreprise')->findOrFail($id);
        return response()->json($produit);
    }

    // Mettre à jour un produit
    public function update(Request $request, $id)
    {
        $produit = Produit::findOrFail($id);

        $validated = $request->validate([
            'reference' => 'sometimes|required|string|max:50',
            'nom' => 'sometimes|required|string|max:100',
            'description' => 'nullable|string',
            'prix_unitaire_ht' => 'sometimes|required|numeric',
            'taux_tva' => 'sometimes|required|numeric',
            'categorie_id' => 'sometimes|required|exists:categories,id_categorie',
            'image_url' => 'nullable|file|mimes:jpg,jpeg,png,svg|max:2048',
            'entreprise_id' => 'sometimes|required|exists:entreprises,id_entreprise',
        ]);

        // Gérer nouvelle image (si fournie)
        if ($request->hasFile('image_url')) {
            // Supprimer l'ancienne si elle existe
            if ($produit->image_url && Storage::disk('public')->exists($produit->image_url)) {
                Storage::disk('public')->delete($produit->image_url);
            }

            $path = $request->file('image_url')->store('produits', 'public');
            $validated['image_url'] = $path;
        }

        $produit->update($validated);

        return response()->json($produit);
    }

    // Supprimer un produit
    public function destroy($id)
    {
        $produit = Produit::findOrFail($id);

        // Supprimer l'image du disque si elle existe
        if ($produit->image_url && Storage::disk('public')->exists($produit->image_url)) {
            Storage::disk('public')->delete($produit->image_url);
        }

        $produit->delete();

        return response()->json(null, 204);
    }
}
