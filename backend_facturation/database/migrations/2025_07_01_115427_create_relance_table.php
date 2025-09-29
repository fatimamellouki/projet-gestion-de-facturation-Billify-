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
        Schema::create('relance', function (Blueprint $table) {
            $table->id('id_relance');
            $table->dateTime('date_relance')->nullable();
            $table->enum('type', ['Notification', 'Email', 'SMS', 'Appel'])->nullable();
            $table->enum('status', ['envoyee', 'reussie', 'echouee'])->nullable();
            $table->unsignedBigInteger('id_facture')->nullable();

            // Clé étrangère
            $table->foreign('id_facture')
                  ->references('id_facture')
                  ->on('factures')
                  ->onDelete('set null');

            $table->timestamps();

            // Index supplémentaires
            $table->index('id_facture');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('relance');
    }
};
