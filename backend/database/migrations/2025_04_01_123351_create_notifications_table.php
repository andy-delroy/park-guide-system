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
        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users');
            $table->string('title');
            $table->text('message');
            $table->string('notification_type', 50);
            $table->timestamp('created_date')->useCurrent();
            $table->boolean('is_read')->default(false);
            $table->timestamp('read_date')->nullable();
            $table->timestamp('expiry_date')->nullable();
            $table->string('action_url')->nullable();
            $table->string('priority_level', 20)->default('medium');
            $table->timestamps(); 
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};
