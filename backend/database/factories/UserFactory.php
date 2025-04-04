<?php

namespace Database\Factories;

use App\Models\User;
use App\Models\Role;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Hash; // ✅ Add this

class UserFactory extends Factory
{
    protected $model = User::class;

    public function definition()
    {
        $hashedPassword = Hash::make('password'); // or bcrypt('password');

        return [
            'username' => $this->faker->unique()->userName(),
            'name' => $this->faker->name, // ✅ Required for seeding
            'password_hash' => $hashedPassword,  // ✅ using same hash
            'password' => $hashedPassword,       // ✅ Laravel uses this
            'email' => $this->faker->unique()->safeEmail(),
            'phone_number' => $this->faker->phoneNumber(),
            'full_name' => $this->faker->name(),
            'date_of_birth' => $this->faker->date(),
            'gender' => $this->faker->randomElement(['male', 'female']),
            'address' => $this->faker->address(),
            'role_id' => Role::factory(),
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
