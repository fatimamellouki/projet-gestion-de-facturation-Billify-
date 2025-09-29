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
       Schema::create('entreprises', function (Blueprint $table) {
    $table->id('id_entreprise'); // Primary key
    $table->string('matricule_fiscale', 50)->nullable();
    $table->string('identifiant_unique', 50)->nullable();
    $table->string('nom', 100)->nullable();
    $table->string('raison_sociale', 150)->nullable();
    $table->text('adresse')->nullable();
    $table->string('zone_geographique', 100)->nullable();
    $table->enum('type_entreprise', ['PME', 'ETI', 'Grand compte'])->nullable();
    $table->string('email', 100)->nullable();
    $table->string('logo_url', 255)->nullable();        // pour logo
    $table->string('signature_url', 255)->nullable();   // ✅ nouveau champ pour signature
    $table->text('entete_facture')->nullable();
    $table->text('pied_facture')->nullable();
    $table->timestamps();
});

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('entreprises');
    }
};
