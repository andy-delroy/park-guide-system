<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Quiz;
use Illuminate\Support\Facades\DB;

class GuideQuizSeeder extends Seeder
{
    public function run(): void
    {
        // Fetch all available quizzes
        $quizzes = Quiz::all();

        // Fetch all guides (users with the role "guide")
        $guides = User::whereHas('role', function ($q) {
            $q->where('role_name', 'guide');
        })->get();

        if($guides->isEmpty()) {
            $this->command->info('No guides found to assign quizzes.');
            return;
        } else {
            $this->command->info('Found ' . $guides->count() . ' guides to assign quizzes.');
        }

        foreach ($guides as $guide) {
            // Pick up to 3 random quizzes for each guide
            $assignedQuizzes = $quizzes->count() >= 3 ? $quizzes->random(3) : $quizzes;

            if($assignedQuizzes->isEmpty()) {
                $this->command->info('No quizzes found to assign to guide ' . $guide->username);
                continue;
            } else {
                $this->command->info('Assigning ' . $assignedQuizzes->count() . ' quizzes to guide ' . $guide->username);
            }
            foreach ($assignedQuizzes as $quiz) {
                // Insert into quiz_guide table
                DB::table('quiz_guide')->insert([
                    'quiz_id'     => $quiz->id,
                    'guide_id'    => $guide->id,
                    'total_score' => rand(60, 100),
                    'time_taken'  => rand(300, 1200), // seconds
                    'created_at'  => now(),
                    'updated_at'  => now(),
                ]);
            }
        }

        // $this->command->info('this nigga seeded🌱');
    }
}
