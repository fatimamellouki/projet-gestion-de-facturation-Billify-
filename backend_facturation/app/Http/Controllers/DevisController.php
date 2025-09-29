<?php
namespace App\Http\Controllers;

use App\Models\Devis;
use App\Models\LigneDevis;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use App\Models\Facture;
use Illuminate\Support\Facades\Log;
use App\Models\Entreprise;
use App\Models\Client;
use Barryvdh\DomPDF\Facade\Pdf;
use NumberToWords\NumberToWords;

class DevisController extends Controller
{


public function accepter($id)
{
    try {
        $devis = Devis::with('lignes')->findOrFail($id);

        $devis->etat = 'signé';
        $devis->save();

        // Récupérer le dernier numéro de facture pour cette entreprise
        $lastFacture = Facture::where('id_entreprise', $devis->entreprise_id)
            ->orderBy('id_facture', 'desc')
            ->first();

        // Générer le nouveau numéro de facture
        if ($lastFacture && preg_match('/FAC-(\d+)/', $lastFacture->numero, $matches)) {
            $nextNumber = (int)$matches[1] + 1;
            $numeroFacture = 'FAC-' . str_pad($nextNumber, 4, '0', STR_PAD_LEFT);
        } else {
            // Si aucune facture n'existe encore
            $numeroFacture = 'FAC-0001';
        }

        $facture = Facture::create([
            'numero' => $numeroFacture,
            'id_entreprise' => $devis->entreprise_id,
            'id_client' => $devis->client_id,
            'date_emission' => now(),
            'date_echeance' => now()->addMonth(),
            'total_ht' => $devis->total_ht,
            'total_tva' => $devis->total_tva,
            'total_remise' => 0,
            'total_ttc' => $devis->total_ttc,
            'statut' => 'emise',
        ]);

        foreach ($devis->lignes as $ligne) {
            $facture->lignes()->create([
                'id_produit' => $ligne->produit_id,
                'designation' => $ligne->designation,
                'quantite' => $ligne->quantite,
                'prix_unitaire_ht' => $ligne->prix_unitaire_ht,
                'remise_pourcentage' => 0,
                'montant_tva' => $ligne->montant_tva,
                'montant_total_ttc' => $ligne->montant_ttc,
            ]);
        }

        return response()->json([
            'message' => 'Devis accepté et transformé en facture',
            'facture_numero' => $numeroFacture
        ]);

    } catch (\Exception $e) {
        return response()->json([
            'message' => 'Erreur lors de la transformation du devis en facture',
            'error' => $e->getMessage(),
            'line' => $e->getLine(),
            'file' => $e->getFile(),
        ], 400);
    }
}
    public function countByEntreprise($id)
    {
        $count = Devis::where('entreprise_id', $id)->count();
        return response()->json(['count' => $count]);
    }
    public function getLastDeviId($id)
{
    $lastDevis = Devis::where('entreprise_id', $id)
        ->orderBy('id', 'desc')
        ->first();

    return response()->json([
        'last_id' => $lastDevis ? (int) str_replace('DEV-', '', $lastDevis->numero) : 0
    ]);
}

public function refuser($id)
{
    $devis = Devis::findOrFail($id);
    $devis->etat = 'refusé';
    $devis->save();

    return response()->json(['message' => 'Devis refusé']);
}


