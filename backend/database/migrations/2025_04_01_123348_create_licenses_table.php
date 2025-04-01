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
        Schema::create('licenses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('guide_id')->constrained('users');
            $table->string('license_number', 50)->unique();
            $table->string('license_type');
            $table->timestamp('issue_date');
            $table->timestamp('expiry_date');
            $table->string('status', 20)->default('active');
            $table->foreignId('issued_by')->constrained('users');
            $table->timestamp('renewal_date')->nullable();
            $table->boolean('renewal_reminder_sent')->default(false);
            $table->foreignId('park_id')->nullable()->constrained('parks');
            $table->string('license_file_url')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('licenses');
    }
};
