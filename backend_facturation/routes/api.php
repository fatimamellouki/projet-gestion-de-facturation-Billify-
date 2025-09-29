<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\Api\LoginController;
use App\Http\Controllers\Api\EntrepriseController;
use App\Http\Controllers\ProduitController;
use App\Http\Controllers\ClientController;
use App\Http\Controllers\FactureController;
use App\Http\Controllers\PaiementController;
use App\Http\Controllers\StatistiqueController;
use App\Http\Controllers\AvoirController;
use App\Http\Controllers\CategorieController;
use App\Http\Controllers\DevisController;
use App\Http\Controllers\DemandeAccesController;
use App\Http\Controllers\ForgotPasswordController;
Route::get('/inscription_secure_programer', function () {
    return "OK programmeur";
})->middleware('only.programmer');

Route::post('/forgot-password', [ForgotPasswordController::class, 'sendResetLink']);
Route::post('/reset-password', [ForgotPasswordController::class, 'resetPassword']);
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::put('/me', [AuthController::class, 'update']);
});

Route::post('/demande-acces', [DemandeAccesController::class, 'envoyer'])->middleware('throttle:demandeAccesLimit');
Route::post('/contact', [DemandeAccesController::class, 'envoyerContact'])->middleware('throttle:demandeAccesLimit');


Route::middleware('auth:sanctum')->group(function () {
Route::post('/entreprise/envoyer-email', [App\Http\Controllers\Api\EntrepriseController::class, 'envoyerEmailTest']);

Route::post('/entreprise/config-smtp', [App\Http\Controllers\Api\EntrepriseController::class, 'updateSmtp']);
});
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/mes-devis', [DevisController::class, 'mesDevis']);
    Route::post('/devis/{id}/accepter', [DevisController::class, 'accepter']);
    Route::post('/devis/{id}/refuser', [DevisController::class, 'refuser']);
    Route::put('devis/{id}', [DevisController::class, 'update']);
});

Route::middleware('auth:sanctum')->prefix('statistiques')->group(function () {
    Route::get('/globales', [StatistiqueController::class, 'globales']);
    Route::get('/factures-par-mois', [StatistiqueController::class, 'facturesParMois']);
    Route::get('/chiffre-affaire-par-mois', [StatistiqueController::class, 'chiffreAffaireParMois']);
    Route::get('/devis-repartition', [StatistiqueController::class, 'devisRepartition']);
    Route::get('/retards-paiement', [StatistiqueController::class, 'retardsPaiement']);
});

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/devis', [DevisController::class, 'index']);
    Route::post('/devis', [DevisController::class, 'store']);
    Route::get('/devis/{id}', [DevisController::class, 'show']);
    Route::post('/devis/{id}/CustomTelecharger', [DevisController::class, 'CustomTelecharger']);
    Route::post('/devis/{id}/telecharger', [DevisController::class, 'telecharger']);
    Route::post('/devis/{id}/envoyer', [DevisController::class, 'envoyerDevisParMail']);
    Route::get('/entreprises/{id}/devis/count', [DevisController::class, 'countByEntreprise']);
    Route::get('/entreprises/{id}/devis/last-id', [DevisController::class, 'getLastDeviId']);
    Route::delete('/devis/{id}', [DevisController::class, 'destroy']);
});
Route::middleware('auth:sanctum')->group(function () {
Route::get('/categories', [CategorieController::class, 'index']);
Route::post('/categories', [CategorieController::class, 'store']);
});
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/avoirs', [AvoirController::class, 'index']);
    Route::post('/avoirs', [AvoirController::class, 'store']);
});

// Route::middleware('auth:sanctum')->group(function () {
//     Route::get('/statistiques/globales', [StatistiqueController::class, 'globales']);
//     Route::get('/statistiques/factures-par-mois', [StatistiqueController::class, 'facturesParMois']);
// });

Route::middleware('auth:sanctum')->group(function(){
    Route::get('/entreprises/{id}count', [FactureController::class, 'countByEntreprise']);
    Route::post('/factures', [FactureController::class, 'store']);
    Route::get('/factures',[FactureController::class, 'index']);
    Route::get('/factures/{id}/telecharger', [FactureController::class, 'telecharger']);
    Route::post('/factures/{id}/telecharger', [FactureController::class, 'telecharger']);
    Route::get('/factures/{id}', [FactureController::class, 'show']);
    Route::put('/factures/{id}', [FactureController::class, 'update']);
    Route::delete('/factures/{id}', [FactureController::class, 'destroy']);
    Route::post('/factures/{id}/envoyer', [FactureController::class, 'envoyerFactureParMail']);
    Route::get('/entreprises/{id}/factures/last-id', [FactureController::class, 'getLastFactureId']);
    Route::post('/factures/{id}/CustomTelecharger', [FactureController::class, 'CustomTelecharger']);
    Route::get('/factures/{id}/CustomTelecharger', [FactureController::class, 'CustomTelecharger']);
    Route::get('/factures/{id}/CustomTelecharger', [FactureController::class, 'CustomTelecharger'])
        ->name('factures.telecharger');
    Route::post('/paiements', [PaiementController::class, 'store']);
});
Route::middleware('auth:sanctum')->group(function(){
Route::get('/utilisateurs/clients', [ClientController::class, 'clients']);
Route::get('/utilisateurs/franchises', [AuthController::class, 'franchises']);
Route::get('/utilisateurs/comptables', [AuthController::class, 'comptables']);
});
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/client/profile', [ClientController::class, 'profil']);
    Route::put('/client/update', [ClientController::class, 'updateProfil']);
    Route::put('/clients/{id}', [ClientController::class, 'update']);
    Route::get('/client/factures', [ClientController::class, 'mesFactures']);
    Route::delete('/clients/{id}', [ClientController::class, 'destroy']);
});

Route::middleware('auth:sanctum')->group(function () {
    Route::apiResource('produits', ProduitController::class);
});
Route::get('/login', function () {
    return 'Page de connexion ici';  // ou rediriger vers front React par exemple
})->name('login');
Route::post('/login', [LoginController::class, 'login'])->middleware('throttle:loginLimit');
Route::post('/register', [AuthController::class, 'register']);

Route::middleware('auth:sanctum')->group(function() {
Route::post('/entreprise',[EntrepriseController::class, 'store']);
Route::put('/entreprise', [EntrepriseController::class, 'update']);
Route::get('/entreprise_show', [EntrepriseController::class, 'show']);
Route::get('/entreprises', [EntrepriseController::class, 'index']);
});
Route::middleware('auth:sanctum')->get('/entreprise/info', [EntrepriseController::class, 'info']);

Route::get('/test-log', function () {
    \Log::info('Test log fonctionne');
    return 'Log ok';
});
