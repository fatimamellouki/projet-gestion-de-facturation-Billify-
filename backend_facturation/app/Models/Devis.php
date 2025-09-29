<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Devis extends Model
{
    protected $primaryKey = 'id'; // ou 'id_ligne' si tu veux
public $incrementing = true;
protected $keyType = 'int'; // ou 'string' si c’est un UUID

    protected $fillable = [
        'client_id',
        'entreprise_id',
        'numero',
        'date_devis',
        'total_ht',
        'total_tva',
        'total_ttc',
        'etat',
        'note',
    ];

    public function lignes()
{
    return $this->hasMany(LigneDevis::class, 'devis_id', 'id');
}

    public function client()
    {
        return $this->belongsTo(Client::class, 'client_id','id_client');
    }

     public function entreprise() {
        return $this->belongsTo(Entreprise::class, 'entreprise_id','id_entreprise');
     }
}
