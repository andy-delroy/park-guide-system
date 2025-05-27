<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\TrainingsController;
// use App\Http\Controllers\RoleController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\GuideFeedbackController;
use App\Http\Controllers\Api\CompanyController;
use App\Http\Controllers\CertificationController;
use App\Http\Controllers\GuideController;
use App\Http\Controllers\SensorLogController;
use App\Http\Controllers\IoTAlertController;
use App\Http\Controllers\CourseController;

use App\Http\Controllers\NotificationController;
use App\Models\ExpoPushToken;


Route::prefix('auth')->group(function () {
    Route::post('register', [AuthController::class, 'register']);
    Route::post('login', [AuthController::class, 'login']);
    Route::post('password/forgot', [AuthController::class, 'requestPasswordReset']);
    Route::post('password/reset', [AuthController::class, 'resetPassword']);

    // Feedback routes
    Route::get('guides/{id}', [GuideController::class, 'show'])->name('guides.show');
    Route::get('guides/{id}/feedbacks', [GuideFeedbackController::class, 'showFeedbacks'])->name('guides.feedbacks');
    Route::post('guides/{id}/feedback', [GuideFeedbackController::class, 'store'])->name('guides.feedback');

    Route::middleware('auth:sanctum')->group(function () {
        Route::get('me', [AuthController::class, 'me']);
        Route::patch('update', [AuthController::class, 'update']);
        Route::post('logout', [AuthController::class, 'logout']);
        Route::delete('destroy', [AuthController::class, 'destroy']);

        Route::resource('trainings', TrainingsController::class);
        
        Route::get('/my-trainings', [TrainingsController::class, 'myTrainings'])->name('my-trainings');
        Route::get('/my-trainings/download', [TrainingsController::class, 'downloadSchedule'])->name('my-trainings.download');

        Route::post('/trainings/{id}/enroll', [TrainingsController::class, 'enroll']);
        Route::delete('/trainings/{id}/unenroll', [TrainingsController::class, 'unenroll'])->name('trainings.unenroll');

        // Roles route
        Route::get('roles', [RoleController::class, 'getAllRoles']);

        // Profile routes for admin and guide
        Route::get('profile', [UserController::class, 'getProfile']);
        Route::post('profile/update', [UserController::class, 'updateProfile']);

        // Certification routes
        Route::resource('certification', CertificationController::class);
        Route::post('certification/{id}/update', [CertificationController::class, 'update']);
        Route::post('certification/{id}/renew', [CertificationController::class, 'renew']);

        // Guide routes
        Route::resource('guides', GuideController::class);

        Route::resource('courses', CourseController::class);
    });
});

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::apiResource('companies', CompanyController::class);


Route::middleware('auth:sanctum')->group(function () {
    Route::get('/notifications', [App\Http\Controllers\NotificationController::class, 'index']);
    Route::post('/notifications', [App\Http\Controllers\NotificationController::class, 'store']);
    Route::post('/expo-token', [App\Http\Controllers\NotificationController::class, 'storeExpoToken']);
});


//IOT stuff
Route::post('/alerts/upload', [IoTAlertController::class, 'upload']);

//sensors
Route::post('/sensor-logs', [SensorLogController::class, 'store']);


