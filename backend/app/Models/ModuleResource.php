<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ModuleResource extends Model
{
    protected $fillable = ['module_id', 'title', 'type', 'url'];

    public function module()
    {
        return $this->belongsTo(Module::class);
    }
}