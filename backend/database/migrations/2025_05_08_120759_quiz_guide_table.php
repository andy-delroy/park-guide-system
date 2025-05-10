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
        Schema::create('quiz_guide', function (Blueprint $table) {
            $table->foreignId('quiz_id')
                ->constrained()
                ->onDelete('cascade');
            $table->foreignId('guide_id')
                ->constrained('users')
                ->onDelete('cascade');
            $table->integer('total_score')->nullable();
            $table->integer('time_taken')->nullable();
            $table->timestamps();

            $table->primary(['quiz_id', 'guide_id']); // Composite primary key
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        schema::dropIfExists('quiz_guide');
    }
};
