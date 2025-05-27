<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('media', function (Blueprint $table) {
            // First, drop the foreign key
            $table->dropForeign(['park_id']);

            // Then drop the column
            $table->dropColumn('park_id');
        });
    }

    public function down(): void
    {
        Schema::table('media', function (Blueprint $table) {
            // Restore the column
            $table->unsignedBigInteger('park_id');

            // Re-add the foreign key constraint
            $table->foreign('park_id')
                  ->references('id')
                  ->on('parks')
                  ->onDelete('cascade');
        });
    }
};
