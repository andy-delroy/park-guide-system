<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Role;

class RoleSeeder extends Seeder
{
    public function run()
    {
        Role::insert([
            ['role_name' => 'Admin', 'description' => 'System administrator'],
            ['role_name' => 'ParkGuide', 'description' => 'Certified park guide'],
            ['role_name' => 'Visitor', 'description' => 'Public user']
        ]);
    }
}
