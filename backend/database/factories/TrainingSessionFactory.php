<?php

namespace Database\Factories;

use App\Models\TrainingSession;
use App\Models\TrainingProgram;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class TrainingSessionFactory extends Factory
{
    protected $model = TrainingSession::class;

    public function definition()
    {
        $start = $this->faker->dateTimeBetween('now', '+1 week');
        return [
            'program_id' => TrainingProgram::factory(),
            'session_name' => $this->faker->words(2, true),
            'start_date' => $start,
            'end_date' => (clone $start)->modify('+3 days'),
            'location' => $this->faker->address(),
            'capacity' => $this->faker->numberBetween(10, 30),
            'instructor_id' => User::factory(),
            'description' => $this->faker->sentence(),
            'status' => 'scheduled'
        ];
    }
}
