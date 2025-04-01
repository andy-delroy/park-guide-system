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
        Schema::create('guide_feedback', function (Blueprint $table) {
            $table->id();
            $table->foreignId('guide_id')->constrained('users');
            $table->foreignId('visitor_id')->constrained('users');
            $table->date('tour_date')->nullable();
            $table->integer('rating')->checkBetween(1, 5);
            $table->text('comments')->nullable();
            $table->string('feedback_categories', 255)->nullable(); // CSV or JSON
            $table->timestamp('submitted_date')->useCurrent();
            $table->boolean('is_public')->default(false);
            $table->string('status', 20)->default('pending');
            $table->foreignId('park_id')->nullable()->constrained('parks');
            $table->timestamps(); 
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('guide_feedback');
    }
};
