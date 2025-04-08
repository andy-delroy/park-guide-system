<?php

namespace Database\Factories;

use App\Models\TrainingProgram;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class TrainingProgramFactory extends Factory
{
    protected $model = TrainingProgram::class;

    public function definition()
    {
        return [
            'program_name' => $this->faker->words(3, true),
            'description' => $this->faker->paragraph(),
            'duration_hours' => $this->faker->numberBetween(4, 40),
            'prerequisite_program_id' => null, // Optional, can be updated later
            'created_by' => User::factory(),
            'created_at' => now(),
            'updated_at' => now(),
            'status' => 'active',
            'required_for_certification' => $this->faker->boolean(80)
        ];
    }
}