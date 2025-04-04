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
        Schema::create('guide_performance_metrics', function (Blueprint $table) {
            $table->id();
            $table->foreignId('guide_id')->constrained('users');
            $table->date('assessment_date');
            $table->foreignId('assessor_id')->constrained('users');
            $table->decimal('knowledge_score', 4, 2)->nullable();
            $table->decimal('communication_score', 4, 2)->nullable();
            $table->decimal('safety_score', 4, 2)->nullable();
            $table->decimal('customer_service_score', 4, 2)->nullable();
            $table->decimal('conservation_awareness_score', 4, 2)->nullable();
            $table->decimal('overall_score', 4, 2)->nullable();
            $table->text('comments')->nullable();
            $table->text('improvement_plan')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('guide_performance_metrics');
    }
};