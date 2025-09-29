<?php

namespace App\Http\Controllers;

use App\Models\Facture;
use App\Models\LigneFacture;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Barryvdh\DomPDF\Facade\Pdf;
use NumberToWords\NumberToWords;
use Illuminate\Support\Facades\Log;
class FactureController extends Controller
{
    public function getLastFactureId($id)
{
    $lastFacture = Facture::where('id_entreprise', $id)
        ->orderBy('id_facture', 'desc')
        ->first();

    return response()->json([
        'last_id' => $lastFacture ? (int) str_replace('FAC-', '', $lastFacture->numero) : 0
    ]);
}
        public function store(Request $request)
{
    $user = Auth::user();
    $entreprise_id = $user->entreprise_id;

    $request->validate([
        'date_emission' => 'required|date',
        'date_echeance' => 'required|date',
        'id_client' => 'required|exists:clients,id_client',
        'lignes' => 'required|array|min:1',
        'lignes.*.designation' => 'required|string',
        'lignes.*.quantite' => 'required|numeric|min:1',
        'lignes.*.prixUnitaire' => 'required|numeric',
        'lignes.*.tva' => 'required|numeric',
        'lignes.*.remise' => 'nullable|numeric',
        'statut' => 'required|in:brouillon,emise,payee,en_retard'
    ]);

    // Vérifier si c'est la première facture de l'entreprise
    $factureCount = Facture::where('id_entreprise', $entreprise_id)->count();

    if ($factureCount === 0) {
        // Première facture → le numéro DOIT être fourni par l'utilisateur
        if (!$request->filled('numero')) {
            return response()->json(['message' => 'Le numéro de la première facture est requis.'], 422);
        }
        $numero = $request->numero;
    } else {
        // Générer automatiquement le numéro
        $lastNumero = Facture::where('id_entreprise', $entreprise_id)
            ->orderBy('id_facture', 'desc')
            ->value('numero');

        if ($lastNumero && preg_match('/\d+$/', $lastNumero, $matches)) {
            $lastNumber = intval($matches[0]);
            $numero = 'FAC-' . str_pad($lastNumber + 1, 4, '0', STR_PAD_LEFT);
        } else {
            $numero = 'FAC-0001';
        }
    }

    // Calculs totaux
    $totalHT = $totalTVA = $totalRemise = 0;

    foreach ($request->lignes as $ligne) {
        $prix = $ligne['quantite'] * $ligne['prixUnitaire'];
        $remise = $prix * ($ligne['remise'] ?? 0) / 100;
        $ht = $prix - $remise;
        $tva = $ht * $ligne['tva'] / 100;

        $totalHT += $ht;
        $totalTVA += $tva;
        $totalRemise += $remise;
    }

    $facture = Facture::create([
        'numero' => $numero,
        'date_emission' => $request->date_emission,
        'date_echeance' => $request->date_echeance,
        'id_client' => $request->id_client,
        'id_entreprise' => $entreprise_id,
        'total_ht' => $totalHT,
        'total_tva' => $totalTVA,
        'total_remise' => $totalRemise,
        'total_ttc' => $totalHT + $totalTVA,
        'statut' => $request->statut,
    ]);

    foreach ($request->lignes as $ligne) {
        LigneFacture::create([
            'id_facture' => $facture->id_facture,
            'id_produit' => $ligne['id_produit'] ?? null,
            'designation' => $ligne['designation'],
            'quantite' => $ligne['quantite'],
            'prix_unitaire_ht' => $ligne['prixUnitaire'],
            'montant_tva' => $ligne['tva'],
            'remise_pourcentage' => $ligne['remise'] ?? 0,
            'montant_total_ttc' => ($ligne['quantite'] * $ligne['prixUnitaire']) * (1 + $ligne['tva'] / 100) * (1 - ($ligne['remise'] ?? 0) / 100),
        ]);
    }

    // $mailEnvoye = $this->envoyerFacture($facture->id_facture);

    return response()->json([
        'message'=> 'Facture créée avec succès',
        // 'message' => $mailEnvoye
            // ? 'Facture créée et envoyée avec succès'
            // : 'Facture créée mais échec lors de l’envoi de l’email.',
        'facture' => $facture,
    ], 201);
}

        public function countByEntreprise($id)
    {
        $count = Facture::where('id_entreprise', $id)->count();
        return response()->json(['count' => $count]);
    }



public function envoyerFactureParMail(Request $request, $id)
{
    $facture = Facture::findOrFail($id);
    $facture->load('entreprise', 'client');

    $modele = $request->query('modele', 'standard'); // 'standard' ou 'personnalise'
    $options = $request->all();

    $numberToWords = new NumberToWords();
    $numberTransformer = $numberToWords->getNumberTransformer('fr');
    $montantLettre = ucfirst($numberTransformer->toWords((int) $facture->total_ttc)) . ' dirhams';

    // Choix du modèle Blade à utiliser
    $view = $modele === 'personnalise' ? 'factures.modele_personnalise' : 'factures.pdf';

    $pdf = PDF::loadView($view, compact('facture', 'options', 'montantLettre'));
    $pdfPath = storage_path("app/facture_{$facture->numero}.pdf");
    $pdf->save($pdfPath);

    $entreprise = $facture->entreprise;

    config([
            'mail.mailers.smtp.host' => $entreprise->smtp_host,
            'mail.mailers.smtp.port' => $entreprise->smtp_port,
            'mail.mailers.smtp.username' => $entreprise->smtp_user,
            'mail.mailers.smtp.password' => $entreprise->smtp_password,
            'mail.mailers.smtp.encryption' => $entreprise->smtp_encryption,
            'mail.from.address' => $entreprise->smtp_user,
            'mail.from.name' => $entreprise->nom,
        ]);

    try {
        \Mail::send('emails.facture', ['facture' => $facture], function ($message) use ($facture, $pdfPath) {
            $message->to($facture->client->email)
                ->subject('Votre facture n°' . $facture->numero)
                ->attach($pdfPath, [
                    'as' => 'facture_' . $facture->numero . '.pdf',
                    'mime' => 'application/pdf',
                ]);
        });

        unlink($pdfPath);

        return response()->json(['message' => 'Facture envoyée avec succès.']);
    } catch (\Exception $e) {
        \Log::error('Erreur envoi facture : ' . $e->getMessage());
        return response()->json(['message' => 'Erreur lors de l\'envoi de la facture.'], 500);
    }
}
    public function index()
    {
        $user = Auth::user();

        if (!$user || !$user->entreprise_id) {
            return response()->json(['message' => 'Utilisateur non autorisé ou entreprise manquante.'], 403);
        }

        $factures = Facture::with(['client', 'lignes'])
            ->where('id_entreprise', $user->entreprise_id)
            ->orderBy('date_emission', 'desc')
            ->get();

        return response()->json(['factures' => $factures]);
    }

