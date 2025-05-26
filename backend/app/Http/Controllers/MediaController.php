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
            Media::latest()->get()
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
    public function store(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:jpeg,png,jpg,mp4,qt',
            'caption' => 'nullable|string|max:255',
        ]);

        $file = $request->file('file');
        $mime = $file->getMimeType();

        // Automatically determine type
        $type = str_starts_with($mime, 'image/') ? 'image' :
                (str_starts_with($mime, 'video/') ? 'video' : null);

        if (!$type) {
            return response()->json(['error' => 'Unsupported file type.'], 422);
        }

        // ✅ Correct way: store on 'public' disk to get accessible path via /storage link
        $path = $file->store('media', 'public');

        // ✅ Generate correct public URL (via storage:link)
        $url = asset('storage/' . $path); // e.g. /storage/media/example.jpg

        // ✅ Save to DB
        Media::create([
            'caption' => $request->caption,
            'type' => $type,
            'url' => $url,
        ]);

        return Inertia::location(route('dashboard'));
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
    
    public function update(Request $request, $id)
    {
        $media = Media::findOrFail($id);
        $request->validate([
            'caption' => 'nullable|string|max:255',
        ]);
        $updated = $media->update([
            'caption' => $request->input('caption'),
        ]);
        if ($updated) {
            return back()->with('flash.success', 'Media updated successfully.');
        } else {
            return back()->with('flash.error', 'Failed to update media.');
        }
    }

    public function destroy($id)
    {
        $media = Media::findOrFail($id);
        $deleted = $media->delete();
        if ($deleted) {
            return back()->with('flash.success', 'Media deleted successfully.');
        } else {
            return back()->with('flash.error', 'Failed to delete media.');
        }
    }

    public function manage()
    {
        $user = Auth::user();

        // Get all media as a collection of resources
        $mediaCollection = MediaResource::collection(Media::latest()->get());

        // Return an Inertia page with the media data and user info
        return Inertia::render('Media/Manage', [
            'media' => $mediaCollection,
            'meta' => [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'role' => $user->role_name,
                ],
            ],
        ]);
    }


}
