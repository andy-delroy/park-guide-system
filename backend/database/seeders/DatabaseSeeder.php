<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\{
    Role, User, Park, ParkActivity, ParkAttraction, ParkAccommodation, ParkRoute,
    Species, SpeciesObservation, TrainingProgram, TrainingModule, ModuleContent,
    TrainingSession, GuideEnrollment, GuideModuleProgress,
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

        // Specific test users for admins
        $admins = [
            User::factory()->create([
                'username' => 'admin1',
                'password' => bcrypt('adminpass1'),
                'email' => 'admin1@example.com',
                'role_id' => $adminRole->id,
                'profile_image_url' => 'http://172.17.0.156:8000/mobile/assets/placeholder.jpg',
            ]),
            User::factory()->create([
                'username' => 'admin2',
                'password' => bcrypt('adminpass2'),
                'email' => 'admin2@example.com',
                'role_id' => $adminRole->id,
                'profile_image_url' => 'http://172.17.0.156:8000/mobile/assets/placeholder.jpg',
            ]),
        ];

        // Specific test users for guides
        $guides = [
            User::factory()->create([
                'username' => 'guide1',
                'password' => bcrypt('guidepass1'),
                'email' => 'guide1@example.com',
                'role_id' => $guideRole->id,
                'profile_image_url' => 'http://172.17.0.156:8000/mobile/assets/placeholder.jpg',
            ]),
            User::factory()->create([
                'username' => 'guide2',
                'password' => bcrypt('guidepass2'),
                'email' => 'guide2@example.com',
                'role_id' => $guideRole->id,
                'profile_image_url' => 'http://172.17.0.156:8000/mobile/assets/placeholder.jpg',
            ]),
            User::factory()->create([
                'username' => 'guide3',
                'password' => bcrypt('guidepass3'),
                'email' => 'guide3@example.com',
                'role_id' => $guideRole->id,
                'profile_image_url' => 'http://172.17.0.156:8000/mobile/assets/placeholder.jpg',
            ]),
        ];

        // Specific test users for visitors
        $visitors = [
            User::factory()->create([
                'username' => 'visitor1',
                'password' => bcrypt('visitorpass1'),
                'email' => 'visitor1@example.com',
                'role_id' => $visitorRole->id,
                'profile_image_url' => 'http://172.17.0.156:8000/mobile/assets/placeholder.jpg',
            ]),
            User::factory()->create([
                'username' => 'visitor2',
                'password' => bcrypt('visitorpass2'),
                'email' => 'visitor2@example.com',
                'role_id' => $visitorRole->id,
                'profile_image_url' => 'http://172.17.0.156:8000/mobile/assets/placeholder.jpg',
            ]),
            User::factory()->create([
                'username' => 'visitor3',
                'password' => bcrypt('visitorpass3'),
                'email' => 'visitor3@example.com',
                'role_id' => $visitorRole->id,
                'profile_image_url' => 'http://172.17.0.156:8000/mobile/assets/placeholder.jpg',
            ]),
        ];

        // Optional: Add more random users if needed for testing
        // $extraGuides = User::factory()->count(2)->create(['role_id' => $guideRole->id]);
        // $extraVisitors = User::factory()->count(2)->create(['role_id' => $visitorRole->id]);

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
            'created_by' => $admins[array_rand($admins)]->id
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
            'instructor_id' => $admins[array_rand($admins)]->id,
        ]);

        foreach ($guides as $guide) {
            $session = $sessions->random();
            GuideEnrollment::factory()->create([
                'guide_id' => $guide->id,
                'session_id' => $session->id
            ]);

            $relatedModules = $session->program->modules ?? [];
            foreach ($relatedModules as $module) {
                GuideModuleProgress::factory()->create([
                    'guide_id' => $guide->id,
                    'module_id' => $module->id
                ]);
            }
        }

        // Feedback
        foreach ($guides as $guide) {
            GuideFeedback::factory()->create([
                'guide_id' => $guide->id,
                'visitor_id' => $visitors[array_rand($visitors)]->id,
                'park_id' => $parks->random()->id
            ]);
        }

        // Performance Metrics
        foreach ($guides as $guide) {
            GuidePerformanceMetric::factory()->create([
                'guide_id' => $guide->id,
                'assessor_id' => $admins[array_rand($admins)]->id
            ]);
        }

        // Licenses
        foreach ($guides as $guide) {
            License::factory()->create([
                'guide_id' => $guide->id,
                'issued_by' => $admins[array_rand($admins)]->id,
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

        // Courses
        $this->call(CourseSeeder::class);
        //quize guide seeder
        $this->call(GuideQuizSeeder::class);
        $this->call(TrainingSeeder::class);
        $this->command->info('All data seeded successfully with relational integrity! 🌱');
        $this->command->info('Test accounts created:');
        $this->command->info('Admins: admin1/adminpass1, admin2/adminpass2');
        $this->command->info('Guides: guide1/guidepass1, guide2/guidepass2, guide3/guidepass3');
        $this->command->info('Visitors: visitor1/visitorpass1, visitor2/visitorpass2, visitor3/visitorpass3');

    }
}