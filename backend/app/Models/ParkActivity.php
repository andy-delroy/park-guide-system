<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ParkActivity extends Model
{
    use HasFactory;
    protected $fillable = [
        'park_id', 'activity_name', 'description', 'duration',
        'price', 'booking_required', 'capacity', 'schedule_info',
        'requirements', 'image_url', 'availability'
    ];

    public function park()
    {
        return $this->belongsTo(Park::class);
    }
}
