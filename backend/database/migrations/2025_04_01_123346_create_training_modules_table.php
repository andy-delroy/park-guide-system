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
        Schema::create('training_modules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('program_id')->constrained('training_programs');
            $table->string('module_name');
            $table->text('description')->nullable();
            $table->integer('duration_hours')->nullable();
            $table->integer('sequence_number')->nullable();
            $table->text('learning_objectives')->nullable();
            $table->decimal('pass_threshold', 5, 2)->nullable();
            $table->string('content_type', 50)->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('training_modules');
    }
};
