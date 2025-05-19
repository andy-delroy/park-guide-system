<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Notification extends Model
{
    protected $fillable = [
        'user_id',
        'role',
        'type',
        'target_channel',
        'message',
        'created_date',
        'is_read',
        'read_date',
        'expiry_date',
        'action_url',
        'priority_level',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
