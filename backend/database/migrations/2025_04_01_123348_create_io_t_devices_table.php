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
        Schema::create('io_t_devices', function (Blueprint $table) {
            $table->id();
            $table->string('device_type');
            $table->string('serial_number')->unique();
            $table->date('installation_date');
            $table->date('last_maintenance_date')->nullable();
            $table->string('status', 20)->default('active');
            $table->json('coordinates')->nullable();
            $table->decimal('battery_level', 5, 2)->nullable();
            $table->string('firmware_version')->nullable();
            $table->foreignId('park_id')->nullable()->constrained('parks');
            $table->foreignId('monitored_species_id')->nullable()->constrained('species');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('io_t_devices');
    }
};
