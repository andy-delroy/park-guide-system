<?php

namespace Database\Factories;

use App\Models\Park;
use Illuminate\Database\Eloquent\Factories\Factory;

class ParkRouteFactory extends Factory
{
    public function definition(): array
    {
        return [
            'park_id' => Park::factory(),
            'route_name' => $this->faker->words(3, true),
            'description' => $this->faker->paragraph(),
            'difficulty_level' => $this->faker->randomElement(['easy', 'moderate', 'hard']),
            'distance_km' => $this->faker->randomFloat(2, 0.5, 20),
            'estimated_duration' => $this->faker->numberBetween(30, 300), // in minutes
            'starting_point' => $this->faker->streetName(),
            'ending_point' => $this->faker->streetName(),
            'route_path_geojson' => json_encode([
                'type' => 'LineString',
                'coordinates' => [
                    [$this->faker->longitude(), $this->faker->latitude()],
                    [$this->faker->longitude(), $this->faker->latitude()]
                ]
            ]),
            'elevation_profile' => $this->faker->sentence(),
            'highlights' => $this->faker->sentence(),
            'cautions' => $this->faker->sentence(),
            'seasonal_notes' => $this->faker->sentence(),
        ];
    }
}
