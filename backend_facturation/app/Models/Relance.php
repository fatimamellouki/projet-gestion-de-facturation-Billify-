<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Relance extends Model
{
    use HasFactory;

    protected $table = 'relance';
    protected $primaryKey = 'id_relance';

    protected $fillable = [
        'date_relance',
        'type',
        'status',
        'id_facture'
    ];

    protected $casts = [
        'date_relance' => 'datetime',
    ];

    /**
     * Relation avec la facture
     */
    public function facture()
    {
        return $this->belongsTo(Facture::class, 'id_facture', 'id_facture');
    }

    /**
     * Accesseur pour le type formaté
     */
    public function getTypeFormateAttribute()
    {
        return match($this->type) {
            'Notification' => 'Notification',
            'Email' => 'E-mail',
            'SMS' => 'SMS',
            'Appel' => 'Appel téléphonique',
            default => $this->type
        };
    }

    /**
     * Accesseur pour le statut formaté
     */
    public function getStatusFormateAttribute()
    {
        return match($this->status) {
            'envoyee' => 'Envoyée',
            'reussie' => 'Réussie',
            'echouee' => 'Échouée',
            default => $this->status
        };
    }
}
