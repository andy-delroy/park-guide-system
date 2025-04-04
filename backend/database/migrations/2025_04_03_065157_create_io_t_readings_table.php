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
        Schema::create('io_t_readings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('device_id')->constrained('io_t_devices');
            $table->timestamp('reading_timestamp');
            $table->decimal('temperature', 5, 2)->nullable();
            $table->decimal('humidity', 5, 2)->nullable();
            $table->decimal('light_level', 5, 2)->nullable();
            $table->boolean('motion_detected')->default(false);
            $table->decimal('battery_level', 5, 2)->nullable();
            $table->json('other_sensor_data_json')->nullable();
            $table->boolean('alert_triggered')->default(false);
            $table->timestamps(); 
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('io_t_readings');
    }
};