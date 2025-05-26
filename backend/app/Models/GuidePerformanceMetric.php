<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GuidePerformanceMetric extends Model
{
    use HasFactory;

    protected $fillable = [
        'guide_id',
        'assessor_id',
        'activity_date',
        'quiz_score',
        'module_completion_rate',
        'certified',
    ];

    public function guide()
    {
        return $this->belongsTo(User::class, 'guide_id');
    }

    public function assessor()
    {
        return $this->belongsTo(User::class, 'assessor_id');
    }
}
