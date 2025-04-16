<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GuideCertification extends Model
{
    use HasFactory;
    protected $fillable = [
        'guide_id', 'certification_name', 'description', 'issue_date',
        'expiry_date', 'certificate_number', 'issued_by', 'renewal_count',
        'status', 'certificate_file_url', 'verification_code',
        'requirements_description', 'validity_period_months', 'renewal_requirements'
    ];

    // Belongs to a guide (user)
    public function guide(): BelongsTo
    {
        return $this->belongsTo(User::class, 'guide_id');
    }

    // Issued by a user (admin or instructor)
    public function issuer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'issued_by');
    }

    public function program(){
        return $this->belongsTo(TrainingProgram::class);
    }
    
    public function certifications()
    {
    return $this->hasMany(GuideCertification::class, 'guide_id');
    }
}