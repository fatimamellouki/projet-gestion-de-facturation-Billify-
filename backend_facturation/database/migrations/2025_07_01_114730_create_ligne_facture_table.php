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
        Schema::create('ligne_facture', function (Blueprint $table) {
            $table->id('id_ligne');
            $table->unsignedBigInteger('id_facture');
            $table->unsignedBigInteger('id_produit')->nullable();
            $table->string('designation', 5000);
            $table->integer('quantite');
            $table->decimal('prix_unitaire_ht', 10, 2);
            $table->decimal('remise_pourcentage', 5, 2)->default(0);
            $table->decimal('montant_tva', 10, 2);
            $table->decimal('montant_total_ttc', 12, 2);

            // Clés étrangères
            $table->foreign('id_facture')
                  ->references('id_facture')
                  ->on('factures')
                  ->onDelete('cascade');

            $table->foreign('id_produit')
                  ->references('id_produit')
                  ->on('produits')
                  ->onDelete('restrict');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ligne_facture');
    }
};
