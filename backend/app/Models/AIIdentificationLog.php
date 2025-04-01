<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AIIdentificationLog extends Model
{
    use HasFactory;
    protected $fillable = [
        'guide_id', 'image_url', 'submission_timestamp',
        'identified_species_id', 'confidence_score',
        'alternative_identifications_json', 'feedback_provided',
        'user_feedback'
    ];

    public function guide()
    {
        return $this->belongsTo(User::class, 'guide_id');
    }

    public function species()
    {
        return $this->belongsTo(Species::class, 'identified_species_id');
    }
}
