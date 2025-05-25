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
        'course_id',
        'group_id',
        'created_by',     // ID of the user who created the quiz
        'position', // add this if using mass-assignment
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

    public function getGuideScoreAttribute()
    {
        $user = auth()->user();
        if (!$user) {
            return null; // Return null if no authenticated user
        }

        $guide = $this->guides()->where('guide_id', $user->id)->first();
        return $guide ? $guide->pivot->total_score : null; // Return the score from the pivot table
    }

    //failing relationships
    public function course()
    {
        return $this->belongsTo(Course::class);
    }

    public function group()
    {
        return $this->belongsTo(ModuleGroup::class, 'group_id');
    }
}
