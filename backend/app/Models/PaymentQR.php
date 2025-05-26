<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PaymentQR extends Model
{
    protected $fillable = ['label', 'image_path'];

    
    protected $table = 'payment_qrs';
}