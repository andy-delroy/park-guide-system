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
        Schema::create('park_activities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('park_id')->constrained('parks');
            $table->string('activity_name');
            $table->text('description')->nullable();
            $table->integer('duration')->nullable(); // in minutes
            $table->decimal('price', 10, 2)->nullable();
            $table->boolean('booking_required')->default(false);
            $table->integer('capacity')->nullable();
            $table->text('schedule_info')->nullable();
            $table->text('requirements')->nullable();
            $table->string('image_url')->nullable();
            $table->string('availability', 50)->default('year-round');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('park_activities');
    }
};
