<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('guide_performance_metrics', function (Blueprint $table) {
            $table->id();
            $table->foreignId('guide_id')->constrained('users');
            $table->date('activity_date'); // renamed for daily tracking
            $table->foreignId('assessor_id')->nullable()->constrained('users');
            $table->decimal('quiz_score', 5, 2)->nullable(); // new field for quiz average
            $table->decimal('module_completion_rate', 5, 2)->nullable(); // % of completed modules
            $table->boolean('certified')->default(false); // new boolean for certification status
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('guide_performance_metrics');
    }
};
