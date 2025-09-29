<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Facture extends Model
{
    use HasFactory;

    protected $primaryKey = 'id_facture';

    protected $fillable = [
        'numero',
        'date_emission',
        'date_echeance',
        'total_ht',
        'total_tva',
        'total_remise',
        'total_ttc',
        'statut',
        'id_entreprise',
        'id_client',
    ];

    // Relations
    public function entreprise() {
        return $this->belongsTo(Entreprise::class, 'id_entreprise');
    }
    public function avoirs()
{
    return $this->hasMany(Avoir::class, 'id_facture', 'id_facture');
}

    public function lignes()
{
    return $this->hasMany(LigneFacture::class, 'id_facture', 'id_facture');
}

    public function client() {
        return $this->belongsTo(Client::class, 'id_client');
    }
    public function paiements()
{
    return $this->hasMany(Paiement::class, 'id_facture', 'id_facture');
}
}
