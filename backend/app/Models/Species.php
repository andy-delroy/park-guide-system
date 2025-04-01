<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Species extends Model
{
    use HasFactory;
    protected $fillable = [
        'scientific_name', 'common_name', 'species_type',
        'conservation_status', 'description', 'habitat',
        'image_url', 'taxonomy_info', 'is_endangered',
        'is_protected', 'notes'
    ];

    public function observations()
    {
        return $this->hasMany(SpeciesObservation::class);
    }

    public function monitoredByDevices()
    {
        return $this->hasMany(IoTDevice::class, 'monitored_species_id');
    }

    public function identifications()
    {
        return $this->hasMany(AIIdentificationLog::class, 'identified_species_id');
    }

    public function media()
    {
        return $this->hasMany(MediaLibrary::class, 'species_id');
    }
}
