<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
       Schema::create('clients', function (Blueprint $table) {
    $table->id('id_client');
    $table->string('nom', 100)->nullable();
    $table->text('adresse')->nullable();
    $table->string('email', 100)->nullable();
    $table->string('telephone', 20)->nullable();

    $table->unsignedBigInteger('entreprise_id'); // 🔧 correction ici
    $table->string('photo_contact_url', 255)->nullable();
    $table->timestamps();

    // 💡 Clé étrangère (optionnelle mais recommandée)
    // $table->foreign('entreprise_id')->references('id_entreprise')->on('entreprises')->onDelete('cascade');
});

    }

    public function down(): void
    {
        Schema::dropIfExists('clients');
    }
};
