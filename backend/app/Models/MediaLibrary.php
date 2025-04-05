<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MediaLibrary extends Model
{
    use HasFactory;
    protected $fillable = [
        'title', 'description', 'media_type', 'file_url',
        'upload_date', 'uploaded_by', 'tags',
        'park_id', 'species_id', 'is_public', 'approval_status'
    ];

    public function uploader()
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

    public function park()
    {
        return $this->belongsTo(Park::class);
    }

    public function species()
    {
        return $this->belongsTo(Species::class);
    }
}
