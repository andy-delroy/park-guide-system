<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class IoTDevice extends Model
{
    use HasFactory;
    protected $fillable = [
        'device_type', 'serial_number', 'installation_date', 'last_maintenance_date',
        'status', 'coordinates', 'battery_level', 'firmware_version',
        'park_id', 'monitored_species_id'
    ];

    public function park()
    {
        return $this->belongsTo(Park::class);
    }

    public function species()
    {
        return $this->belongsTo(Species::class, 'monitored_species_id');
    }

    public function readings()
    {
        return $this->hasMany(IoTReading::class);
    }

    public function alerts()
    {
        return $this->hasMany(IoTAlert::class);
    }
}
