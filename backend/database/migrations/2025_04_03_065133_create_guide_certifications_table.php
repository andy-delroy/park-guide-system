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
        Schema::create('guide_certifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('guide_id')->constrained('users');
            $table->string('type'); // Certification type
            $table->foreignId('program_id')->nullable()->constrained('training_programs');
            $table->string('certification_name');
            $table->text('description')->nullable();
            $table->timestamp('issue_date');
            $table->timestamp('expiry_date')->nullable();
            $table->string('certificate_number', 50)->unique();
            $table->foreignId('issued_by')->constrained('users');
            $table->integer('renewal_count')->default(0);
            $table->string('status', 20)->default('active');
            $table->text('certificate_number')->nullable(); // Encrypted field
            $table->string('certificate_file_url')->nullable();
            $table->string('verification_code', 50)->nullable();
            $table->text('requirements_description')->nullable();
            $table->integer('validity_period_months')->nullable();
            $table->text('renewal_requirements')->nullable();
            $table->timestamps(); 
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('guide_certifications');
    }
};