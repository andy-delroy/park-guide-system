<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Trainings>
 */
class TrainingsFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $startDate = fake()->dateTimeBetween('now', '+1 year');
        return [
            //
            'title' => fake()->sentence(),
            'description' => fake()->sentence(),
            'start_date' => $startDate,
            'end_date' => fake()->dateTimeBetween($startDate, '+1 year'),
            'location' => fake()->city(),
            'capacity' => fake()->numberBetween(10,100), //
            
        ];
    }
}