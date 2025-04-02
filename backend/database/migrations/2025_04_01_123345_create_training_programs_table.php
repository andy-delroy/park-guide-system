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
        Schema::create('training_programs', function (Blueprint $table) {
            $table->id(); 
            $table->string('program_name');
            $table->text('description')->nullable();
            $table->integer('duration_hours')->nullable();
        
            $table->unsignedBigInteger('prerequisite_program_id')->nullable();
            $table->foreign('prerequisite_program_id')
                  ->references('id')
                  ->on('training_programs')
                  ->nullOnDelete();
        
            $table->foreignId('created_by')->constrained('users');
            $table->timestamp('created_date')->useCurrent();
            $table->timestamp('updated_date')->nullable();
            $table->string('status', 20)->default('active');
            $table->boolean('required_for_certification')->default(false);
        });
        
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('training_programs');
    }
};
