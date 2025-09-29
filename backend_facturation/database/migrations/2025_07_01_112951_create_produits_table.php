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
        Schema::create('produits', function (Blueprint $table) {
            $table->id('id_produit'); // Clé primaire auto-incrémentée
            $table->string('reference', 50); // Correction orthographique "referance" -> "reference"
            $table->string('nom', 100);
            $table->text('description'); // Retrait de la limite de 50 caractères pour un champ text
            $table->decimal('prix_unitaire_ht', 10, 2)->default(0);
            $table->decimal('taux_tva', 5, 2);
            $table->string('image_url', 255)->nullable();
            $table->unsignedBigInteger('entreprise_id')->nullable();
            $table->unsignedBigInteger('categorie_id')->nullable();

            $table->foreign('categorie_id')
            ->references('id_categorie')
            ->on('categories')
            ->onDelete('set null'); // Si la catégorie est supprimée

            $table->foreign('entreprise_id')
                ->references('id_entreprise')
                ->on('entreprises')
                ->onDelete('cascade');
            $table->timestamps(); // created_at et updated_at
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('produits');
    }
};
