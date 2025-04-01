<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;

class UserSeeder extends Seeder
{
    public function run()
    {
        User::factory()->count(3)->create(['role_id' => 1]); // Admins
        User::factory()->count(10)->create(['role_id' => 2]); // Guides
        User::factory()->count(20)->create(['role_id' => 3]); // Visitors
    }
}
