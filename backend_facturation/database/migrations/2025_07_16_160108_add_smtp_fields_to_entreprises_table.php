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
    Schema::table('entreprises', function (Blueprint $table) {
        $table->string('smtp_host')->nullable();
        $table->string('smtp_port')->nullable();
        $table->string('smtp_user')->nullable();
        $table->string('smtp_password')->nullable(); // ⚠️ tu peux plus tard le chiffrer
        $table->string('smtp_encryption')->nullable(); // tls ou ssl
    });
}


    /**
     * Reverse the migrations.
     */
   public function down(): void
{
    Schema::table('entreprises', function (Blueprint $table) {
        $table->dropColumn([
            'smtp_host',
            'smtp_port',
            'smtp_user',
            'smtp_password',
            'smtp_encryption',
        ]);
    });
}

};
