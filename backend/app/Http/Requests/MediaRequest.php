<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class MediaRequest extends FormRequest
{
    public function authorize()
    {
        return true; // Adjust this if needed for auth checks
    }

    public function rules()
    {
        return [
            'type' => 'required|in:image,video',
            'file' => 'required|file|max:10240', // mime validated conditionally below
            'caption' => 'nullable|string|max:255',
        ];
    }

    public function withValidator($validator)
    {
        $validator->sometimes('file', 'mimes:jpeg,jpg,png', function ($input) {
            return $input->type === 'image';
        });

        $validator->sometimes('file', 'mimes:mp4,mov', function ($input) {
            return $input->type === 'video';
        });
    }
}
