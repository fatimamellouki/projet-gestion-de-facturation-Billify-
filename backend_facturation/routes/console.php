<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schedule;

/*
|--------------------------------------------------------------------------
| Console Routes
|--------------------------------------------------------------------------
|
| Ce fichier est utilisé pour définir les commandes planifiées.
| Les commandes sont automatiquement chargées par Artisan.
|
*/

// Commande d'inspiration par défaut
Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Afficher une citation inspirante');

// ✅ Commande pour exécuter les relances tous les jours à 8h du matin
Schedule::command('factures:check-retard')->everyMinute();
