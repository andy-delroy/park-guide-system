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
            'observation_date' => now(),
            'coordinates' => json_encode(['lat' => $this->faker->latitude(), 'lng' => $this->faker->longitude()]),
            'notes' => $this->faker->sentence(),
            'image_url' => $this->faker->imageUrl(),
            'confirmed_by' => null,
            'confirmation_status' => 'pending'
        ];
    }
}
