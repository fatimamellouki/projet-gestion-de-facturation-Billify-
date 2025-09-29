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
        Schema::create('paiement', function (Blueprint $table) {
            $table->id('id_paiement');
            $table->dateTime('date_paiement')->nullable();
            $table->decimal('montant', 12, 2)->nullable();
            $table->enum('moyen', ['CB', 'Virement', 'Cheque', 'Espèces'])->nullable();
            $table->unsignedBigInteger('id_facture')->nullable();

            // Clé étrangère
            $table->foreign('id_facture')
                  ->references('id_facture')
                  ->on('factures')
                  ->onDelete('set null');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('paiement');
    }
};
