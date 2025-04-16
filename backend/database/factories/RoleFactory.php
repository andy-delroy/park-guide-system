<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class RoleFactory extends Factory
{
    public function definition(): array
    {
        return [
            'role_name' => $this->faker->randomElement(['admin', 'guide', 'visitor']),
            'description' => $this->faker->sentence(),
            'permissions_json' => json_encode([
                'can_edit' => $this->faker->boolean(),
                'can_delete' => $this->faker->boolean(),
            ]),
        ];
    }
}
