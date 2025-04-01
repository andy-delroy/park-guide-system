<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run()
    {
        $this->call([
            RoleSeeder::class,
            UserSeeder::class,

            // Parks & Environment
            ParkSeeder::class,
            ParkAttractionSeeder::class,
            ParkRouteSeeder::class,
            ParkActivitySeeder::class,
            ParkAccommodationSeeder::class,

            // Species & Observations
            SpeciesSeeder::class,
            SpeciesObservationSeeder::class,

            // Training Programs
            TrainingProgramSeeder::class,
            TrainingModuleSeeder::class,
            ModuleContentSeeder::class,
            TrainingSessionSeeder::class,

            // Guide Lifecycle
            GuideEnrollmentSeeder::class,
            GuideModuleProgressSeeder::class,
            GuideCertificationSeeder::class,
            GuideFeedbackSeeder::class,
            GuidePerformanceMetricSeeder::class,
            LicenseSeeder::class,

            // IoT Systems
            IoTDeviceSeeder::class,
            IoTReadingSeeder::class,
            IoTAlertSeeder::class,

            // AI & Media
            AIIdentificationLogSeeder::class,
            MediaLibrarySeeder::class,

            // System Events
            NotificationSeeder::class,
            SystemLogSeeder::class,
        ]);
    }
}
