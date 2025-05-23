<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Course extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'category',
        'duration',
    ];
    
    public function modules()
    {
        return $this->hasMany(Module::class);
    }

    
    public function users()
    {
        return $this->belongsToMany(User::class, 'course_user');
    }
}
