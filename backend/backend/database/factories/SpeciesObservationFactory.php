<?php

namespace Database\Factories;

use App\Models\SpeciesObservation;
use App\Models\User;
use App\Models\Species;
use App\Models\Park;
use Illuminate\Database\Eloquent\Factories\Factory;

class SpeciesObservationFactory extends Factory
{
    protected $model = SpeciesObservation::class;

    public function definition()
    {
        return [
            'species_id' => Species::factory(),
            'observer_id' => User::factory(),
            'park_id' => Park::factory(),
            'observation_date' => $this->faker->dateTimeBetween('-1 year', 'now'),
            'coordinates' => json_encode([
                'lat' => $this->faker->latitude(),
                'lng' => $this->faker->longitude()
            ]),
            'notes' => $this->faker->sentence(),
            'image_url' => $this->faker->imageUrl(640, 480, 'animals', true),
            'confirmed_by' => $this->faker->boolean(70) ? User::factory() : null, // 70% chance it's confirmed
            'confirmation_status' => $this->faker->randomElement(['pending', 'confirmed', 'rejected'])
        ];
    }
}
