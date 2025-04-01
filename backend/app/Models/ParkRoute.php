<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ParkRoute extends Model
{
    use HasFactory;
    protected $fillable = [
        'park_id', 'route_name', 'description', 'difficulty_level',
        'distance_km', 'estimated_duration', 'starting_point',
        'ending_point', 'route_path_geojson', 'elevation_profile',
        'highlights', 'cautions', 'seasonal_notes'
    ];

    public function park()
    {
        return $this->belongsTo(Park::class);
    }
}
