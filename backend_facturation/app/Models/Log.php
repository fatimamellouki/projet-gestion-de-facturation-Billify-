<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Log extends Model
{
    use HasFactory;

    protected $table = 'log';
    protected $primaryKey = 'id_log';

    protected $fillable = [
        'id_utilisateur',
        'action',
        'date_heure',
        'entite',
        'entite_id'
    ];

    protected $casts = [
        'date_heure' => 'datetime',
    ];

    /**
     * Relation avec l'utilisateur
     */
    public function utilisateur()
    {
        return $this->belongsTo(utilisateur::class, 'id_utilisateur');
    }

    /**
     * Accesseur pour la date formatée
     */
    public function getDateHeureFormateAttribute()
    {
        return $this->date_heure?->format('d/m/Y H:i:s');
    }

    /**
     * Scope pour filtrer par entité
     */
    public function scopePourEntite($query, $entite, $entiteId)
    {
        return $query->where('entite', $entite)
                    ->where('entite_id', $entiteId);
    }
}
