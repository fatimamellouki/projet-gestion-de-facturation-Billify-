<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Paiement extends Model
{
    use HasFactory;

    protected $table = 'paiement';
    protected $primaryKey = 'id_paiement';

    protected $fillable = [
        'date_paiement',
        'montant',
        'moyen',
        'id_facture'
    ];

    protected $casts = [
        'date_paiement' => 'datetime',
        'montant' => 'decimal:2',
    ];

    /**
     * Relation avec la facture
     */
    public function facture()
    {
        return $this->belongsTo(Facture::class, 'id_facture', 'id_facture');
    }

    /**
     * Accesseur pour le moyen de paiement formaté
     */
    public function getMoyenFormateAttribute()
    {
        return match($this->moyen) {
            'CB' => 'Carte Bancaire',
            'Virement' => 'Virement Bancaire',
            'Cheque' => 'Chèque',
            'Espèces' => 'Espèces',
            default => $this->moyen
        };
    }
}
