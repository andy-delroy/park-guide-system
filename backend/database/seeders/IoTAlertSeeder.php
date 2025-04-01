<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\IoTAlert;
use App\Models\IoTDevice;

class IoTAlertSeeder extends Seeder
{
    public function run()
    {
        $devices = IoTDevice::all();

        foreach ($devices as $device) {
            IoTAlert::factory()->count(2)->create([
                'device_id' => $device->id
            ]);
        }
    }
}
