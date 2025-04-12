<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class MediaRequest extends FormRequest
{
    public function authorize()
    {
        return true; // Adjust authorization logic as needed
    }

    public function rules()
    {
        return [
            'park_id' => 'required|integer', // temporarily removed 'exists' rule
            'type' => 'required|in:image,video',
            'file' => 'required|file|mimes:jpeg,png,jpg,mp4,mov|max:10240',
            'caption' => 'nullable|string|max:255',
        ];
    }
}
