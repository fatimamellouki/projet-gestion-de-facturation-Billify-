<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LigneFacture extends Model
{
    use HasFactory;

    protected $table = 'ligne_facture';
    protected $primaryKey = 'id_ligne';

    protected $fillable = [
        'id_facture',
        'id_produit',
        'designation',
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
     * Relation avec la facture
     */
    public function facture()
    {
        return $this->belongsTo(Facture::class, 'id_facture', 'id_facture');
    }

    /**
     * Relation avec le produit
     */
    public function produit()
    {
        return $this->belongsTo(Produit::class, 'id_produit', 'id_produit');
    }

    /**
     * Calcul du montant HT après remise (accesseur)
     */
    public function getMontantHtAttribute()
    {
        $montant = $this->prix_unitaire_ht * $this->quantite;
        return $montant - ($montant * $this->remise_pourcentage / 100);
    }

    /**
     * Calcul du montant de la remise (accesseur)
     */
    public function getMontantRemiseAttribute()
    {
        return ($this->prix_unitaire_ht * $this->quantite) * ($this->remise_pourcentage / 100);
    }
}
