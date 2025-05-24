<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Events\SensorDataUpdated;

use App\Models\SensorLog;

class SensorLogController extends Controller
{
    public function store(Request $request)
    {
        $data = $request->validate([
            'device_id' => 'required|string',
            'temperature' => 'nullable|numeric',
            'humidity' => 'nullable|numeric',
            'soil_moisture_percent' => 'nullable|numeric',
            'rain_percent' => 'nullable|numeric',
            'distance_cm' => 'nullable|numeric',
            'recorded_at' => 'required|date',
        ]);

        $log = SensorLog::create($data);
        //fire boradcast when new sensor data is logged
        event(new SensorDataUpdated($sensorLog));

        return response()->json([
            'message' => 'Sensor log stored.',
            'log' => $log
        ], 201);
    }
}
