<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class GuideEnrollment extends Model
{
    use HasFactory;
    protected $fillable = [
        'guide_id', 'session_id', 'enrollment_date',
        'completion_status', 'completion_date', 'notes'
    ];

    public function guide(): BelongsTo
    {
        return $this->belongsTo(User::class, 'guide_id');
    }

    public function session(): BelongsTo
    {
        return $this->belongsTo(TrainingSession::class);
    }

    public function moduleProgress(): HasMany
    {
        return $this->hasMany(GuideModuleProgress::class, 'enrollment_id');
    }
}
