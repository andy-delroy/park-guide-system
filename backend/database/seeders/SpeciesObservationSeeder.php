<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\SpeciesObservation;
use App\Models\Species;
use App\Models\User;
use App\Models\Park;

class SpeciesObservationSeeder extends Seeder
{
    public function run()
    {
        $species = Species::all();
        $guides = User::where('role_id', 2)->get();
        $parks = Park::all();

        foreach ($guides as $guide) {
            SpeciesObservation::factory()->count(2)->create([
                'species_id' => $species->random()->id,
                'observer_id' => $guide->id,
                'park_id' => $parks->random()->id
            ]);
        }
    }
}