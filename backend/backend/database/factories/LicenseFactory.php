<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\User;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\License>
 */
class LicenseFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition()
{
    return [
        'license_number' => strtoupper('LIC-' . $this->faker->unique()->bothify('#####')),
        'issued_by' => User::factory(),
        'guide_id' => User::factory(),
        'park_id' => 1,
        'issue_date' => $this->faker->date(),
        'expiry_date' => $this->faker->dateTimeBetween('+1 year', '+3 years'),
        'status' => $this->faker->randomElement(['active', 'expired',
         'revoked']),
         'license_type' => $this->faker->randomElement(['standard', 'provisional', 'temporary']),
        'created_at' => now(),
        'updated_at' => now(),
    ];
}
}