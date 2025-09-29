<?php
namespace App\Console\Commands;

use App\Models\Facture;
use App\Models\Relance;
use App\Mail\FactureRelanceMail;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;
use Carbon\Carbon;
use Illuminate\Support\Facades\Config;

class CheckFacturesRetard extends Command
{
    protected $signature = 'factures:check-retard';
    protected $description = 'Vérifie les factures en retard et envoie des relances automatiques';

    public function handle()
    {
        $factures = Facture::where('statut', '!=', 'payee')
            ->where('statut', '!=', 'en_retard')
            ->whereDate('date_echeance', '<', Carbon::now())
            ->get();




        foreach ($factures as $facture) {
            // Met à jour le statut
            $facture->update(['statut' => 'en_retard']);

            // Vérifie si une relance a déjà été envoyée
            $relanceExist = Relance::where('id_facture', $facture->id_facture)->exists();
            if (!$relanceExist) {
                $entreprise = $facture->entreprise; // ou $facture->client->entreprise

 config([
        'mail.mailers.smtp.transport' => 'smtp',
        'mail.mailers.smtp.host' => $entreprise->smtp_host,
        'mail.mailers.smtp.port' => $entreprise->smtp_port,
        'mail.mailers.smtp.username' => $entreprise->smtp_user,
        'mail.mailers.smtp.password' => $entreprise->smtp_password,
        'mail.mailers.smtp.encryption' => $entreprise->smtp_encryption,
        'mail.from.address' => $entreprise->smtp_user,
        'mail.from.name' => $entreprise->nom
    ]);
                // Envoie du mail
                Mail::to($facture->client->email)->send(new FactureRelanceMail($facture));

                // Enregistre la relance
                Relance::create([
                    'date_relance' => now(),
                    'type' => 'Email',
                    'status' => 'envoyee',
                    'id_facture' => $facture->id_facture
                ]);
            }
        }

        return Command::SUCCESS;
    }
}
