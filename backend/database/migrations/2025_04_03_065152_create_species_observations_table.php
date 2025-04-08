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
        Schema::create('species_observations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('species_id')->constrained('species');
            $table->foreignId('observer_id')->constrained('users');
            $table->foreignId('park_id')->constrained('parks');
            $table->timestamp('observation_date');
            $table->json('coordinates')->nullable();
            $table->text('notes')->nullable();
            $table->string('image_url')->nullable();
            $table->foreignId('confirmed_by')->nullable()->constrained('users');
            $table->string('confirmation_status', 20)->default('pending');
            $table->timestamps(); // Add this line
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('species_observations');
    }
};