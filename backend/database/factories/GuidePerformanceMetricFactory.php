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
            'assessment_date' => $this->faker->dateTimeBetween('-1 year', 'now'),
            'knowledge_score' => $this->faker->randomFloat(2, 0, 100),
            'communication_score' => $this->faker->randomFloat(2, 0, 100),
            'safety_score' => $this->faker->randomFloat(2, 0, 100),
            'customer_service_score' => $this->faker->randomFloat(2, 0, 100),
            'conservation_awareness_score' => $this->faker->randomFloat(2, 0, 100),
            'overall_score' => $this->faker->randomFloat(2, 0, 100),
            'comments' => $this->faker->sentence(),
            'improvement_plan' => $this->faker->paragraph(),
        ];
    }
}
