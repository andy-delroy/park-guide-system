<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\GuidePerformanceMetric;
use App\Models\User;

class GuidePerformanceMetricSeeder extends Seeder
{
    public function run()
    {
        $guides = User::where('role_id', 2)->get();
        $assessors = User::where('role_id', 1)->get();

        foreach ($guides as $guide) {
            GuidePerformanceMetric::factory()->create([
                'guide_id' => $guide->id,
                'assessor_id' => $assessors->random()->id,
                'assessment_date' => now()->subDays(rand(0, 365)),
            ]);
        }
    }
}