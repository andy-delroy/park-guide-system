<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\IoTReading;
use App\Models\IoTDevice;

class IoTReadingSeeder extends Seeder
{
    public function run()
    {
        $devices = IoTDevice::all();

        foreach ($devices as $device) {
            IoTReading::factory()->count(10)->create([
                'device_id' => $device->id
            ]);
        }
    }
}