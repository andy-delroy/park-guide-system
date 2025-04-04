<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class CreateAdminUser extends Seeder
{
    public function run(): void
    {
        $hashed = Hash::make('password');

        User::create([
            'name' => 'Admin',
            'username' => 'admin',
            'email' => 'admin@gmail.com',
            'password' => $hashed,
            'password_hash' => $hashed,
            'full_name' => 'Administrator',              // ✅ Required
            'phone_number' => '0123456789',              // Optional fallback
            'date_of_birth' => now()->subYears(30),      // Optional
            'gender' => 'other',                         // Optional
            'address' => 'Head Office',                  // Optional
            'role_id' => 1,                              // ✅ Required if role FK exists
            'is_admin' => true,                          // Optional flag
            'registration_date' => now(),
            'status' => 'active',
        ]);
    }
}


