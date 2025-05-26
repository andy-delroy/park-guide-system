<?php

// app/Http/Controllers/AdminUploadController.php
namespace App\Http\Controllers;

use App\Models\PaymentQR;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminUploadController extends Controller
{
    public function show()
    {
        $qr = PaymentQR::latest()->first();
        return Inertia::render('Admin/UploadQR', ['qr' => $qr]);
    }

    public function upload(Request $request)
    {
        $request->validate([
            'qr_image' => 'required|image|mimes:png,jpg,jpeg|max:2048'
        ]);

        $path = $request->file('qr_image')->store('qr_codes', 'public');

        PaymentQR::create([
            'label' => 'QR uploaded on ' . now(),
            'image_path' => $path,
        ]);

        return redirect()->back()->with('success', 'QR code updated successfully.');
    }
}
