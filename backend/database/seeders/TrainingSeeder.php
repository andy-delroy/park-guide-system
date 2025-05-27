<?php

namespace Database\Seeders;

use App\Models\Trainings;
use Illuminate\Database\Seeder;

class TrainingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Use the factory to create 10 realistic training records
        Trainings::factory()->count(10)->create();
    }
}
