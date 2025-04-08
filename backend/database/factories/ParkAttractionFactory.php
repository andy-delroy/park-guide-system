<?php

namespace Database\Factories;

use App\Models\Park;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class ParkAttractionFactory extends Factory
{
    public function definition(): array
    {
        return [
            'park_id' => Park::factory(),
            'attraction_name' => $this->faker->words(2, true),
            'description' => $this->faker->paragraph(),
            'coordinates' => json_encode([
                'lat' => $this->faker->latitude(),
                'lng' => $this->faker->longitude()
            ]),
            'image_url' => $this->faker->imageUrl(640, 480, 'nature', true),
            'type' => $this->faker->randomElement(['natural', 'cultural', 'historical']),
            'accessibility_info' => $this->faker->sentence(),
            'best_visit_time' => $this->faker->randomElement(['morning', 'afternoon', 'evening', 'all day']),
            'created_by' => User::factory(),
            'last_updated' => now(),
        ];
    }
}
