<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Quiz;
use App\Models\User;

class QuizSeeder extends Seeder
{
    public function run(): void
    {
        // Fetch all admins (or any user who can be a quiz creator)
        $creators = User::whereHas('role', function ($q) {
            $q->where('role_name', 'admin');
        })->get();

        if ($creators->isEmpty()) {
            $this->command->warn('No admins found to assign as quiz creators.');
            return;
        }

        // Generate 10 quizzes
        foreach (range(1, 10) as $i) {
            Quiz::create([
                'title'        => "Sample Quiz $i",
                'description'  => "This is the description for Sample Quiz $i.",
                'time_duration'=> rand(300, 900), // 5–15 mins
                'total_score'  => 100,
                'created_by'   => $creators->random()->id,
            ]);
        }

        $this->command->info('🧠 Quizzes table seeded successfully!');
    }
}
