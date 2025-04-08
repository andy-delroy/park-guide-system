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
        Schema::create('park_routes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('park_id')->constrained('parks');
            $table->string('route_name');
            $table->text('description')->nullable();
            $table->string('difficulty_level', 20);
            $table->decimal('distance_km', 5, 2)->nullable();
            $table->integer('estimated_duration')->nullable();
            $table->text('starting_point')->nullable();
            $table->text('ending_point')->nullable();
            $table->json('route_path_geojson')->nullable();
            $table->text('elevation_profile')->nullable();
            $table->text('highlights')->nullable();
            $table->text('cautions')->nullable();
            $table->text('seasonal_notes')->nullable();
            $table->timestamps(); 
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('park_routes');
    }
};