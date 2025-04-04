<?php

namespace Database\Factories;

use App\Models\ModuleContent;
use App\Models\TrainingModule;
use Illuminate\Database\Eloquent\Factories\Factory;

class ModuleContentFactory extends Factory
{
    protected $model = ModuleContent::class;

    public function definition()
    {
        return [
            'module_id' => TrainingModule::factory(),
            'content_title' => $this->faker->sentence(),
            'content_type' => $this->faker->randomElement(['video', 'text', 'quiz']),
            'content_url' => $this->faker->url(),
            'duration_minutes' => $this->faker->numberBetween(5, 60),
            'sequence_number' => $this->faker->numberBetween(1, 10),
            'is_required' => true
        ];
    }
}