<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $role = optional($user->role)->role_name;

        $recentImages = [];

        if ($role === 'admin') {
            $recentImages = collect(File::files(public_path('storage/captures')))
                ->sortByDesc(fn ($file) => $file->getCTime())
                ->take(5)
                ->map(fn ($file) => [
                    'url' => asset('storage/captures/' . $file->getFilename()),
                    'filename' => $file->getFilename(),
                ])
                ->values();
        }

        return Inertia::render('Dashboard', [
            'auth' => ['user' => $user],
            'recentImages' => $recentImages,
        ]);
    }
}
