<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;


class TestBroadcast implements ShouldBroadcast
{
    use SerializesModels;

    public $message;
    /**
     * Create a new event instance.
     */
    public function __construct()
    {
        //
        $this->message = 'This is a test broadcast!';
        Log::info('🔥 TestBroadcast event constructed');
    }

    public function broadcastOn()
    {
        return new Channel('sensor-data');
    }

    public function broadcastAs()
    {
        return 'sensor-data-updated';
    }

    public function broadcastWith()
    {
        return ['message' => $this->message];
    }
}
