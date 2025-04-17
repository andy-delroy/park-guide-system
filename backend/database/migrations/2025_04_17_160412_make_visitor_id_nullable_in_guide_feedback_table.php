<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('guide_feedback', function (Blueprint $table) {
            $table->dropForeign(['visitor_id']);
            $table->unsignedBigInteger('visitor_id')->nullable()->change();
            $table->foreign('visitor_id')->references('id')->on('users');
        });
    }

    public function down(): void
    {
        Schema::table('guide_feedback', function (Blueprint $table) {
            $table->dropForeign(['visitor_id']);
            $table->unsignedBigInteger('visitor_id')->nullable(false)->change();
            $table->foreign('visitor_id')->references('id')->on('users');
        });
    }
};
