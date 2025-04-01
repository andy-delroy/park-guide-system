<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\TrainingSession;
use App\Models\TrainingProgram;
use App\Models\User;

class TrainingSessionSeeder extends Seeder
{
    public function run()
    {
        $programs = TrainingProgram::all();
        $instructors = User::where('role_id', 2)->get();

        foreach ($programs as $program) {
            TrainingSession::factory()->count(2)->create([
                'program_id' => $program->id,
                'instructor_id' => $instructors->random()->id,
            ]);
        }
    }
}
