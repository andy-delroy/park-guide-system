<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use App\Models\Media;

class MediaController extends Controller
{
    // Show the media gallery
    public function index()
    {
        $media = Media::latest()->take(10)->get();
        return Inertia::render('Media/Index', [
            'media' => $media
        ]);
    }

    // Show the media upload page
    public function upload()
    {
        return Inertia::render('Media/Upload');
    }

    // Store the uploaded media
    public function store(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:jpeg,png,jpg,mp4,mov,avi|max:10240',
            'caption' => 'nullable|string|max:255'
        ]);

        $path = $request->file('file')->store('media', 'public');

        $media = new Media();
        $media->url = Storage::url($path);
        $media->type = $request->file('file')->getMimeType();
        $media->caption = $request->input('caption');
        $media->save();

        return redirect()->back()->with('success', 'Media uploaded successfully.');
    }
}
