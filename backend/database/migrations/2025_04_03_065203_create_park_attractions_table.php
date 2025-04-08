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
        Schema::create('park_attractions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('park_id')->constrained('parks');
            $table->string('attraction_name');
            $table->text('description')->nullable();
            $table->json('coordinates')->nullable();
            $table->string('image_url')->nullable();
            $table->string('type', 20); // natural/cultural/historical
            $table->text('accessibility_info')->nullable();
            $table->string('best_visit_time')->nullable();
            $table->foreignId('created_by')->constrained('users');
            $table->timestamp('last_updated')->useCurrent();
            $table->timestamps(); 
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('park_attractions');
    }
};