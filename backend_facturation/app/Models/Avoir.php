<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Avoir extends Model
{
    use HasFactory;

    protected $table = 'avoirs';
    protected $primaryKey = 'id_avoir';

    protected $fillable = [
        'numero',
        'date_emission',
        'motif',
        'total_tcc',
        'id_facture'
    ];

   protected $casts = [
        'total_tcc' => 'float',
        'date_emission' => 'date',
    ];
    /**
     * Relation avec la facture
     */
    public function facture()
    {
        return $this->belongsTo(Facture::class, 'id_facture', 'id_facture');
    }
}
