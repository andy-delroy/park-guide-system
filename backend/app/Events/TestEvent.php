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

    public function __construct($role, $message)
    {
        $this->role = $role;
        $this->message = $message;
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
