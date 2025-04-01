<?php

namespace Database\Factories;

use App\Models\Role;
use Illuminate\Database\Eloquent\Factories\Factory;

class RoleFactory extends Factory
{
    protected $model = Role::class;

    public function definition()
    {
        return [
            'role_name' => $this->faker->randomElement(['Admin', 'ParkGuide', 'Visitor']),
            'description' => $this->faker->sentence(),
            'permissions_json' => json_encode(['can_edit' => true, 'can_delete' => false]),
        ];
    }
}
