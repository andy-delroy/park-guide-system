<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class License extends Model
{
    use HasFactory;
    protected $fillable = [
        'guide_id', 'license_number', 'license_type', 'issue_date',
        'expiry_date', 'status', 'issued_by', 'renewal_date',
        'renewal_reminder_sent', 'park_id', 'license_file_url'
    ];

    public function guide(): BelongsTo
    {
        return $this->belongsTo(User::class, 'guide_id');
    }

    public function issuer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'issued_by');
    }

    public function park(): BelongsTo
    {
        return $this->belongsTo(Park::class);
    }
}
