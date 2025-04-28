<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use App\Models\Media;

class MediaController extends Controller
{
    // ✅ Public - get latest 10 media
    public function index()
    {
        $media = Media::latest()->take(10)->get();

        return response()->json([
            'success' => true,
            'data' => $media,
        ]);
    }

    // ✅ Upload media (title/caption/type/file)
    public function store(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:jpeg,png,jpg,mp4,mov,avi,webm|max:51200', // 50MB max
            'title' => 'required|string|max:255',
            'caption' => 'nullable|string|max:500',
            'type' => 'required|in:image,video',
        ]);

        $path = $request->file('file')->store('media', 'public');

        $media = Media::create([
            'url' => Storage::url($path),
            'title' => $request->input('title'),
            'caption' => $request->input('caption'),
            'type' => $request->input('type'),
        ]);

        return response()->json(['success' => true, 'data' => $media], 201);
    }

    // ✅ Update title and caption
    public function update(Request $request, Media $media)
    {
        $request->validate([
            'title' => 'nullable|string|max:255',
            'caption' => 'nullable|string|max:500',
        ]);

        $media->update([
            'title' => $request->input('title', $media->title),
            'caption' => $request->input('caption', $media->caption),
        ]);

        return response()->json(['message' => 'Media updated successfully']);
    }

    // ✅ Delete a media item (and delete the actual file)
    public function destroy(Media $media)
    {
        if ($media->url && Storage::disk('public')->exists(str_replace('/storage/', '', $media->url))) {
            Storage::disk('public')->delete(str_replace('/storage/', '', $media->url));
        }

        $media->delete();

        return response()->json(['message' => 'Media deleted successfully']);
    }
}
