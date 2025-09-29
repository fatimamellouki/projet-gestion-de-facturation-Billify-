<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Client extends Model
{
    use HasFactory;

    protected $primaryKey = 'id_client';

    protected $fillable = [
        'nom',
        'adresse',
        'email',
        'telephone',
        'entreprise_id',
        'photo_contact_url',
    ];
    public function entreprise()
    {
        // clé étrangère locale 'entreprise_id', clé primaire de l'entreprise 'id_entreprise'
        return $this->belongsTo(Entreprise::class, 'entreprise_id', 'id_entreprise');
    }
}