    public function store(Request $request)
    {
        $request->validate([
            'numero' => 'required|string|unique:devis,numero', // Ajout de la validation pour le numéro
            'client_id' => 'required|exists:clients,id_client',
            'date_devis' => 'required|date',
            'etat' => 'required|in:brouillon,Envoyé,signé,refusé',
            'note' => 'nullable|string',
            'lignes' => 'required|array|min:1',
            'lignes.*.produit_id' => 'nullable|exists:produits,id_produit',
            'lignes.*.designation' => 'required|string',
            'lignes.*.remise_pourcentage' => 'nullable|numeric|min:0',
           'lignes.*.montant_total_ttc' => 'nullable|numeric|min:0',
            'lignes.*.quantite' => 'required|integer|min:1',
            'lignes.*.prix_unitaire_ht' => 'required|numeric|min:0',
            'lignes.*.taux_tva' => 'required|numeric|min:0',
        ]);

        $entreprise_id = Auth::user()->entreprise_id;

        $numero = $request->numero;

        $total_ht = 0;
        $total_tva = 0;
        $total_ttc = 0;

        foreach ($request->lignes as $ligne) {
            $montant_ht = $ligne['prix_unitaire_ht'] * $ligne['quantite'];
            $montant_tva = ($montant_ht * $ligne['taux_tva']) / 100;
            $montant_ttc = $montant_ht + $montant_tva;

            $total_ht += $montant_ht;
            $total_tva += $montant_tva;
            $total_ttc += $montant_ttc;
        }

           // ✅ Enregistrer le devis
           $devis = Devis::create([
            'client_id' => $request->client_id,
            'entreprise_id' => $entreprise_id,
            'numero' => $numero,
            'date_devis' => $request->date_devis,
            'total_ht' => $total_ht,
            'total_tva' => $total_tva,
            'total_ttc' => $total_ttc,
            'etat' => $request->etat,
            'note' => $request->note,
        ]);

        // ✅ Enregistrer les lignes
        foreach ($request->lignes as $ligne) {
            $montant_ht = $ligne['prix_unitaire_ht'] * $ligne['quantite'];
            $montant_tva = ($montant_ht * $ligne['taux_tva']) / 100;
            $montant_ttc = $montant_ht + $montant_tva;

            LigneDevis::create([
                'devis_id' => $devis->id,
                'produit_id' => $ligne['produit_id'],
                'designation' => $ligne['designation'],
                'quantite' => $ligne['quantite'],
                'prix_unitaire_ht' => $ligne['prix_unitaire_ht'],
                'taux_tva' => $ligne['taux_tva'],
                'montant_ht' => $montant_ht,
                'montant_tva' => $montant_tva,
                'montant_ttc' => $montant_ttc,
            ]);
        }

        if($devis->etat ==='signé'){
            $this->accepter($devis->id);
        }

        return response()->json(['message' => 'Devis créé avec succès', 'devis' => $devis], 201);
    }

    // ✅ Afficher tous les devis d'une entreprise
    public function index()
    {
        $utilisateur = Auth::user();
        $entreprise_id = $utilisateur->entreprise_id;
        $devis = Devis::with('client', 'lignes')->where('entreprise_id', $entreprise_id)->get();
        return response()->json($devis);
    }

    // ✅ Afficher un seul devis
    public function show($id)
    {
        $devis = Devis::with('client', 'lignes')->findOrFail($id);
        return response()->json($devis);
    }

