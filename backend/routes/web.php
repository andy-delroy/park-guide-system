<?php

use App\Http\Controllers\GuideController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\TrainingsController;
use App\Http\Controllers\CertificationController;
use App\Http\Controllers\UserController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
use App\Events\TestEvent;
use Inertia\Inertia;
use App\Models\Notification;
use App\Http\Controllers\CourseController;
use App\Http\Controllers\ModuleController;
use App\Models\Alert;
use App\Events\AlertCreated;
use App\Http\Controllers\AlertController;
use App\Http\Controllers\Admin\AlertAdminController;
use App\Http\Controllers\NotificationController;

// Redirect root to dashboard
Route::redirect('/', '/dashboard');

// Public gallery — everyone can view
Route::get('/media', fn () => Inertia::render('Media/Index'))->name('media.index');
Route::get('/media/upload', fn () => Inertia::render('Media/Upload'))->name('media.upload');
// Authenticated routes (only for logged-in users)
Route::middleware(['auth', 'verified'])->group(function () {
    // Dashboard
    Route::get('/dashboard', fn () => Inertia::render('Dashboard'))->name('dashboard');
    Route::resource('certification', CertificationController::class);

   //what are resouces?
    Route::resource('trainings', TrainingsController::class);
//    Route::resouce('user', ::class);
    Route::get('/trainings/create', [TrainingsController::class, 'create'])->name('trainings.create');
    Route::get('/my-trainings', [TrainingsController::class, 'myTrainings'])->name('my-trainings');
    Route::get('/my-trainings/download', [TrainingsController::class, 'downloadSchedule'])->name('my-trainings.download');

    //Kim
    // Trainings routes
    Route::post('/trainings/{id}/enroll', [TrainingsController::class, 'enroll']);
    Route::delete('/trainings/{id}/unenroll', [TrainingsController::class, 'unenroll'])->name('trainings.unenroll');
    Route::post('/test-enroll', fn() => response()->json(['message' => 'its working']));
    Route::apiResource('trainings', TrainingsController::class);

    // old Training management
    //Route::resource('trainings', TrainingsController::class);


   //guides management
   Route::resource('guides', GuideController::class);
});



Route::get('/notifications', function () {
    $user = Auth::user();
    $role = $user?->role_name ?? 'guest'; 

    return Inertia::render('Notifications/List', [
        'auth' => ['user' => $user],
        'notifications' => Notification::where('role', $role)
            ->latest()
            ->take(50)
            ->get(),
    ]);
})->middleware('auth');


Route::middleware('auth')->group(function () {
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::post('/notifications', [NotificationController::class, 'store']);

    Route::get('/notifications/broadcast', fn () => Inertia::render('Notifications/Send'))->name('notifications.broadcast');
    Route::get('/notifications/list', fn () => Inertia::render('Notifications/List'))->name('notifications.list');

    Route::get('/admin/alerts', [AlertAdminController::class, 'index'])->name('admin.alerts.index');
    Route::put('/admin/alerts/{alert}', [AlertAdminController::class, 'update'])->name('admin.alerts.update');
    Route::post('/alerts', [AlertController::class, 'store'])->name('alerts.store');
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
Route::get('/certification/{id}/details', [CertificationController::class, 'show'])->name('certifications.show');
Route::get('/certifications', [CertificationController::class, 'index'])->name('certifications.index');

Route::post('courses/{course}/modules/reorder', [ModuleController::class, 'reorder'])
    ->name('courses.modules.reorder');

    Route::middleware(['auth'])->group(function () {
        // Course routes
        Route::resource('courses', CourseController::class);
    
        // Nested modules under each course
        Route::prefix('courses/{course}')->name('courses.')->group(function () {
            Route::resource('modules', ModuleController::class)->except(['show']);
            
            Route::get('modules/{module}', [ModuleController::class, 'show'])->name('modules.show');
            
            Route::post('modules/reorder', [ModuleController::class, 'reorder'])->name('modules.reorder');
            
            // ✅ NEW: Assign module to a group
            Route::post('modules/{module}/group', [ModuleController::class, 'assignGroup'])->name('modules.assignGroup');
    
            // ✅ NEW: Create a new module group
            Route::post('groups', [ModuleController::class, 'createGroup'])->name('groups.store');
        });
    });
    


// Laravel Breeze auth routes
require __DIR__.'/auth.php';


// Route::redirect('/nigga', '/dashboard');
// Route::redirect('/nigga', '/thehood');