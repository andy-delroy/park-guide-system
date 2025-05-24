<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SensorLog extends Model
{
    protected $fillable = [
        'device_id',
        'temperature',
        'humidity',
        'soil_moisture_percent',
        'rain_percent',
        'distance_cm',
        'recorded_at',
    ];
    protected $casts = [
        'recorded_at' => 'datetime',
    ];

    public $timestamps = true;
}
