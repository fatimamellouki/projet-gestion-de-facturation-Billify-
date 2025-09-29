<?php

namespace App\Http\Controllers;

use App\Models\Categorie;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CategorieController extends Controller
{
    // Récupérer toutes les catégories
    public function index()
    {
        $user = Auth::user();
        return response()->json(Categorie::where('id_entreprise', $user->entreprise_id)->get());
    }

    // Ajouter une catégorie
    public function store(Request $request)
    {
        $request->validate([
            'nom' => 'required|string|max:100',
        ]);

        $user = Auth::user();
        $entreprise_id = $user->entreprise_id;

        $categorie = Categorie::create([
            'nom' => $request->nom,
            'id_entreprise' => $entreprise_id,
        ]);

        return response()->json($categorie, 201);
    }
}
