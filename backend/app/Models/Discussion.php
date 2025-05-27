<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Discussion extends Model
{
    protected $fillable = [ 'mentor_id', 'mentee_id', 'user_id', 'message', 'answer' ];
}
