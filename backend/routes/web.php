<?php

use App\Events\AlertCreated;
use App\Events\TestEvent;
use App\Http\Controllers\AlertController;
use App\Http\Controllers\Admin\AlertAdminController;
use App\Http\Controllers\CertificationController;
use App\Http\Controllers\CourseController;
use App\Http\Controllers\GuideController;
use App\Http\Controllers\MediaController;
use App\Http\Controllers\ModuleController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\QuestionController;
use App\Http\Controllers\QuizController;
use App\Http\Controllers\RecommenderController;
use App\Http\Controllers\TrainingsController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\GuidePerformanceMetricController;
use App\Http\Controllers\TrainingRecommendationController;

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\IoTDashBoardController;
use App\Models\Alert;
use App\Models\Notification;
use Illuminate\Foundation\Application;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;



// Redirect root to dashboard
Route::redirect('/', '/home');

// Public route for index (no middleware)
Route::get('/media', [MediaController::class, 'index'])->name('media.index');

use App\Models\Certification;

Route::get('/test-generate-certificate/{id}', function ($id) {
    $certification = Certification::with('guide')->findOrFail($id);
    $baseUrl = url('/'); // or config('app.url')
    $parkName = "Lee"; // Replace with your park name or fetch dynamically if needed

    $controller = app()->make(\App\Http\Controllers\CertificationController::class);
    $imageUrl = $controller->generateLicenseImage($certification, $baseUrl, $parkName);

    return response()->json([
        'message' => 'Certificate generated successfully',
        'image_url' => $imageUrl,
    ]);
});


// Authenticated routes (only for logged-in users)
Route::middleware(['auth', 'verified'])->group(function () {
    // Dashboard
    Route::get('/home', fn () => Inertia::render('Dashboard'))->name('dashboard');
    //this route displays stuff received from IoT edge
    Route::get('/iot-dashboard', [IoTDashBoardController::class, 'index'])->name('iot.dashboard');

    //iot almost live data route
    Route::get('/iot-dashboard/data', [IoTDashBoardController::class, 'liveData']);
    Route::resource('certification', CertificationController::class);
    Route::resource('media', MediaController::class)->except(['index']);
    Route::get('/manage-media', [MediaController::class, 'manage'])->name('media.manage');

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
    // Route::post('/test-enroll', fn() => response()->json(['message' => 'its working']));
    // Route::apiResource('trainings', TrainingsController::class);

    // old Training management
    //Route::resource('trainings', TrainingsController::class);


   //guides management
   Route::resource('guides', GuideController::class);
   Route::get('/guides-analytics', [GuideController::class, 'guideAnalytics'])->name('guides.analytics');
});

Route::post('/broadcast/test', function (Request $request) {
    $user = Auth::user();
    $role = $user->role_name ?? 'guest';
    $name = $user?->full_name ?? 'Anonymous';

    $message = $request->input('message') ?? "Notification from {$name} ({$role})";

    Notification::create([
        'user_id' => $user->id,
        'role' => $role,
        'message' => $message,
        'type' => 'info',
        'created_date' => now(),
        'is_read' => false,
        'priority_level' => 'medium',
    ]);

    broadcast(new TestEvent($role, $message));

    return response()->json([
        'status' => 'sent',
        'role' => $role,
        'channel' => "notifications.{$role}",
        'message' => $message,
    ]);
})->middleware('auth');


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
    // Use this as the only entry point for notification listing
    Route::get('/notifications', [NotificationController::class, 'index'])->name('notifications.index');

    // Store a new notification
    Route::post('/notifications', [NotificationController::class, 'store'])->name('notifications.store');

    // Show the broadcast test UI
    Route::get('/notifications/broadcast', fn () => Inertia::render('Notifications/Send'))->name('notifications.broadcast');

    Route::put('/notifications/{notification}/mark-as-read', [NotificationController::class, 'markAsRead'])
    ->middleware('auth')
    ->name('notifications.markAsRead');

    // Alerts for all users
    Route::get('/alerts/list', fn () => Inertia::render('Alerts/AlertList'))->name('alerts.list');
});

