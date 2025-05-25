<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use App\Http\Controllers\Controller;

class IoTAlertController extends Controller
{
    public function upload(Request $request)
    {
        //the upload ritual
        $request->validate([
            'image' => 'required|image',
            'device_id' => 'required|string',
            'timestamp' => 'required|date',
        ]);

        $path = $request->file('image')->store('/captures');

        return response()->json([
            'message' => 'Image received. Stored in darkness.',
            'path' => $path,
        ]);
    }
}
