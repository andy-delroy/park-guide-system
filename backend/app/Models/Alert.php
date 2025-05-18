<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Alert extends Model
{
    protected $fillable = ['message', 'type', 'expiry', 'park_id', 'roles'];

    protected $casts = [
        'expiry' => 'datetime',
        'roles' => 'array',
    ];
}