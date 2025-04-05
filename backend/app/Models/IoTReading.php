<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class IoTReading extends Model
{
    use HasFactory;
    protected $fillable = [
        'device_id', 'reading_timestamp', 'temperature', 'humidity',
        'light_level', 'motion_detected', 'battery_level',
        'other_sensor_data_json', 'alert_triggered'
    ];

    public function device()
    {
        return $this->belongsTo(IoTDevice::class);
    }
}
