<?php

use App\Http\Controllers\GuideController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\TrainingsController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Redirect root to dashboard
Route::redirect('/', '/dashboard');

// Public gallery — everyone can view
Route::get('/media', fn () => Inertia::render('Media/Index'))->name('media.index');
Route::get('/media/upload', fn () => Inertia::render('Media/Upload'))->name('media.upload');
// Authenticated routes (only for logged-in users)
Route::middleware(['auth', 'verified'])->group(function () {
    // Dashboard
    Route::get('/dashboard', fn () => Inertia::render('Dashboard'))->name('dashboard');

   //what are resouces?
    Route::resource('trainings', TrainingsController::class);
//    Route::resouce('user', ::class);
    Route::get('/trainings/create', [TrainingsController::class, 'create'])->name('trainings.create');
    Route::get('/my-trainings', [TrainingsController::class, 'myTrainings'])->name('my-trainings');
    Route::get('/my-trainings/download', [TrainingsController::class, 'downloadSchedule'])->name('my-trainings.download');

    // old Training management
    //Route::resource('trainings', TrainingsController::class);

    // ✅ Media Upload page (no role check)
   // Route::get('/media/upload', fn () => Inertia::render('Media/Upload'))->name('media.upload');


   //guides management
   Route::resource('guides', GuideController::class);
});

// User profile routes
Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

Route::get('/map', function () {
    return Inertia::render('Map/parkmap'); // This loads resources/js/Pages/parkmap.jsx
});

// Laravel Breeze auth routes
require __DIR__.'/auth.php';


// Route::redirect('/nigga', '/dashboard');
// Route::redirect('/nigga', '/thehood');
