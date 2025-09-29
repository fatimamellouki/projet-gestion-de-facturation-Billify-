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
      Schema::create('utilisateurs', function (Blueprint $table) {
    $table->id();
    $table->string('name');
    $table->string('lastName');
    $table->string('email', 191);
    $table->string('telephone');
    $table->string('address');
    // change entreprise string en foreign key
    $table->unsignedBigInteger('entreprise_id')->nullable();
    $table->foreign('entreprise_id')->references('id_entreprise')->on('entreprises')->onDelete('set null');
    $table->string('login', 191);
    $table->string('passwordLogin');
    $table->string('role');
    $table->timestamps();
    $table->unique(['email', 'entreprise_id']);

});

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('utilisateurs');
    }
};
