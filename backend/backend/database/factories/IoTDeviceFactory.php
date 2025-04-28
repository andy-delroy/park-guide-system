<?php

namespace Database\Factories;

use App\Models\IoTDevice;
use App\Models\Park;
use App\Models\Species;
use Illuminate\Database\Eloquent\Factories\Factory;

class IoTDeviceFactory extends Factory
{
    protected $model = IoTDevice::class;

    public function definition()
    {
        return [
            'device_type' => $this->faker->randomElement(['Camera', 'Sensor', 'Audio Recorder']),
            'serial_number' => strtoupper($this->faker->bothify('DEV-#####')),
            'installation_date' => now()->subMonths(1),
            'last_maintenance_date' => now()->subWeeks(1),
            'status' => 'active',
            'coordinates' => json_encode(['lat' => $this->faker->latitude(), 'lng' => $this->faker->longitude()]),
            'battery_level' => $this->faker->randomFloat(2, 10, 100),
            'firmware_version' => 'v' . $this->faker->randomDigit() . '.' . $this->faker->randomDigit(),
            'park_id' => Park::factory(),
            'monitored_species_id' => Species::factory()
        ];
    }
}