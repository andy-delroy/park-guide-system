<?php

namespace Database\Factories;

use App\Models\IoTReading;
use App\Models\IoTDevice;
use Illuminate\Database\Eloquent\Factories\Factory;

class IoTReadingFactory extends Factory
{
    protected $model = IoTReading::class;

    public function definition()
    {
        return [
            'device_id' => IoTDevice::factory(),
            'reading_timestamp' => now(),
            'temperature' => $this->faker->randomFloat(2, 18, 35),
            'humidity' => $this->faker->randomFloat(2, 40, 90),
            'light_level' => $this->faker->randomFloat(2, 100, 1000),
            'motion_detected' => $this->faker->boolean(),
            'battery_level' => $this->faker->randomFloat(2, 5, 100),
            'other_sensor_data_json' => json_encode(['noise_level' => $this->faker->randomFloat(1, 0, 10)]),
            'alert_triggered' => $this->faker->boolean(10)
        ];
    }
}
