<?php

namespace Database\Factories;

use App\Models\User;
use App\Models\Park;
use Illuminate\Database\Eloquent\Factories\Factory;

class GuideFeedbackFactory extends Factory
{
    public function definition(): array
    {
        return [
            'guide_id' => User::factory(),
            'visitor_id' => User::factory(),
            'park_id' => Park::factory(),
            'rating' => $this->faker->numberBetween(1, 5),
            'comments' => $this->faker->sentence(),
        ];
    }
}
