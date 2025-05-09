<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Trainings extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'start_date',
        'end_date',
        'location',
        'capacity',
    ];

    // Creator of the training //RECHECK///////
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    // Enrolled users (guides)
    public function users()
    {
        return $this->belongsToMany(User::class, 'training_user', 'training_id', 'user_id')->withTimestamps();
    }
}
