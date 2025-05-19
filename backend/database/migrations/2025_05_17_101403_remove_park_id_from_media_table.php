<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('media', function (Blueprint $table) {
            // Drop the foreign key first, then the column
            $table->dropForeign(['park_id']);
            $table->dropColumn('park_id');
        });
    }

    public function down(): void
    {
        Schema::table('media', function (Blueprint $table) {
            $table->unsignedBigInteger('park_id')->nullable();
            $table->foreign('park_id')->references('id')->on('parks')->onDelete('cascade');
        });
    }
};
