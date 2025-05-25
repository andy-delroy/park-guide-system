<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sensor_logs', function (Blueprint $table) {
            $table->id();
            $table->string('device_id');
            $table->float('temperature')->nullable();
            $table->float('humidity')->nullable();
            $table->float('soil_moisture_percent')->nullable();
            $table->float('rain_percent')->nullable();
            $table->float('distance_cm')->nullable();
            $table->timestamp('recorded_at');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sensor_logs');
    }
};

