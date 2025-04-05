<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GuidePerformanceMetric extends Model
{
    use HasFactory;
    protected $fillable = [
        'guide_id', 'assessment_date', 'assessor_id',
        'knowledge_score', 'communication_score', 'safety_score',
        'customer_service_score', 'conservation_awareness_score',
        'overall_score', 'comments', 'improvement_plan'
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
