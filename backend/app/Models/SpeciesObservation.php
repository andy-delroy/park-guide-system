<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SpeciesObservation extends Model
{
    use HasFactory;
    protected $fillable = [
        'species_id', 'observer_id', 'park_id', 'observation_date',
        'coordinates', 'notes', 'image_url', 'confirmed_by', 'confirmation_status'
    ];

    public function species()
    {
        return $this->belongsTo(Species::class);
    }

    public function observer()
    {
        return $this->belongsTo(User::class, 'observer_id');
    }

    public function confirmedBy()
    {
        return $this->belongsTo(User::class, 'confirmed_by');
    }

    public function park()
    {
        return $this->belongsTo(Park::class);
    }
}
