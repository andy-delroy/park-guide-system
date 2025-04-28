<?php

namespace Database\Factories;

use App\Models\User;
use App\Models\Role;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class UserFactory extends Factory
{
    protected $model = User::class;

    public function definition()
    {
        $role = Role::inRandomOrder()->first() ?? Role::factory()->create(['role_name' => 'visitor']);
        return [
            'username' => $this->faker->unique()->userName(),
            'password' => bcrypt('password'),
            'email' => $this->faker->unique()->safeEmail(),
            'phone_number' => $this->faker->phoneNumber(),
            'full_name' => $this->faker->name(),
            'date_of_birth' => $this->faker->date(),
            'gender' => $this->faker->randomElement(['male', 'female']),
            'address' => $this->faker->address(),
            'role_id' => $role->id,
            'registration_date' => now(),
            'last_login' => now(),
            'status' => 'active',
            'profile_image_url' => $this->faker->imageUrl(),
            'identification_number' => strtoupper(Str::random(8)),
            'emergency_contact' => $this->faker->phoneNumber(),
            'biography' => $this->faker->paragraph(),
            'languages_spoken' => 'English, Malay',
            'years_of_experience' => rand(0, 15),
            'specializations' => 'Biodiversity, Jungle Trekking',
            'employment_status' => 'active'
        ];
    }
}