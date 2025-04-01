<?php 

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class MediaLibraryFactory extends Factory
{
    public function definition(): array
    {
        return [
            'title' => $this->faker->sentence(4),
            'description' => $this->faker->paragraph(),
            'file_url' => $this->faker->imageUrl(),
            'media_type' => $this->faker->randomElement(['image', 'video', 'audio', 'document']),
            'uploaded_by' => \App\Models\User::factory(),
            'park_id' => 1,
            'species_id' => 1,
            'created_at' => now(),
            'updated_at' => now(),
        ];
    }
}
