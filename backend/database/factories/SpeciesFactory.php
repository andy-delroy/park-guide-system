<?php

namespace Database\Factories;

use App\Models\Species;
use Illuminate\Database\Eloquent\Factories\Factory;

class SpeciesFactory extends Factory
{
    protected $model = Species::class;

    public function definition()
    {
        return [
            'scientific_name' => 'Species ' . $this->faker->unique()->lexify('??????'),
            'common_name' => $this->faker->word(),
            'species_type' => $this->faker->randomElement(['flora', 'fauna']),
            'conservation_status' => $this->faker->randomElement(['Least Concern', 'Endangered', 'Critically Endangered']),
            'description' => $this->faker->paragraph(),
            'habitat' => $this->faker->sentence(),
            'image_url' => $this->faker->imageUrl(),
            'taxonomy_info' => json_encode(['family' => 'Fabaceae']),
            'is_endangered' => $this->faker->boolean(20),
            'is_protected' => $this->faker->boolean(40),
            'notes' => $this->faker->sentence()
        ];
    }
}
