<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use App\Models\SensorLog;
use Inertia\Inertia;
use Carbon\Carbon;

class IoTDashBoardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $role = optional($user->role)->role_name;

        // Fetch recent images captured
        $recentImages = [];

        if ($role === 'admin') {
            $recentImages = collect(File::files(public_path('storage/captures')))
                ->sortByDesc(fn ($file) => $file->getCTime())
                ->take(5)
                ->map(fn ($file) => [
                    'url' => asset('storage/captures/' . $file->getFilename()),
                    'filename' => $file->getFilename(),
                ])
                ->values();
        }

        // Fetch sensor data (last 50 records for charts)
        $sensorData = SensorLog::where('device_id', 'esp32-001')
            ->orderBy('recorded_at', 'desc')
            ->take(50)
            ->get([
                'temperature',
                'humidity',
                'soil_moisture_percent',
                'rain_percent',
                'distance_cm',
                'recorded_at'
            ])
            ->map(fn ($record) => [
                'temperature' => $record->temperature,
                'humidity' => $record->humidity,
                'soil' => $record->soil_moisture_percent,
                'rain' => $record->rain_percent,
                'distance' => $record->distance_cm,
                'recorded_at' => Carbon::parse($record->recorded_at)->toIso8601String(),
            ])
            ->values();

        return Inertia::render('IoT/IOTDashboard', [
            'auth' => ['user' => $user],
            'recentImages' => $recentImages,
            'sensorData' => $sensorData,
        ]);
    }
}
