<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TrainingProgram extends Model
{
    use HasFactory;

    protected $fillable = [
        'program_name',
        'description',
        'duration_hours',
        'prerequisite_program_id',
        'created_by',
        'status',
        'required_for_certification',
    ];

    public function modules()
    {
        return $this->hasMany(TrainingModule::class, 'program_id');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function certification(){
        return $this->hasOne(GuideCertification::class);
    }
}
