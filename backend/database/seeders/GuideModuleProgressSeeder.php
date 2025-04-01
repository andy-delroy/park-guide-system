<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\GuideModuleProgress;
use App\Models\GuideEnrollment;
use App\Models\TrainingModule;
use App\Models\User;

class GuideModuleProgressSeeder extends Seeder
{
    public function run()
    {
        $enrollments = GuideEnrollment::all();
        $modules = TrainingModule::all();

        foreach ($enrollments as $enrollment) {
            $guideId = $enrollment->guide_id;
            foreach ($modules->random(3) as $module) {
                GuideModuleProgress::factory()->create([
                    'guide_id' => $guideId,
                    'module_id' => $module->id,
                    'enrollment_id' => $enrollment->id
                ]);
            }
        }
    }
}
