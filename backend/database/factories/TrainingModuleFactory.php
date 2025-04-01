<?php

namespace Database\Factories;

use App\Models\TrainingModule;
use App\Models\TrainingProgram;
use Illuminate\Database\Eloquent\Factories\Factory;

class TrainingModuleFactory extends Factory
{
    protected $model = TrainingModule::class;

    public function definition()
    {
        return [
            'program_id' => TrainingProgram::factory(),
            'module_name' => 'Module: ' . $this->faker->words(2, true),
            'description' => $this->faker->sentence(),
            'duration_hours' => $this->faker->numberBetween(1, 5),
            'sequence_number' => $this->faker->numberBetween(1, 10),
            'learning_objectives' => $this->faker->paragraph(),
            'pass_threshold' => $this->faker->randomFloat(2, 0.6, 1.0),
            'content_type' => $this->faker->randomElement(['video', 'text', 'quiz', 'interactive'])
        ];
    }
}
