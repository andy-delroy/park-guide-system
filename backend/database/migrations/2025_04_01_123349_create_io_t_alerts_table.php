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
        Schema::create('io_t_alerts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('device_id')->constrained('io_t_devices');
            $table->timestamp('alert_timestamp');
            $table->string('alert_type');
            $table->text('alert_message');
            $table->string('severity_level', 20);
            $table->json('coordinates')->nullable();
            $table->boolean('resolved')->default(false);
            $table->foreignId('resolved_by')->nullable()->constrained('users');
            $table->timestamp('resolution_timestamp')->nullable();
            $table->text('resolution_notes')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('io_t_alerts');
    }
};
