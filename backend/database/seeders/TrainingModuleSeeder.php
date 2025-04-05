<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\TrainingModule;
use App\Models\TrainingProgram;

class TrainingModuleSeeder extends Seeder
{
    public function run()
    {
        $programs = TrainingProgram::all();
        foreach ($programs as $program) {
            TrainingModule::factory()->count(5)->create(['program_id' => $program->id]);
        }
    }
}
