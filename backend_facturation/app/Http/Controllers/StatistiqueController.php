<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Facture;
use App\Models\Client;
use App\Models\Produit;
use App\Models\Devis;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class StatistiqueController extends Controller
{
    public function globales()
    {
        $user = Auth::user();
        $entrepriseId = $user->entreprise_id;

        $totalFactures = Facture::where('id_entreprise', $entrepriseId)->count();
        $totalClients = Client::where('entreprise_id', $entrepriseId)->count();
        $totalProduits = Produit::where('entreprise_id', $entrepriseId)->count();
        $chiffreAffaire = Facture::where('id_entreprise', $entrepriseId)->sum('total_ttc');

        return response()->json([
            'totalFactures' => $totalFactures,
            'totalClients' => $totalClients,
            'totalProduits' => $totalProduits,
            'chiffreAffaire' => $chiffreAffaire,
        ]);
    }

    public function facturesParMois()
    {
        $entrepriseId = Auth::user()->entreprise_id;

        $data = Facture::selectRaw("DATE_FORMAT(date_emission, '%Y-%m') as mois, COUNT(*) as total")
            ->where('id_entreprise', $entrepriseId)
            ->groupBy('mois')
            ->orderBy('mois')
            ->get();

        return response()->json($data);
    }

    public function chiffreAffaireParMois()
    {
        $entrepriseId = Auth::user()->entreprise_id;

        $data = Facture::selectRaw("DATE_FORMAT(date_emission, '%Y-%m') as mois, SUM(total_ttc) as chiffre")
            ->where('id_entreprise', $entrepriseId)
            ->groupBy('mois')
            ->orderBy('mois')
            ->get();

        return response()->json($data);
    }

    public function devisRepartition()
    {
        $entrepriseId = Auth::user()->entreprise_id;

        $signes = Devis::where('entreprise_id', $entrepriseId)
            ->where('etat', 'signé')
            ->count();

        $nonSignes = Devis::where('entreprise_id', $entrepriseId)
            ->where('etat', '!=', 'signé')
            ->count();

        return response()->json([
            ['name' => 'Signés', 'value' => $signes],
            ['name' => 'Non Signés', 'value' => $nonSignes]
        ]);
    }

    public function retardsPaiement()
    {
        $entrepriseId = Auth::user()->entreprise_id;

        $data = Facture::select('clients.nom as client', DB::raw('SUM(factures.total_ttc) as montant'))
            ->join('clients', 'factures.id_client', '=', 'clients.id_client')
            ->where('factures.id_entreprise', $entrepriseId)
            ->where('factures.statut', 'en_retard')
            ->groupBy('clients.nom')
            ->get();

        return response()->json($data);
    }
}
