<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class IoTAlert extends Model
{
    use HasFactory;
    protected $fillable = [
        'device_id', 'alert_timestamp', 'alert_type', 'alert_message',
        'severity_level', 'coordinates', 'resolved', 'resolved_by',
        'resolution_timestamp', 'resolution_notes'
    ];

    public function device()
    {
        return $this->belongsTo(IoTDevice::class);
    }

    public function resolvedBy()
    {
        return $this->belongsTo(User::class, 'resolved_by');
    }
}
