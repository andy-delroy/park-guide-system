<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;

class TestEvent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets;

    public $message;
    public $channel;
    public $priority;

    public function __construct($message, $channel, $priority)
    {
        $this->message = $message;
        $this->channel = $channel;
        $this->priority = $priority;
    }

    public function broadcastOn()
    {
        return new Channel($this->channel);
    }

    public function broadcastAs()
    {
        return '.test';
    }

    public function broadcastWith()
    {
        return [
            'message' => $this->message,
            'channel' => $this->channel,
            'priority' => $this->priority,
        ];
    }
}