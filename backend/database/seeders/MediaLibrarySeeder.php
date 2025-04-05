<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\MediaLibrary;
use App\Models\User;
use App\Models\Park;
use App\Models\Species;

class MediaLibrarySeeder extends Seeder
{
    public function run()
    {
        $users = User::all();
        $parks = Park::all();
        $species = Species::all();

        MediaLibrary::factory()->count(10)->create([
            'uploaded_by' => $users->random()->id,
            'park_id' => $parks->random()->id,
            'species_id' => $species->random()->id
        ]);
    }
}