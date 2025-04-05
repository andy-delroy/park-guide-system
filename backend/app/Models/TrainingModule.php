<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TrainingModule extends Model
{
    use HasFactory;

    protected $fillable = [
        'program_id',
        'module_name',
        'description',
        'duration_hours',
        'sequence_number',
        'learning_objectives',
        'pass_threshold',
        'content_type',
    ];

    public function trainingProgram()
    {
        return $this->belongsTo(TrainingProgram::class, 'program_id');
    }

    public function contents()
    {
        return $this->hasMany(ModuleContent::class, 'module_id');
    }
}
