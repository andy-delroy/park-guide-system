<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\GuidePerformanceMetric;

class GuidePerformanceMetricFactory extends Factory
{
    protected $model = GuidePerformanceMetric::class;

    public function definition(): array
    {
        return [
            'guide_id' => User::factory(),
            'assessor_id' => User::factory(),
            'activity_date' => $this->faker->dateTimeBetween('-30 days', 'now'),
            'quiz_score' => $this->faker->randomFloat(2, 60, 100),
            'module_completion_rate' => $this->faker->randomFloat(2, 70, 100),
            'certified' => $this->faker->boolean(60),
        ];
    }
}
