<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Park;

class ParkSeeder extends Seeder
{
    public function run()
    {
        Park::factory()->count(5)->create();
    }
}
