<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Quiz extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'title',          // Quiz title
        'description',    // Quiz description
        'time_duration',  // Time duration in minutes
        'total_score',    // Total score for the quiz
        'created_by',     // ID of the user who created the quiz
    ];

    /**
     * Relationship: The user who created the quiz.
     */
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
    
    public function questions()
    {
        return $this->hasMany(Question::class);
    }

    public function guides()
    {
        return $this->belongsToMany(User::class, 'quiz_guide', 'quiz_id', 'guide_id')
                    ->withPivot('total_score', 'time_taken')
                    ->withTimestamps();
    }
}
