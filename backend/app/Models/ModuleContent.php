<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ModuleContent extends Model
{
    use HasFactory;

    protected $fillable = [
        'training_module_id',
        'title',
        'content_type',
        'content_data',
    ];

    public function trainingModule()
    {
        return $this->belongsTo(TrainingModule::class);
    }
}
