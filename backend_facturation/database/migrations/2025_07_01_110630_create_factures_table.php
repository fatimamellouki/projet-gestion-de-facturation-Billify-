<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('factures', function (Blueprint $table) {
            $table->id('id_facture');

            $table->string('numero', 50);
            $table->date('date_emission');
            $table->date('date_echeance');

            $table->decimal('total_ht', 12, 2);
            $table->decimal('total_tva', 12, 2);
            $table->decimal('total_remise', 12, 2)->default(0);
            $table->decimal('total_ttc', 12, 2);

            $table->enum('statut', ['brouillon', 'emise', 'payee', 'en_retard'])->default('brouillon');

            // Relations
            $table->unsignedBigInteger('id_entreprise');
            $table->unsignedBigInteger('id_client');

            // Clés étrangères
            $table->foreign('id_entreprise')->references('id_entreprise')->on('entreprises')->onDelete('cascade');
            $table->foreign('id_client')->references('id_client')->on('clients')->onDelete('cascade');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('factures');
    }
};
