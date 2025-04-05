<?php

namespace Database\Factories;

use App\Models\Park;
use Illuminate\Database\Eloquent\Factories\Factory;

class ParkAccommodationFactory extends Factory
{
    public function definition(): array
    {
        return [
            'park_id' => Park::factory(),
            'name' => $this->faker->company,
            'type' => $this->faker->randomElement(['camping', 'hostel', 'lodge', 'tent', 'cabin']),
            'description' => $this->faker->paragraph(),
            'capacity' => $this->faker->numberBetween(2, 20),
            'price_range' => '$' . $this->faker->numberBetween(30, 100) . ' - $' . $this->faker->numberBetween(101, 300),
            'amenities' => $this->faker->sentence(),
            'booking_info' => $this->faker->url(),
            'coordinates' => json_encode([
                'lat' => $this->faker->latitude(),
                'lng' => $this->faker->longitude(),
            ]),
            'image_url' => $this->faker->imageUrl(640, 480, 'accommodation', true),
            'status' => $this->faker->randomElement(['available', 'unavailable', 'under maintenance']),
        ];
    }
}
