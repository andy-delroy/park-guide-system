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
        Schema::create('training_sessions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('program_id')->constrained('training_programs');
            $table->string('session_name');
            $table->timestamp('start_date');
            $table->timestamp('end_date');
            $table->text('location')->nullable();
            $table->integer('capacity')->nullable();
            $table->foreignId('instructor_id')->constrained('users');
            $table->text('description')->nullable();
            $table->string('status', 20)->default('scheduled');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('training_sessions');
    }
};