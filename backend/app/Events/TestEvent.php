<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class TestEvent implements ShouldBroadcastNow
{
    use Dispatchable, SerializesModels;

    public $message;
    public $role;

    public function __construct($message, $role)
    {
        $this->message = $message;
        $this->role = $role; // role_name like 'admin', 'visitor', etc.
    }

    public function broadcastOn()
    {
        return new Channel("notifications.{$this->role}");
    }

    public function broadcastAs()
    {
        return 'test';
    }
}
