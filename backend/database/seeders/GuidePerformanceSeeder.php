<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\GuidePerformanceMetric;
use App\Models\User;

class GuidePerformanceSeeder extends Seeder
{
    public function run(): void
    {
        // Match your DB structure
        $admin = User::where('role_id', 1)->first();   // 1 = admin
        $guides = User::where('role_id', 2)->get();    // 2 = guide

        if ($guides->isEmpty() || !$admin) {
            $this->command->warn('No guides or admin found. Skipping GuidePerformanceMetric seeding.');
            return;
        }

        foreach ($guides as $guide) {
            for ($i = 0; $i < 30; $i++) {
                GuidePerformanceMetric::create([
                    'guide_id' => $guide->id,
                    'assessor_id' => $admin->id,
                    'activity_date' => now()->subDays($i)->toDateString(),
                    'quiz_score' => rand(60, 100),
                    'module_completion_rate' => rand(70, 100),
                    'certified' => rand(0, 1),
                    'created_at' => now()->subDays($i),
                    'updated_at' => now()->subDays($i),
                ]);
            }
        }

        $this->command->info('✅ GuidePerformanceMetric seeded for ' . $guides->count() . ' guides.');
    }
}
