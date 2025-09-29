<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('avoirs', function (Blueprint $table) {
            $table->id('id_avoir'); // Clé primaire auto-incrémentée
            $table->string('numero', 50); // Numéro de l'avoir
            $table->date('date_emission'); // Date d'émission de l'avoir
            $table->text('motif');
            $table->decimal('total_tcc', 12, 2); // Total TTC de l'avoir
            $table->unsignedBigInteger('id_facture'); // ID de la facture liée
            $table->foreign('id_facture')->references('id_facture')->on('factures')->onDelete('cascade');
            $table->timestamps();

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('avoirs');
    }
};
