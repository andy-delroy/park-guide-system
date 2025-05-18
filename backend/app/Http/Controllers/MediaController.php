<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Requests\MediaRequest;
use App\Http\Resources\MediaResource;
use App\Models\Media;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Auth;

class MediaController extends Controller
{
    /**
     * Display a listing of the media.
     */
    public function index()
    {
        $user = Auth::user(); // Get the authenticated user

        return MediaResource::collection(
            Media::latest()->take(10)->get()
        )->additional([
            'meta' => [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'role' => $user->role_name,
                ]
            ]
        ]);
    }

    public function create()
    {
        return Inertia::render('Media/Create');
    }

    /**
     * Store a newly created media in storage.
     */
    public function store(MediaRequest $request)
    {
        $validated = $request->validated();

        $path = $request->file('file')->store('media', 'public');
        $url = asset('storage/' . $path);

        Media::create([
            'type' => $validated['type'],
            'url' => $url,
            'caption' => $validated['caption'] ?? null,
        ]);

        // For Inertia requests, redirect with Inertia::location
        return Inertia::location(route('media.index'));
    }


    /**
     * Display a single media item.
     */
    public function show(Media $media)
    {
        return new MediaResource($media);
    }

    /**
     * Update an existing media item.
     */
    public function update(Request $request, Media $media)
    {
        $request->validate([
            'caption' => 'nullable|string|max:255',
            'file' => 'nullable|file|mimes:jpeg,png,jpg,mp4,mov|max:10240',
        ]);

        // Update the media URL if a new file is uploaded
        if ($request->hasFile('file')) {
            $path = $request->file('file')->store('media', 'public');
            $media->url = asset('storage/' . $path);
        }

        if ($request->filled('caption')) {
            $media->caption = $request->caption;
        }

        $media->save();

        return new MediaResource($media);
    }

    /**
     * Delete a media item.
     */
    public function destroy(Media $media)
    {
        $media->delete();

        return response()->json([
            'message' => 'Media deleted successfully.'
        ], 200);
    }
}
