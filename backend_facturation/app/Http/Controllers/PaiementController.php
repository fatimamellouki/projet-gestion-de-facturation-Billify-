<?php

namespace App\Http\Controllers;

use App\Models\Paiement;
use App\Models\Facture;
use Illuminate\Http\Request;

class PaiementController extends Controller
{
    // Enregistre un nouveau paiement
    public function store(Request $request)
    {
        $request->validate([
            'date_paiement' => 'required|date',
            'montant' => 'required|numeric|min:0',
            'moyen' => 'required|in:CB,Virement,Cheque,Espèces',
            'id_facture' => 'required|exists:factures,id_facture'
        ]);

        // Vérifie que la facture existe
        $facture = Facture::findOrFail($request->id_facture);

        // Crée le paiement
        $paiement = Paiement::create([
            'date_paiement' => $request->date_paiement,
            'montant' => $request->montant,
            'moyen' => $request->moyen,
            'id_facture' => $request->id_facture
        ]);

        // Met à jour le statut de la facture si le montant couvre le total
        if ($paiement->montant >= $facture->total_ttc) {
            $facture->statut = 'payee';
            $facture->save();
        }

        return response()->json([
            'message' => 'Paiement enregistré avec succès',
            'paiement' => $paiement
        ], 201);
    }
}
