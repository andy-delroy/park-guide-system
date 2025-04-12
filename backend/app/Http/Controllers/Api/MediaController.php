<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\MediaRequest;
use App\Http\Resources\MediaResource;
use App\Models\Media;
use Illuminate\Http\Request;

class MediaController extends Controller
{
    /**
     * Display a listing of the media.
     */
    public function index()
    {
        return MediaResource::collection(
            Media::latest()->take(10)->get()
        );
    }

    /**
     * Store a newly created media in storage.
     */
    public function store(MediaRequest $request)
    {
        $validated = $request->validated();

        // Store the file locally
        $path = $request->file('file')->store('media', 'public');
        $url = asset('storage/' . $path);

        $media = Media::create([
            'park_id' => $validated['park_id'],
            'type' => $validated['type'],
            'url' => $url,
            'caption' => $validated['caption'],
        ]);

        return redirect()->route('media.index')->with('success', 'Media uploaded!');
    }

    /**
     * Update an existing media post.
     */
    public function update(Request $request, Media $media)
    {
        $request->validate([
            'caption' => 'nullable|string|max:255',
            'file' => 'nullable|file|mimes:jpeg,png,jpg,mp4,mov|max:10240',
        ]);

        // If file is provided, update the media URL
        if ($request->hasFile('file')) {
            $path = $request->file('file')->store('media', 'public');
            $media->url = asset('storage/' . $path);
        }

        // Always update caption if present
        if ($request->has('caption')) {
            $media->caption = $request->caption;
        }

        $media->save();

        return new MediaResource($media);
    }

    /**
     * Delete a media post.
     */
    public function destroy(Media $media)
    {
        $media->delete();
        return response()->json(['message' => 'Media deleted']);
    }

    /**
     * Show a single media post.
     */
    public function show(Media $media)
    {
        return new MediaResource($media);
    }
}
