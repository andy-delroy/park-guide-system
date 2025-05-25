<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Certification extends Model
{
    protected $table = 'guide_certifications';

    protected $fillable = [
        'guide_id',
        'course_id',
        'certification_name',
        'certificate_number',
        'description',
        'certificate_file_url',
        'issued_by',
        'issue_date',
        'expiry_date',
        'status',
    ];

    public function guide()
    {
        return $this->belongsTo(User::class, 'guide_id');
    }

    public function course()
    {
        return $this->belongsTo(Course::class, 'course_id');
    }

    public function tasks()
    {
        return $this->hasMany(Task::class);
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updatedBy()
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    public function issuedBy()
    {
    return $this->belongsTo(User::class, 'issued_by');
    }
    public function issuer()
    {
    return $this->belongsTo(User::class, 'issued_by');
    }
}
