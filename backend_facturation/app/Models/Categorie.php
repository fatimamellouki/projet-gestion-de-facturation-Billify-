<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Categorie extends Model
{
    use HasFactory;

    protected $table = 'categories';
    protected $primaryKey = 'id_categorie';

    protected $fillable = ['nom', 'id_entreprise'];

    public function produits()
    {
        return $this->hasMany(Produit::class, 'categorie_id');
    }

    // 🔁 Relation inverse vers l'entreprise
    public function entreprise()
    {
        return $this->belongsTo(Entreprise::class, 'id_entreprise');
    }
}
