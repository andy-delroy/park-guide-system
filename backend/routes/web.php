<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\TrainingsController;
use App\Http\Controllers\Api\MediaController;

// 🆕 New Controllers for Courses
use App\Http\Controllers\CourseController;
use App\Http\Controllers\ModuleController;
use App\Http\Controllers\LessonController;
use App\Http\Controllers\ProgressController;

// 🔁 Redirect root to dashboard
Route::redirect('/', '/dashboard');

// 📸 Media Routes (Public)
Route::get('/media', fn () => Inertia::render('Media/Index'))->name('media.index');
Route::get('/media/upload', fn () => Inertia::render('Media/Upload'))->name('media.upload');
Route::get('/media/manage', fn () => Inertia::render('Media/ManageMedia'))->name('media.manage');

Route::post('/api/media/upload', [MediaController::class, 'store'])->name('media.upload.store');
Route::get('/api/media', [MediaController::class, 'index'])->name('media.api.index');

// ✅ Authenticated Area
Route::middleware(['auth', 'verified'])->group(function () {

    // Dashboard
    Route::get('/dashboard', fn () => Inertia::render('Dashboard'))->name('dashboard');

    // Trainings (your legacy feature)
    Route::resource('trainings', TrainingsController::class);
    Route::get('/my-trainings', [TrainingsController::class, 'myTrainings'])->name('my-trainings');

    // 🆕 Course System Routes (Canvas Style)
    Route::resource('courses', CourseController::class);
    Route::resource('modules', ModuleController::class)->except(['index', 'show']);
    Route::resource('lessons', LessonController::class)->except(['index']);
    
    // 🧠 Progress marking route
    Route::post('/lessons/{lesson}/complete', [ProgressController::class, 'markComplete'])->name('lessons.complete');
});

// 👤 User Profile Routes
Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

// Auth Routes (Laravel Breeze)
require __DIR__.'/auth.php';
