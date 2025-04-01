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
        Schema::create('module_contents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('module_id')->constrained('training_modules');
            $table->string('content_title');
            $table->string('content_type', 50);
            $table->string('content_url')->nullable();
            $table->integer('duration_minutes')->nullable();
            $table->integer('sequence_number')->nullable();
            $table->boolean('is_required')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('module_contents');
    }
};
