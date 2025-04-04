<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\AIIdentificationLog>
 */
class AIIdentificationLogFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
{
    return [
        'guide_id' => \App\Models\User::factory(),
        'identified_species_id' => \App\Models\Species::factory(),
        'image_url' => $this->faker->imageUrl(), // ✅ This line fixes the issue
        'created_at' => now(),
        'updated_at' => now(),
    ];
}
}