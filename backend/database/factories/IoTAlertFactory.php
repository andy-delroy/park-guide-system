<?php

namespace Database\Factories;

use App\Models\IoTAlert;
use App\Models\IoTDevice;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class IoTAlertFactory extends Factory
{
    protected $model = IoTAlert::class;

    public function definition()
    {
        return [
            'device_id' => IoTDevice::factory(),
            'alert_timestamp' => now(),
            'alert_type' => $this->faker->randomElement(['motion', 'battery_low', 'temperature']),
            'alert_message' => $this->faker->sentence(),
            'severity_level' => $this->faker->randomElement(['low', 'medium', 'high', 'critical']),
            'coordinates' => json_encode(['lat' => $this->faker->latitude(), 'lng' => $this->faker->longitude()]),
            'resolved' => false,
            'resolved_by' => null,
            'resolution_timestamp' => null,
            'resolution_notes' => null
        ];
    }
}