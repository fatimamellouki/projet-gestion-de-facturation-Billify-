<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Entreprise;
use App\Models\Utilisateur;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use App\Mail\RelanceFactureMail;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Config;

class EntrepriseController extends Controller
{

public function envoyerEmailTest(Request $request)
{
    $request->validate([
        'email' => 'required|email',
        'nom' => 'required|string',
    ]);

    $entreprise = auth()->user()->entreprise;

    // Appliquer la configuration SMTP dynamique
    Config::set('mail.mailers.smtp', [
        'transport' => 'smtp',
        'host' => $entreprise->smtp_host,
        'port' => $entreprise->smtp_port,
        'encryption' => $entreprise->smtp_encryption,
        'username' => $entreprise->smtp_user,
        'password' => $entreprise->smtp_password,
        'timeout' => null,
    ]);

    Config::set('mail.from.address', $entreprise->smtp_user);
    Config::set('mail.from.name', $entreprise->nom);

    // Envoi de l’e-mail
    Mail::to($request->email)->send(new RelanceFactureMail($request->nom));

    return response()->json(['message' => 'Email envoyé !']);
}

    public function updateSmtp(Request $request)
    {
        $request->validate([
            'smtp_host' => 'required|string',
            'smtp_port' => 'required|string',
            'smtp_user' => 'required|email',
            'smtp_password' => 'required|string',
            'smtp_encryption' => 'required|string',
        ]);

 $utilisateur = Auth::user();

        if (!$utilisateur) {
            return response()->json(['message' => 'Non authentifié'], 401);
        }

        Log::info('Utilisateur entreprise info', ['user_id' => $utilisateur->id]);

        if (!$utilisateur->entreprise) {
            return response()->json(['message' => 'Entreprise non trouvée'], 404);
        }

        $entreprise = $utilisateur->entreprise;
        $entreprise->update([
            'smtp_host' => $request->smtp_host,
            'smtp_port' => $request->smtp_port,
            'smtp_user' => $request->smtp_user,
            'smtp_password' => $request->smtp_password,
            'smtp_encryption' => $request->smtp_encryption,
        ]);

        return response()->json(['message' => 'Configuration SMTP enregistrée']);
    }
    public function info()
    {
        $utilisateur = Auth::user();

        if (!$utilisateur) {
            return response()->json(['message' => 'Non authentifié'], 401);
        }

        Log::info('Utilisateur entreprise info', ['user_id' => $utilisateur->id]);

        if (!$utilisateur->entreprise) {
            return response()->json(['message' => 'Entreprise non trouvée'], 404);
        }

        $entreprise = $utilisateur->entreprise;

        return response()->json([
            'entreprise' => [
                'id_entreprise' => $entreprise->id_entreprise,
                'nom' => $entreprise->nom,
                'logo_url' => $entreprise->logo_url ? asset('storage/' . $entreprise->logo_url) : null,
                'raison_sociale' => $entreprise->raison_sociale,
                // Ajoutez d'autres champs nécessaires
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'matricule_fiscale' => 'nullable|string|max:50',
            'identifiant_unique' => 'nullable|string|max:50',
            'nom' => 'required|string|max:100',
            'raison_sociale' => 'nullable|string|max:150',
            'adresse' => 'nullable|string',
            'zone_geographique' => 'nullable|string|max:100',
            'type_entreprise' => 'nullable|in:PME,ETI,Grand compte',
            'email' => 'nullable|email|max:100|unique:entreprises,email',
            'logo_url' => 'nullable|file|mimes:jpg,jpeg,png,svg|max:5000',
            'signature_url' => 'nullable|file|mimes:jpg,jpeg,png,svg|max:5000',
            'entete_facture' => 'nullable|file|mimes:jpg,jpeg,png,pdf,txt,html|max:5000',
            'pied_facture' => 'nullable|file|mimes:jpg,jpeg,png,pdf,txt,html|max:5000',
            'utilisateur_id' => 'required|exists:utilisateurs,id',
        ]);

        try {
            DB::beginTransaction();

            $entreprise = new Entreprise();
            $entreprise->fill($validated);

            // Gestion des fichiers
            $fileFields = [
                'logo_url' => 'logos',
                'signature_url' => 'signatures',
                'entete_facture' => 'facture_entetes',
                'pied_facture' => 'facture_pieds'
            ];

            foreach ($fileFields as $field => $directory) {
                if ($request->hasFile($field)) {
                    $entreprise->$field = $request->file($field)->store($directory, 'public');
                }
            }

            $entreprise->save();

            // Association à l'utilisateur
            $utilisateur = Utilisateur::find($validated['utilisateur_id']);
            $utilisateur->entreprise_id = $entreprise->id_entreprise;
            $utilisateur->save();

            DB::commit();

            
            return response()->json([
                'message' => 'Entreprise créée avec succès',
                'entreprise' => $entreprise
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Erreur création entreprise', ['error' => $e->getMessage()]);
            return response()->json([
                'message' => 'Erreur lors de la création',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function update(Request $request)
    {
        $utilisateur = Auth::user();

        if (!$utilisateur || !$utilisateur->entreprise) {
            return response()->json(['message' => 'Entreprise non trouvée'], 404);
        }

        $entreprise = $utilisateur->entreprise;

        $validator = Validator::make($request->all(), [
            'matricule_fiscale' => 'nullable|string|max:50',
            'identifiant_unique' => 'nullable|string|max:50',
            'nom' => 'nullable|string|max:100',
            'raison_sociale' => 'nullable|string|max:150',
            'adresse' => 'nullable|string',
            'zone_geographique' => 'nullable|string|max:100',
            'type_entreprise' => 'nullable|in:PME,ETI,Grand compte',
            'email' => 'nullable|email|max:100|unique:entreprises,email,'.$entreprise->id_entreprise.',id_entreprise',
            'logo_url' => 'nullable|file|mimes:jpg,jpeg,png,svg|max:2048',
            'signature_url' => 'nullable|file|mimes:jpg,jpeg,png,svg|max:2048',
            'entete_facture' => 'nullable|file|mimes:jpg,jpeg,png,pdf,txt,html|max:2048',
            'pied_facture' => 'nullable|file|mimes:jpg,jpeg,png,pdf,txt,html|max:2048',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            DB::beginTransaction();

            $entreprise->fill($request->except(['logo_url', 'signature_url', 'entete_facture', 'pied_facture']));

            $fileFields = [
                'logo_url' => 'logos',
                'signature_url' => 'signatures',
                'entete_facture' => 'facture_entetes',
                'pied_facture' => 'facture_pieds'
            ];

            foreach ($fileFields as $field => $directory) {
                if ($request->hasFile($field)) {
                    // Supprimer l'ancien fichier
                    if ($entreprise->$field) {
                        Storage::disk('public')->delete($entreprise->$field);
                    }
                    // Stocker le nouveau
                    $entreprise->$field = $request->file($field)->store($directory, 'public');
                } elseif ($request->has($field) && $request->input($field) === null) {
                    // Permet de supprimer le fichier si on envoie explicitement null
                    if ($entreprise->$field) {
                        Storage::disk('public')->delete($entreprise->$field);
                    }
                    $entreprise->$field = null;
                }
            }

            $entreprise->save();
            DB::commit();

            return response()->json([
                'message' => 'Entreprise mise à jour avec succès',
                'entreprise' => $entreprise
            ], 200);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Erreur mise à jour entreprise', [
                'user_id' => $utilisateur->id,
                'error' => $e->getMessage()
            ]);
            return response()->json([
                'message' => 'Erreur lors de la mise à jour',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function show()
    {
        $utilisateur = Auth::user();

        if (!$utilisateur) {
            return response()->json(['message' => 'Non authentifié'], 401);
        }

        if (!$utilisateur->entreprise) {
            return response()->json(['message' => 'Entreprise non trouvée'], 404);
        }

        $entreprise = $utilisateur->entreprise;

        // Formater les URLs des fichiers
        $entreprise->logo_url = $entreprise->logo_url ? asset('storage/' . $entreprise->logo_url) : null;
        $entreprise->signature_url = $entreprise->signature_url ? asset('storage/' . $entreprise->signature_url) : null;
        $entreprise->entete_facture = $entreprise->entete_facture ? asset('storage/' . $entreprise->entete_facture) : null;
        $entreprise->pied_facture = $entreprise->pied_facture ? asset('storage/' . $entreprise->pied_facture) : null;

        return response()->json($entreprise);
    }

    public function index()
    {
        return response()->json(
            Entreprise::select('id_entreprise as id', 'nom')->get()
        );
    }
}
