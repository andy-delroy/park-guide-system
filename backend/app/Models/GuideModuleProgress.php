<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GuideModuleProgress extends Model
{
    use HasFactory;
    protected $fillable = [
        'guide_id', 'module_id', 'enrollment_id', 'start_date',
        'completion_date', 'score', 'attempt_number',
        'completion_status', 'last_activity_timestamp'
    ];

    public function guide(): BelongsTo
    {
        return $this->belongsTo(User::class, 'guide_id');
    }

    public function module(): BelongsTo
    {
        return $this->belongsTo(TrainingModule::class, 'module_id');
    }

    public function enrollment(): BelongsTo
    {
        return $this->belongsTo(GuideEnrollment::class, 'enrollment_id');
    }
}
