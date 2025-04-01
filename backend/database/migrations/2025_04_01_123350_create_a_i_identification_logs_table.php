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
        Schema::create('a_i_identification_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('guide_id')->constrained('users');
            $table->string('image_url');
            $table->timestamp('submission_timestamp')->useCurrent();
            $table->foreignId('identified_species_id')->nullable()->constrained('species');
            $table->decimal('confidence_score', 5, 2)->nullable();
            $table->json('alternative_identifications_json')->nullable();
            $table->boolean('feedback_provided')->default(false);
            $table->text('user_feedback')->nullable();
            $table->timestamps(); 
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('a_i_identification_logs');
    }
};
