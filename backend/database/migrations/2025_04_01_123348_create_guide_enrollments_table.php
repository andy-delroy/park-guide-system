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
        Schema::create('guide_enrollments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('guide_id')->constrained('users');
            $table->foreignId('session_id')->constrained('training_sessions');
            $table->timestamp('enrollment_date')->useCurrent();
            $table->string('completion_status', 20)->default('enrolled');
            $table->timestamp('completion_date')->nullable();
            $table->text('notes')->nullable();
            $table->unique(['guide_id', 'session_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('guide_enrollments');
    }
};
