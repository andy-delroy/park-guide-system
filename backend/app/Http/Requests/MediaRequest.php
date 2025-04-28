<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class MediaRequest extends FormRequest
{
    public function authorize()
    {
        return true; // Allow all users for now
    }

    public function rules()
    {
        return [
            'park_id' => 'required|integer',
            'type' => 'required|in:image,video',
            'file' => 'required|file|mimes:jpeg,png,jpg,mp4,mov|max:10240',
            'title' => 'required|string|max:150',
            'caption' => 'nullable|string|max:1000', // Increased limit for full paragraph
        ];
    }
}
