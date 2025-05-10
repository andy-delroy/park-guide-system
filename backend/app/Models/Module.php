<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Module extends Model
{
    protected $fillable = [
        'course_id',
        'group_id',       // ✅ Include group ID for module grouping
        'title',
        'description',
        'material_type',
        'position',       // ✅ Include position for reordering within group
    ];

    public function course()
    {
        return $this->belongsTo(Course::class);
    }

    public function resources()
    {
        return $this->hasMany(ModuleResource::class);
    }

    public function group()
    {
        return $this->belongsTo(ModuleGroup::class, 'group_id');
    }
}
