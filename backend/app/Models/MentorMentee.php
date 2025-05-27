<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MentorMentee extends Model
{
    protected $table = 'mentor_mentee';
    protected $fillable = ['mentor_id', 'mentee_id', 'message'];
}
