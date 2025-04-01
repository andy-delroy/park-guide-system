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
        Schema::create('park_accommodations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('park_id')->constrained('parks');
            $table->string('name');
            $table->string('type', 50); // camping/hostel/lodge/etc
            $table->text('description')->nullable();
            $table->integer('capacity')->nullable();
            $table->string('price_range')->nullable();
            $table->text('amenities')->nullable();
            $table->text('booking_info')->nullable();
            $table->json('coordinates')->nullable();
            $table->string('image_url')->nullable();
            $table->string('status', 20)->default('available');
            $table->timestamps(); 
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('park_accommodations');
    }
};
