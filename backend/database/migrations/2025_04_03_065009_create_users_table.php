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
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('username', 50)->unique();
            $table->string('password');
            $table->string('email', 100)->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->rememberToken();
            
            $table->string('phone_number', 20)->nullable();
            $table->string('full_name', 100)->nullable();
            $table->date('date_of_birth')->nullable();
            $table->string('gender', 20)->nullable();
            $table->text('address')->nullable();
            $table->foreignId('role_id')->constrained('roles');
            $table->timestamp('registration_date')->useCurrent();
            $table->timestamp('last_login')->nullable();
            $table->string('status', 20)->default('active');
            $table->string('profile_image_url')->nullable();
            $table->string('reset_token')->nullable();
            $table->timestamp('reset_token_expiry')->nullable();
            
            // Park Guide-specific
            $table->string('identification_number', 50)->nullable();
            $table->string('emergency_contact', 100)->nullable();
            $table->text('biography')->nullable();
            $table->text('languages_spoken')->nullable();
            $table->integer('years_of_experience')->nullable();
            $table->text('specializations')->nullable();
            $table->string('employment_status', 50)->nullable();
        
            $table->timestamps();
        });

        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->string('email')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
        });

        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->foreignId('user_id')->nullable()->index();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('payload');
            $table->integer('last_activity')->index();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('sessions');
    }
};
