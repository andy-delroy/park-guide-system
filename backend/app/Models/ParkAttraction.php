<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ParkAttraction extends Model
{
    use HasFactory;
    protected $fillable = [
        'park_id', 'attraction_name', 'description', 'coordinates',
        'image_url', 'type', 'accessibility_info', 'best_visit_time',
        'created_by', 'last_updated'
    ];

    public function park()
    {
        return $this->belongsTo(Park::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
