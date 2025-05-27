<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('notifications', function (Blueprint $table) {
            $table->id();

            $table->foreignId('user_id')->nullable()->constrained()->onDelete('cascade');
            $table->string('role')->nullable();                      // e.g., 'admin', 'guide'
            $table->string('type')->nullable();                      // e.g., 'reminder', 'alert'
            $table->string('target_channel')->nullable();           // e.g., 'all', 'admins', etc.
            $table->text('message');                                 // Notification body
            $table->dateTime('created_date')->useCurrent();         // Time notification was created
            $table->tinyInteger('is_read')->default(0);             // Read/unread flag
            $table->dateTime('read_date')->nullable();              // When user read it
            $table->dateTime('expiry_date')->nullable();            // When it expires
            $table->string('action_url')->nullable();               // Optional URL to act on
            $table->string('priority_level')->nullable();           // e.g., 'high', 'normal'

            $table->timestamps(); // Adds created_at and updated_at
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};
