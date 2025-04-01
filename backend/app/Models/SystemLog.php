<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SystemLog extends Model
{
    protected $fillable = [
        'user_id', 'action', 'action_timestamp', 'ip_address',
        'user_agent', 'action_details', 'status',
        'affected_entity_type', 'affected_entity_id'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
