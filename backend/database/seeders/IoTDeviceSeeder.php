<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\IoTDevice;
use App\Models\Species;
use App\Models\Park;

class IoTDeviceSeeder extends Seeder
{
    public function run()
    {
        $species = Species::all();
        $parks = Park::all();

        IoTDevice::factory()->count(10)->create([
            'monitored_species_id' => $species->random()->id,
            'park_id' => $parks->random()->id
        ]);
    }
}
