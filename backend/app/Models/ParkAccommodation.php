<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ParkAccommodation extends Model
{
    use HasFactory;
    protected $fillable = [
        'park_id', 'name', 'type', 'description', 'capacity',
        'price_range', 'amenities', 'booking_info', 'coordinates',
        'image_url', 'status'
    ];

    public function park()
    {
        return $this->belongsTo(Park::class);
    }
}