// Alert routes
Route::middleware('auth')->group(function () {
    Route::post('/alerts', [AlertAdminController::class, 'store'])->name('alerts.store');
    Route::get('/alerts', [AlertAdminController::class, 'redirectAlerts'])->name('alerts.redirect');

    Route::prefix('admin')->group(function () {
        Route::get('/alerts', [AlertAdminController::class, 'index'])->name('admin.alerts.index');
        Route::get('/alerts/send', fn () => Inertia::render('Alerts/SendAlert'))->name('admin.alerts.send');
        Route::delete('/alerts/{alert}', [AlertAdminController::class, 'destroy'])->name('admin.alerts.destroy');
    });
});

// User profile routes
Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

Route::get('/map', function () {
    return Inertia::render('Map/parkmap'); // This loads resources/js/Pages/parkmap.jsx
})->name('map.parkmap');
Route::get('/certification/{id}/details', [CertificationController::class, 'show'])->name('certifications.show');
Route::get('/certifications', [CertificationController::class, 'index'])->name('certifications.index');
Route::post('/certification/{id}/renew', [CertificationController::class, 'renew']);

Route::delete('/groups/{group}', [ModuleController::class, 'destroyGroup'])->middleware('auth');
Route::post('courses/{course}/modules/reorder', [ModuleController::class, 'reorder'])
    ->name('courses.modules.reorder');

Route::post('/courses/{course}/quizzes/{quiz}/group', [QuizController::class, 'assignGroup'])->middleware('auth');
Route::post('/courses/{course}/quizzes/reorder', [QuizController::class, 'reorder'])->middleware('auth');


    Route::middleware(['auth'])->group(function () {
        // Course routes
        Route::resource('courses', CourseController::class);

        //for guide enrollment
    Route::post('/courses/{course}/enroll', [CourseController::class, 'enroll'])->name('courses.enroll');
    Route::delete('/courses/{course}/unenroll', [CourseController::class, 'unenroll'])->name('courses.unenroll');
    
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

Route::get('/quiz', function () {return Inertia::render('Quiz/Index');})->name('quiz.index');
Route::middleware(['auth'])->group(function () {Route::resource('quiz', QuizController::class);});
Route::get('/quiz/{quiz}/take', [QuizController::class, 'take'])->name('quiz.take');
Route::middleware(['auth'])->group(function () {Route::resource('quizzes.questions', QuestionController::class);});
Route::middleware(['auth'])->group(function () {
    Route::get('/quiz/{quiz}/take', [QuizController::class, 'take'])->name('quiz.take');
    Route::post('/quiz/{quiz}/submit', [QuizController::class, 'submitQuiz'])->name('quiz.submit');
    Route::get('/quizzes/{quiz}/edit', [QuizController::class, 'edit'])->name('quiz.edit');
    Route::put('/quizzes/{quiz}', [QuizController::class, 'update'])->name('quiz.update');
    Route::get('/quizzes/{quiz}/questions/create', function ($quiz) {
        return Inertia::render('Quiz/AddQuestion', [
            'quiz' => \App\Models\Quiz::findOrFail($quiz),
        ]);
    })->name('quizzes.questions.create');

    Route::post('/quizzes/{quiz}/questions', [QuestionController::class, 'store'])->name('quizzes.questions.store');
});
Route::get('/quizzes/{quiz}/questions/create', function ($quiz) {
    return Inertia::render('Quiz/AddQuestion', [
        'quiz' => \App\Models\Quiz::findOrFail($quiz),
    ]);
})->name('quizzes.questions.create');


//recommender routes
Route::get('/api/recommendations', [RecommenderController::class, 'getRecommendations']);

Route::get('/training-recommendations', [TrainingRecommendationController::class, 'index'])
    ->name('training.recommendations');


Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/analytics', [GuidePerformanceMetricController::class, 'index'])->name('analytics.index');
    Route::get('/analytics/data', [GuidePerformanceMetricController::class, 'fetchData'])->name('analytics.data');
});


Route::get('/api/guides', function () {
    return \App\Models\User::where('role_id', 2)
        ->select('id', 'username', 'full_name')
        ->get();
});


