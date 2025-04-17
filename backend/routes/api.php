<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\GuideFeedbackController;

Route::prefix('auth')->group(function () {
    Route::post('register', [AuthController::class, 'register']);
    Route::post('login', [AuthController::class, 'login']);
    Route::post('password/forgot', [AuthController::class, 'requestPasswordReset']);
    Route::post('password/reset', [AuthController::class, 'resetPassword']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::get('me', [AuthController::class, 'me']);
        Route::patch('update', [AuthController::class, 'update']);
        Route::post('logout', [AuthController::class, 'logout']);
        Route::delete('destroy', [AuthController::class, 'destroy']);

        Route::get('roles', [RoleController::class, 'getAllRoles']);

        Route::get('guides', [UserController::class, 'fetchGuides']);
        Route::get('profile', [UserController::class, 'getProfile']);
        Route::put('profile/update', [UserController::class, 'updateProfile']);
    });
});

Route::get('/guides/{username}', [UserController::class, 'getGuide']);
Route::post('/guides/{username}/feedback', [GuideFeedbackController::class, 'store']);
Route::get('/guides/{username}/feedbacks', [GuideFeedbackController::class, 'showFeedbacks']);

