<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Module extends Model
{
    protected $fillable = ['course_id', 'title', 'description', 'material_type'];

    public function course()
    {
        return $this->belongsTo(Course::class);
    }

    public function resources()
    {
        return $this->hasMany(ModuleResource::class);
    }
}