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
        Schema::create('log', function (Blueprint $table) {
            $table->id('id_log');
            $table->unsignedBigInteger('id_utilisateur')->nullable();
            $table->text('action')->nullable();
            $table->dateTime('date_heure')->nullable();
            $table->string('entite', 50)->nullable();
            $table->unsignedBigInteger('entite_id')->nullable();

            // Clé étrangère vers utilisateur
            $table->foreign('id_utilisateur')
                  ->references('id')
                  ->on('utilisateurs') // Supposant que votre table utilisateur s'appelle 'users'
                  ->onDelete('set null');

            // Index supplémentaires
            $table->index('id_utilisateur');
            $table->index(['entite', 'entite_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('log');
    }
};
