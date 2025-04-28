<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Notification extends Model
{
    use HasFactory;
    protected $fillable = [
        'user_id', 'title', 'message', 'notification_type',
        'created_date', 'is_read', 'read_date', 'expiry_date',
        'action_url', 'priority_level'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
