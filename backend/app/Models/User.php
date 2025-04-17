<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\SoftDeletes;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, SoftDeletes;
    protected $fillable = [
        'username', 'password', 'email', 'phone_number', 'full_name',
        'date_of_birth', 'gender', 'address', 'role_id', 'profile_image_url',
        'identification_number', 'emergency_contact', 'biography',
        'languages_spoken', 'years_of_experience', 'specializations',
        'employment_status', 'status', 'registration_date', 'last_login'
    ];

    protected $appends = ['role_name'];

    /** ----------------------------
     *        Relationships
     *  ---------------------------- */

    public function getRoleNameAttribute(): string
    {
        return $this->role ? $this->role->role_name : 'Unknown';
    }

    // ROLE: Each user belongs to a role
    public function role(): BelongsTo
    {
        return $this->belongsTo(Role::class);
    }

    // CERTIFICATIONS: A guide can have many certifications
    public function certifications(): HasMany
    {
        return $this->hasMany(GuideCertification::class, 'guide_id');
    }

    // LICENSES: A guide can have many licenses
    public function licenses(): HasMany
    {
        return $this->hasMany(License::class, 'guide_id');
    }

    // TRAINING ENROLLMENTS
    public function enrollments(): HasMany
    {
        return $this->hasMany(GuideEnrollment::class, 'guide_id');
    }

    // TRAINING PROGRESS
    public function moduleProgress(): HasMany
    {
        return $this->hasMany(GuideModuleProgress::class, 'guide_id');
    }

    // TRAINING SESSIONS: A user may be an instructor
    public function instructedSessions(): HasMany
    {
        return $this->hasMany(TrainingSession::class, 'instructor_id');
    }

    // FEEDBACK: Guides receive feedback
    public function feedbackReceived(): HasMany
    {
        return $this->hasMany(GuideFeedback::class, 'guide_id');
    }

    // FEEDBACK: Visitors submit feedback
    public function feedbackGiven(): HasMany
    {
        return $this->hasMany(GuideFeedback::class, 'visitor_id');
    }

    // PERFORMANCE ASSESSMENTS
    public function performanceMetrics(): HasMany
    {
        return $this->hasMany(GuidePerformanceMetric::class, 'guide_id');
    }

    public function assessedMetrics(): HasMany
    {
        return $this->hasMany(GuidePerformanceMetric::class, 'assessor_id');
    }

    // SPECIES OBSERVED
    public function observations(): HasMany
    {
        return $this->hasMany(SpeciesObservation::class, 'observer_id');
    }

    public function confirmedObservations(): HasMany
    {
        return $this->hasMany(SpeciesObservation::class, 'confirmed_by');
    }

    // ALERTS RESOLVED
    public function resolvedAlerts(): HasMany
    {
        return $this->hasMany(IoTAlert::class, 'resolved_by');
    }

    // CREATED PARK ATTRACTIONS
    public function createdAttractions(): HasMany
    {
        return $this->hasMany(ParkAttraction::class, 'created_by');
    }

    // AI IDENTIFICATIONS
    public function identifications(): HasMany
    {
        return $this->hasMany(AIIdentificationLog::class, 'guide_id');
    }

    // MEDIA
    public function uploadedMedia(): HasMany
    {
        return $this->hasMany(MediaLibrary::class, 'uploaded_by');
    }

    // NOTIFICATIONS
    public function notifications(): HasMany
    {
        return $this->hasMany(Notification::class);
    }

    // LOGS
    public function systemLogs(): HasMany
    {
        return $this->hasMany(SystemLog::class);
    }
}
