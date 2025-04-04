<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Park extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'location',
        'description',
        'area_size',
        'established_date',
    ];

    public function accommodations()
    {
        return $this->hasMany(ParkAccommodation::class);
    }

    public function activities()
    {
        return $this->hasMany(ParkActivity::class);
    }

    public function attractions()
    {
        return $this->hasMany(ParkAttraction::class);
    }

    public function routes()
    {
        return $this->hasMany(ParkRoute::class);
    }
}
