<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\TrainingProgram;

class TrainingProgramSeeder extends Seeder
{
    public function run()
    {
        TrainingProgram::factory()->count(3)->create();
    }
}
