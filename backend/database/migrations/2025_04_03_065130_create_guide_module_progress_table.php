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
        Schema::create('guide_module_progress', function (Blueprint $table) {
            $table->id();
            $table->foreignId('guide_id')->constrained('users');
            $table->foreignId('module_id')->constrained('training_modules');
            $table->foreignId('enrollment_id')->constrained('guide_enrollments');
            $table->timestamp('start_date')->nullable();
            $table->timestamp('completion_date')->nullable();
            $table->decimal('score', 5, 2)->nullable();
            $table->integer('attempt_number')->default(1);
            $table->string('completion_status', 20)->default('not-started');
            $table->timestamp('last_activity_timestamp')->nullable();
            $table->unique(
                ['guide_id', 'module_id', 'enrollment_id', 'attempt_number'],
                'gmp_progress_unique'
            );      
            $table->timestamps();      
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('guide_module_progress');
    }
};