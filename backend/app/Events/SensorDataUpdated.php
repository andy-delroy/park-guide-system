<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use App\Models\SensorLog;
use Carbon\Carbon;

class SensorDataUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $sensorData;

    /**
     * Create a new event instance.
     */
    public function __construct(SensorLog $sensorLog)
    {
        //
        $this->sensorData = [
            'temperature' => $sensorLog->temperature,
            'humidity' => $sensorLog->humidity,
            'soil' => $sensorLog->soil_moisture_percent,
            'rain' => $sensorLog->rain_percent,
            'distance' => $sensorLog->distance_cm,
            'recorded_at' => Carbon::parse($sensorLog->recorded_at)->toIso8601String(),
            
        ];
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        return new Channel('sensor-data');
    }

    public function broadcastAs()
    {
        return 'sensor-data-updated';
    }
}
