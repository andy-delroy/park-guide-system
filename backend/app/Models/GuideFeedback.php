<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GuideFeedback extends Model
{
    use HasFactory;
    protected $fillable = [
        'guide_id', 'visitor_id', 'tour_date', 'rating', 'comments',
        'feedback_categories', 'submitted_date', 'is_public',
        'status', 'park_id'
    ];

    public function guide(): BelongsTo
    {
        return $this->belongsTo(User::class, 'guide_id');
    }

    public function visitor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'visitor_id');
    }

    public function park(): BelongsTo
    {
        return $this->belongsTo(Park::class);
    }
}
