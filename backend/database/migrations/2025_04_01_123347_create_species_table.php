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
        Schema::create('species', function (Blueprint $table) {
            $table->id();
            $table->string('scientific_name');
            $table->string('common_name')->nullable();
            $table->string('species_type', 20); // flora/fauna
            $table->string('conservation_status', 50)->nullable();
            $table->text('description')->nullable();
            $table->text('habitat')->nullable();
            $table->string('image_url')->nullable();
            $table->text('taxonomy_info')->nullable();
            $table->boolean('is_endangered')->default(false);
            $table->boolean('is_protected')->default(false);
            $table->text('notes')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('species');
    }
};
