<?php

namespace Database\Factories;

use App\Models\Park;
use Illuminate\Database\Eloquent\Factories\Factory;

class ParkActivityFactory extends Factory
{
    public function definition(): array
    {
        return [
            'park_id' => Park::factory(),
            'activity_name' => $this->faker->words(2, true),
            'description' => $this->faker->paragraph(),
            'duration' => $this->faker->numberBetween(30, 180), // in minutes
            'price' => $this->faker->randomFloat(2, 0, 100),
            'booking_required' => $this->faker->boolean(30),
            'capacity' => $this->faker->numberBetween(5, 30),
            'schedule_info' => $this->faker->sentence(),
            'requirements' => $this->faker->sentence(),
            'image_url' => $this->faker->imageUrl(640, 480, 'nature', true),
            'availability' => $this->faker->randomElement(['year-round', 'seasonal', 'weekends']),
        ];
    }
}
