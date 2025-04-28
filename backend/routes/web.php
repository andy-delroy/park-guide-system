<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\TrainingsController;
use App\Http\Controllers\Api\MediaController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Redirect root to dashboard
Route::redirect('/', '/dashboard');

//
Route::get('/media', fn () => Inertia::render('Media/Index'))->name('media.index');
Route::get('/media/upload', fn () => Inertia::render('Media/Upload'))->name('media.upload');
Route::get('/media/manage', fn () => Inertia::render('Media/ManageMedia'))->name('media.manage');

Route::post('/api/media/upload', [MediaController::class, 'store'])->name('media.upload.store');
Route::get('/api/media', [MediaController::class, 'index'])->name('media.index');
// Authenticated routes (only for logged-in users)
Route::middleware(['auth', 'verified'])->group(function () {
    // Dashboard
    Route::get('/dashboard', fn () => Inertia::render('Dashboard'))->name('dashboard');

   //what are resouces?
    Route::resource('trainings', TrainingsController::class);
//    Route::resouce('user', ::class);
    Route::get('/my-trainings', [TrainingsController::class, 'myTrainings'])->name('my-trainings');
    // old Training management
    //Route::resource('trainings', TrainingsController::class);

    // Media Upload page (no role check)
   // Route::get('/media/upload', fn () => Inertia::render('Media/Upload'))->name('media.upload');
});

// User profile routes
Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

// Laravel Breeze auth routes
require __DIR__.'/auth.php';


// Route::redirect('/nigga', '/dashboard');
// Route::redirect('/nigga', '/thehood');
