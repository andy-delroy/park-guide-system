<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\{
    Role, User, Park, ParkActivity, ParkAttraction, ParkAccommodation, ParkRoute,
    Species, SpeciesObservation, TrainingProgram, TrainingModule, ModuleContent,
    TrainingSession, GuideEnrollment, GuideModuleProgress, GuideCertification,
    GuideFeedback, GuidePerformanceMetric, License, IoTDevice, IoTReading, IoTAlert,
    AIIdentificationLog, MediaLibrary,
    Trainings
};

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Roles
        $adminRole = Role::factory()->create(['role_name' => 'admin']);
        $guideRole = Role::factory()->create(['role_name' => 'guide']);
        $visitorRole = Role::factory()->create(['role_name' => 'visitor']);

        // Users
        $admins = User::factory()->count(2)->create(['role_id' => $adminRole->id]);
        $guides = User::factory()->count(10)->create(['role_id' => $guideRole->id]);
        $visitors = User::factory()->count(20)->create(['role_id' => $visitorRole->id]);

        // Parks
        $parks = Park::factory()->count(5)->create();

        // Park details
        foreach ($parks as $park) {
            ParkActivity::factory()->count(3)->create(['park_id' => $park->id]);
            ParkAttraction::factory()->count(3)->create(['park_id' => $park->id]);
            ParkAccommodation::factory()->count(2)->create(['park_id' => $park->id]);
            ParkRoute::factory()->count(2)->create(['park_id' => $park->id]);
        }

        // Trainings
        $trainings = Trainings::factory()->count(10)->create();

        // Species
        $speciesList = Species::factory()->count(10)->create();

        // Species Observations
        foreach ($guides as $guide) {
            SpeciesObservation::factory()->count(2)->create([
                'observer_id' => $guide->id,
                'species_id' => $speciesList->random()->id,
                'park_id' => $parks->random()->id
            ]);
        }

        // Training Programs + Modules + Content
        $programs = TrainingProgram::factory()->count(3)->create([
            'created_by' => $admins->random()->id
        ]);

        foreach ($programs as $program) {
            $modules = TrainingModule::factory()->count(3)->create(['program_id' => $program->id]);
            foreach ($modules as $module) {
                ModuleContent::factory()->count(2)->create(['module_id' => $module->id]);
            }
        }

        // Sessions + Enrollments + Progress
        $sessions = TrainingSession::factory()->count(5)->create([
            'program_id' => $programs->random()->id,
            'instructor_id' => $admins->random()->id,
        ]);

        foreach ($guides as $guide) {
            $session = $sessions->random();
            GuideEnrollment::factory()->create([
                'guide_id' => $guide->id,
                'session_id' => $session->id
            ]);

            // Progress on all modules from the program
            $relatedModules = $session->program->modules ?? [];
            foreach ($relatedModules as $module) {
                GuideModuleProgress::factory()->create([
                    'guide_id' => $guide->id,
                    'module_id' => $module->id
                ]);
            }

            // Certification
            GuideCertification::factory()->create([
                'guide_id' => $guide->id,
                'program_id' => $session->program->id
            ]);
        }

        // Feedback
        foreach ($guides as $guide) {
            GuideFeedback::factory()->create([
                'guide_id' => $guide->id,
                'visitor_id' => $visitors->random()->id,
                'park_id' => $parks->random()->id
            ]);
        }

        // Performance Metrics
        foreach ($guides as $guide) {
            GuidePerformanceMetric::factory()->create([
                'guide_id' => $guide->id,
                'assessor_id' => $admins->random()->id
            ]);
        }

        // Licenses
        foreach ($guides as $guide) {
            License::factory()->create([
                'guide_id' => $guide->id,
                'issued_by' => $admins->random()->id,
                'park_id' => $parks->random()->id
            ]);
        }

        // IoT Devices + Readings + Alerts
        $devices = IoTDevice::factory()->count(5)->create(['park_id' => $parks->random()->id]);
        foreach ($devices as $device) {
            IoTReading::factory()->count(3)->create(['device_id' => $device->id]);
            IoTAlert::factory()->create(['device_id' => $device->id]);
        }

        // AI Identification Logs
        foreach ($guides as $guide) {
            AIIdentificationLog::factory()->create([
                'guide_id' => $guide->id,
                'identified_species_id' => $speciesList->random()->id
            ]);
        }

        // Media Library
        foreach ($visitors as $visitor) {
            MediaLibrary::factory()->create([
                'uploaded_by' => $visitor->id,
                'park_id' => $parks->random()->id,
                'species_id' => $speciesList->random()->id
            ]);
        }

        $this->command->info('All data seeded successfully with relational integrity! 🌱');
    }
}
