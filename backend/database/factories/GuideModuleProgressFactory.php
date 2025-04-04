<?php

namespace Database\Factories;

use App\Models\GuideModuleProgress;
use App\Models\TrainingModule;
use App\Models\GuideEnrollment;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class GuideModuleProgressFactory extends Factory
{
    protected $model = GuideModuleProgress::class;

    public function definition()
    {
        return [
            'guide_id' => User::factory(),
            'module_id' => TrainingModule::factory(),
            'enrollment_id' => GuideEnrollment::factory(),
            'start_date' => now(),
            'completion_date' => null,
            'score' => $this->faker->randomFloat(2, 0, 1),
            'attempt_number' => 1,
            'completion_status' => 'in-progress',
            'last_activity_timestamp' => now()
        ];
    }
}