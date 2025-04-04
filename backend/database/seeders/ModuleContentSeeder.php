<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\TrainingModule;
use App\Models\ModuleContent;

class ModuleContentSeeder extends Seeder
{
    public function run()
    {
        $modules = TrainingModule::all();
        foreach ($modules as $module) {
            ModuleContent::factory()->count(3)->create(['module_id' => $module->id]);
        }
    }
}