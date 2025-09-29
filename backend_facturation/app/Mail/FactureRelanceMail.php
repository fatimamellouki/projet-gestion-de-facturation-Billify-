<?php
namespace App\Mail;

use App\Models\Facture;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class FactureRelanceMail extends Mailable
{
    use Queueable, SerializesModels;

    public $facture;

    public function __construct(Facture $facture)
    {
        $this->facture = $facture;
    }

    public function build()
    {
        return $this->subject('Relance - Facture en retard')
                    ->markdown('emails.facture_relance');
    }
}
