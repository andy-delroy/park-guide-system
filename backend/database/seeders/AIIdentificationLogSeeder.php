<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\AIIdentificationLog;
use App\Models\User;
use App\Models\Species;

class AIIdentificationLogSeeder extends Seeder
{
    public function run()
    {
        $guides = User::where('role_id', 2)->get();
        $species = Species::all();

        foreach ($guides as $guide) {
            AIIdentificationLog::factory()->count(2)->create([
                'guide_id' => $guide->id,
                'identified_species_id' => $species->random()->id
            ]);
        }
    }
}