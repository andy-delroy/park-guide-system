<?php

namespace Database\Factories;

use App\Models\GuideEnrollment;
use App\Models\User;
use App\Models\TrainingSession;
use Illuminate\Database\Eloquent\Factories\Factory;

class GuideEnrollmentFactory extends Factory
{
    protected $model = GuideEnrollment::class;

    public function definition()
    {
        return [
            'guide_id' => User::factory(),
            'session_id' => TrainingSession::factory(),
            'enrollment_date' => now(),
            'completion_status' => $this->faker->randomElement(['enrolled', 'in-progress', 'completed', 'dropped']),
            'completion_date' => null,
            'notes' => $this->faker->sentence()
        ];
    }
}
