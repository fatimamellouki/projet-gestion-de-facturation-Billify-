<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Entreprise extends Model
{
    use HasFactory;

    protected $table = 'entreprises';

    protected $primaryKey = 'id_entreprise';

    protected $fillable = [
        'matricule_fiscale',
        'identifiant_unique',
        'nom',
        'raison_sociale',
        'adresse',
        'zone_geographique',
        'type_entreprise',
        'email',
        'logo_url',
        'signature_url',
        'entete_facture',
        'pied_facture',

        // Champs SMTP
        'smtp_host',
        'smtp_port',
        'smtp_user',
        'smtp_password',
        'smtp_encryption',
    ];

    public function utilisateurs()
    {
        return $this->hasMany(Utilisateur::class, 'entreprise_id', 'id_entreprise');
    }

    public function produits()
    {
        return $this->hasMany(Produit::class, 'entreprise_id', 'id_entreprise');
    }

    public $timestamps = true;
}
