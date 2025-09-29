<?php

namespace App\Jobs;

use App\Models\Facture;
use App\Models\Relance;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class RelancerFacturesEnRetard implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;


public function handle(): void
{
    Log::info('🔁 Job RelancerFacturesEnRetard démarré');

    $factures = Facture::where('statut', 'en_retard')
        ->with('client')
        ->get();

    foreach ($factures as $facture) {
        Log::info("📄 Facture trouvée : ID {$facture->id_facture}");

        $relanceExiste = Relance::where('id_facture', $facture->id_facture)->exists();

        if (!$relanceExiste) {
            try {
                    Log::info("📧 Simulation d'envoi mail à {$facture->client->email}");

                Log::info("📧 Envoi mail à {$facture->client->email}");
                Mail::to($facture->client->email)
                    ->send(new \App\Mail\RelanceFactureMail($facture));

                Relance::create([
                    'date_relance' => Carbon::now(),
                    'type' => 'Email',
                    'status' => 'reussie',
                    'id_facture' => $facture->id_facture
                ]);

                Log::info("✅ Relance créée");
            } catch (\Exception $e) {
                Log::error("❌ Échec envoi relance : " . $e->getMessage());

                Relance::create([
                    'date_relance' => Carbon::now(),
                    'type' => 'Email',
                    'status' => 'echouee',
                    'id_facture' => $facture->id_facture
                ]);
            }
        } else {
            Log::info("⛔ Relance déjà existante pour facture {$facture->id_facture}");
        }
    }
}

}