    public function telecharger($id, Request $request)
{
    $facture = Facture::with(['client', 'entreprise', 'lignes'])->findOrFail($id);

    // 👇 Empêche d'accéder à une facture d'une autre entreprise
    if ($facture->entreprise->id_entreprise !== Auth::user()->entreprise_id) {
        return response()->json(['message' => 'Non autorisé'], 403);
    }

    $numberToWords = new NumberToWords();
    $numberTransformer = $numberToWords->getNumberTransformer('fr');
    $montantLettre = ucfirst($numberTransformer->toWords((int) $facture->total_ttc)) . ' dirhams';

    $options = [
        'afficher_signature' => $request->input('afficher_signature', true),
        'afficher_logo' => $request->input('afficher_logo', true),
        'afficher_footer' => $request->input('afficher_footer', true),
        'afficher_header' => $request->input('afficher_header', true),
    ];

    $pdf = Pdf::loadView('factures.pdf', compact('facture', 'options', 'montantLettre'));

    // ✅ Renvoie le PDF avec les bons headers pour React
    return response($pdf->output(), 200)
        ->header('Content-Type', 'application/pdf')
        ->header('Content-Disposition', 'attachment; filename="facture_' . $facture->numero . '.pdf"');
}
public function CustomTelecharger($id, Request $request)
{
    try {
        $facture = Facture::with(['client', 'entreprise', 'lignes'])->findOrFail($id);

        if ($facture->id_entreprise !== auth()->user()->entreprise_id) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $numberToWords = new NumberToWords();
        $numberTransformer = $numberToWords->getNumberTransformer('fr');
        $montantLettre = ucfirst($numberTransformer->toWords((int) $facture->total_ttc)) . ' dirhams';
$options = [
        'afficher_signature' => $request->input('afficher_signature', true),
        'afficher_logo' => $request->input('afficher_logo', true),
        'afficher_footer' => $request->input('afficher_footer', true),
        'afficher_header' => $request->input('afficher_header', true),
    ];
        $objet = $request->input('objet', 'Facturation des prestations');

        $pdf = Pdf::loadView('factures.modele_personnalise', [
            'facture' => $facture,
            'montantLettre' => $montantLettre,
            'options' => $options,
            'objet' => $objet,
            'logo' => storage_path('app/public/logo.png')

        ]);
        Log::info("paiement moyen facture: " . optional($facture->paiements->firstWhere('id_facture', $facture->id_facture))->moyen);
        // Retourne directement le PDF avec les bons headers
        return $pdf->stream("facture_{$facture->numero}.pdf");

    } catch (\Exception $e) {
        \Log::error("Erreur génération PDF: " . $e->getMessage());
        return response()->json([
            'message' => 'Erreur lors de la génération du PDF',
            'error' => $e->getMessage()
        ], 500);
    }
}
    public function update(Request $request, $id)
    {
        $request->validate([
            'statut' => 'required|in:brouillon,emise,payee,en_retard'
        ]);

        $facture = Facture::findOrFail($id);
        $facture->statut = $request->statut;
        $facture->save();

        return response()->json(['message' => 'Statut de la facture mis à jour avec succès']);
    }

    public function show($id)
    {
        $facture = Facture::with(['client', 'entreprise', 'paiements'])->findOrFail($id);
        return response()->json($facture);
    }
    public function destroy($id)
{
    try {
        $facture = Facture::findOrFail($id);

        // Vérifier que l'utilisateur a le droit de supprimer cette facture
        if ($facture->id_entreprise !== Auth::user()->entreprise_id) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        // Supprimer d'abord les lignes de facture associées
        LigneFacture::where('id_facture', $id)->delete();

        // Supprimer les paiements associés (si existent)
        if (method_exists($facture, 'paiements')) {
            $facture->paiements()->delete();
        }

        // Enfin supprimer la facture elle-même
        $facture->delete();

        return response()->json([
            'message' => 'Facture supprimée avec succès',
            'deleted_id' => $id
        ]);

    } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
        return response()->json(['message' => 'Facture non trouvée'], 404);
    } catch (\Exception $e) {
        Log::error("Erreur suppression facture: " . $e->getMessage());
        return response()->json([
            'message' => 'Erreur lors de la suppression de la facture',
            'error' => $e->getMessage()
        ], 500);
    }
}
}
