<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class Utilisateur extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'lastName',
        'email',
        'telephone',
        'address',
        'login',
        'passwordLogin',
        'role',
        'confirmPasswordLogin',
        'entreprise_id', // bien penser à ajouter ce champ ici
    ];

    public function entreprise()
    {
        // clé étrangère locale 'entreprise_id', clé primaire de l'entreprise 'id_entreprise'
        return $this->belongsTo(Entreprise::class, 'entreprise_id', 'id_entreprise');
    }
}