    // ✅ Supprimer devis
    public function destroy($id)
    {
        $devis = Devis::findOrFail($id);
        $devis->delete();
        return response()->json(['message' => 'Devis supprimé avec succès']);
    }
    public function mesDevis()
{
    $utilisateur = Auth::user();

    // Vérifie si l'utilisateur est lié à un client
    if (!$utilisateur->id) {
        return response()->json(['message' => 'Utilisateur non autorisé'], 403);
    }
$client=Client::where('email',$utilisateur->email)->first();
    // Récupérer tous les devis liés au client connecté
    $devis = Devis::with('entreprise', 'lignes')
        ->where('client_id', $client->id_client)
        ->get();

    return response()->json($devis);
}
public function envoyerDevisParMail(Request $request, $id)
{
    $devis = Devis::findOrFail($id);
    $devis->load('entreprise', 'client');

    $modele = $request->query('modele', 'standard'); // 'standard' ou 'personnalise'
    $options = $request->all();

    $numberToWords = new NumberToWords();
    $numberTransformer = $numberToWords->getNumberTransformer('fr');
    $montantLettre = ucfirst($numberTransformer->toWords((int) $devis->total_ttc)) . ' dirhams';

    // Choix du modèle Blade à utiliser
    $view = $modele === 'personnalise' ? 'devis.modele_personnalise' : 'devis.pdf';

    $pdf = PDF::loadView($view, compact('devis', 'options', 'montantLettre'));
    $pdfPath = storage_path("app/devis_{$devis->numero}.pdf");
    $pdf->save($pdfPath);

    $entreprise = $devis->entreprise;

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
        \Mail::send('emails.devis', ['devis' => $devis], function ($message) use ($devis, $pdfPath) {
            $message->to($devis->client->email)
                ->subject('Votre devis n°' . $devis->numero)
                ->attach($pdfPath, [
                    'as' => 'devis_' . $devis->numero . '.pdf',
                    'mime' => 'application/pdf',
                ]);
        });

        unlink($pdfPath);

        return response()->json(['message' => 'devis envoyée avec succès.']);
    } catch (\Exception $e) {
        \Log::error('Erreur envoi devis : ' . $e->getMessage());
        return response()->json(['message' => 'Erreur lors de l\'envoi de devis.'], 500);
    }
}
public function CustomTelecharger($id, Request $request)
{
    try {
        $devis = Devis::with(['client', 'entreprise', 'lignes'])->findOrFail($id);

        if ($devis->entreprise->id_entreprise !==  Auth::user()->entreprise_id) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $numberToWords = new NumberToWords();
        $numberTransformer = $numberToWords->getNumberTransformer('fr');
        $montantLettre = ucfirst($numberTransformer->toWords((int) $devis->total_ttc)) . ' dirhams';
$options = [
        'afficher_signature' => $request->input('afficher_signature', true),
        'afficher_logo' => $request->input('afficher_logo', true),
        'afficher_footer' => $request->input('afficher_footer', true),
        'afficher_header' => $request->input('afficher_header', true),
    ];
        $objet = $request->input('objet', 'Facturation des prestations');

        $pdf = Pdf::loadView('devis.modele_personnalise', [
            'devis' => $devis,
            'montantLettre' => $montantLettre,
            'options' => $options,
            'objet' => $objet,
            'logo' => storage_path('app/public/logo.png')

        ]);
    return $pdf->stream("facture_{$devis->numero}.pdf");

    } catch (\Exception $e) {
        \Log::error("Erreur génération PDF: " . $e->getMessage());
        return response()->json([
            'message' => 'Erreur lors de la génération du PDF',
            'error' => $e->getMessage()
        ], 500);
    }
}
 public function telecharger($id, Request $request)
{
    $devis = Devis::with(['client', 'entreprise', 'lignes'])->findOrFail($id);

    // 👇 Empêche d'accéder à une facture d'une autre entreprise
    if ($devis->entreprise->id_entreprise !== Auth::user()->entreprise_id) {
        return response()->json(['message' => 'Non autorisé'], 403);
    }

    $numberToWords = new NumberToWords();
    $numberTransformer = $numberToWords->getNumberTransformer('fr');
    $montantLettre = ucfirst($numberTransformer->toWords((int) $devis->total_ttc)) . ' dirhams';

    $options = [
        'afficher_signature' => $request->input('afficher_signature', true),
        'afficher_logo' => $request->input('afficher_logo', true),
        'afficher_footer' => $request->input('afficher_footer', true),
        'afficher_header' => $request->input('afficher_header', true),
    ];

    $pdf = Pdf::loadView('devis.pdf', compact('devis', 'options', 'montantLettre'));

    // ✅ Renvoie le PDF avec les bons headers pour React
    return response($pdf->output(), 200)
        ->header('Content-Type', 'application/pdf')
        ->header('Content-Disposition', 'attachment; filename="facture_' . $devis->numero . '.pdf"');
}
public function update(Request $request, $id)
{
    $request->validate([
        'etat' => 'required|in:brouillon,Envoyé,signé,refusé'
    ]);

    $devis = Devis::findOrFail($id);
    $devis->etat = $request->etat;
    $devis->save();

        if($devis->etat ==='signé'){
            $this->accepter($devis->id);
        }
    return response()->json([
        'message' => 'État du devis mis à jour avec succès',
        'devis' => $devis
    ]);
}
}
