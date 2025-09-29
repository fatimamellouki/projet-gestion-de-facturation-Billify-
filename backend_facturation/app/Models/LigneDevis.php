<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LigneDevis extends Model
{
    protected $fillable = [
        'devis_id',
        'produit_id',
        'designation',
        'quantite',
        'prix_unitaire_ht',
        'taux_tva',
        'montant_ht',
        'montant_tva',
        'montant_ttc',
    ];

    public function devis()
    {
        return $this->belongsTo(Devis::class);
    }

    public function produit()
    {
        return $this->belongsTo(Produit::class);
    }
}
