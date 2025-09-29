<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Produit extends Model
{
    use HasFactory;
    protected $table = 'produits';

    protected $primaryKey = 'id_produit';
    protected $fillable = [
        'reference',
        'nom',
        'description',
        'prix_unitaire_ht',
        'taux_tva',
        'image_url',
        'entreprise_id', // ✅ bien présent ici
        'categorie_id'

    ];

    /**
     * Les attributs qui doivent être cachés pour les tableaux.
     *
     * @var array
     */
    protected $hidden = [
        // Ajoutez ici les champs que vous ne voulez pas inclure dans les réponses JSON
    ];

    /**
     * Les attributs qui doivent être convertis en types natifs.
     *
     * @var array
     */
    protected $casts = [
        'prix_unitaire_ht' => 'decimal:2',
        'taux_tva' => 'decimal:2',
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];
public function entreprise()
{
    return $this->belongsTo(Entreprise::class, 'entreprise_id', 'id_entreprise');
}
    /**
     * Calcul du prix TTC (accesseur)
     */
    public function getPrixTtcAttribute()
    {
        return $this->prix_unitaire_ht * (1 + $this->taux_tva / 100);
    }
    public function categorie()
{
    return $this->belongsTo(Categorie::class, 'categorie_id');
}
}
