<?php

namespace Database\Factories;

use App\Models\Park;
use Illuminate\Database\Eloquent\Factories\Factory;

class ParkFactory extends Factory
{
    protected $model = Park::class;

    public function definition()
    {
        return [
            'park_name' => $this->faker->company . ' National Park',
            'location' => $this->faker->address(),
            'description' => $this->faker->paragraph(),
            'established_date' => $this->faker->date(),
            'area_size' => $this->faker->randomFloat(2, 50, 5000),
            'contact_info' => $this->faker->phoneNumber(),
            'operating_hours' => '8:00 AM - 6:00 PM',
            'website_url' => $this->faker->url(),
            'coordinates' => json_encode([
                'lat' => $this->faker->latitude(1.0, 4.0),
                'lng' => $this->faker->longitude(110.0, 115.0)
            ]),
            'status' => 'open'
        ];
    }
}