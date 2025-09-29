<?php
// database/migrations/2024_01_01_000001_create_ligne_devis_table.php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateLigneDevisTable extends Migration
{
    public function up(): void
    {
        Schema::create('ligne_devis', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('devis_id');
            $table->unsignedBigInteger('produit_id')->nullable();
            $table->string('designation', 5000);
            $table->integer('quantite');
            $table->decimal('prix_unitaire_ht', 10, 2);
            $table->decimal('taux_tva', 5, 2);
            $table->decimal('montant_ht', 10, 2);
            $table->decimal('montant_tva', 10, 2);
            $table->decimal('montant_ttc', 10, 2);
            $table->timestamps();

            $table->foreign('devis_id')->references('id')->on('devis')->onDelete('restrict');
            $table->foreign('produit_id')->references('id')->on('produits')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ligne_devis');
    }
}
