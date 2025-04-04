<?php

namespace Database\Factories;

use App\Models\TrainingProgram;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class TrainingSessionFactory extends Factory
{
    public function definition(): array
    {
        $startDate = $this->faker->dateTimeBetween('-1 year', 'now');
        return [
            'program_id' => TrainingProgram::factory(),
            'session_name' => $this->faker->word(),
            'start_date' => $startDate,
            'end_date' => $this->faker->dateTimeBetween($startDate, '+3 months'),
            'location' => $this->faker->city(),
            'instructor_id' => User::factory(),
        ];
    }
}
