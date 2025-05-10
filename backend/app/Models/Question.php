<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Question extends Model
{
    use HasFactory;

    // Define fillable fields
    protected $fillable = [
        'quiz_id',
        'question',
        'options',
        'question_type',
        'correct_answer',
    ];

    // Cast the options field to an array
    protected $casts = [
        'options' => 'array',
    ];

    // Relationship with Quiz
    public function quiz()
    {
        return $this->belongsTo(Quiz::class);
    }
}
