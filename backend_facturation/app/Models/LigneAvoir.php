<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LigneAvoir extends Model
{
    use HasFactory;

    protected $table = 'ligne_avoir';
    protected $primaryKey = 'id_ligne_avoir';

    protected $fillable = [
        'id_avoir',
        'id_produit',
        'quantite',
        'prix_unitaire_ht',
        'remise_pourcentage',
        'montant_tva',
        'montant_total_ttc'
    ];

    protected $casts = [
        'prix_unitaire_ht' => 'decimal:2',
        'remise_pourcentage' => 'decimal:2',
        'montant_tva' => 'decimal:2',
        'montant_total_ttc' => 'decimal:2',
    ];

    /**
     * Relation avec l'avoir
     */
    public function avoir()
    {
        return $this->belongsTo(Avoir::class, 'id_avoir', 'id_avoir');
    }

    /**
     * Relation avec le produit
     */
    public function produit()
    {
        return $this->belongsTo(Produit::class, 'id_produit', 'id_produit');
    }

    /**
     * Calcul du montant HT après remise
     */
    public function getMontantHtAttribute()
    {
        $montant = $this->prix_unitaire_ht * $this->quantite;
        return $montant - ($montant * $this->remise_pourcentage / 100);
    }
}
