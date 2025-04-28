<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TrainingSession extends Model
{
    use HasFactory;
    protected $fillable = [
        'program_id', 'session_name', 'start_date', 'end_date', 'location',
        'capacity', 'instructor_id', 'description', 'status'
    ];

    public function program()
    {
        return $this->belongsTo(TrainingProgram::class);
    }

    public function instructor()
    {
        return $this->belongsTo(User::class, 'instructor_id');
    }

    public function enrollments()
    {
        return $this->hasMany(GuideEnrollment::class, 'session_id');
    }
}
