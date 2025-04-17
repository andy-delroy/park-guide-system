<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\TrainingsController;
// use App\Http\Controllers\RoleController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\GuideFeedbackController;
use App\Http\Controllers\Api\MediaController;
use App\Http\Controllers\Api\CompanyController;

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

        // Trainings routes
        Route::post('/trainings/{id}/enroll', [TrainingsController::class, 'enroll']);
        Route::apiResource('trainings', TrainingsController::class);

        // Roles route
        Route::get('roles', [RoleController::class, 'getAllRoles']);

        Route::get('guides', [UserController::class, 'fetchGuides']);
        Route::get('profile', [UserController::class, 'getProfile']);
        Route::put('profile/update', [UserController::class, 'updateProfile']);
    });
});

Route::get('/guides/{username}', [UserController::class, 'getGuide']);
Route::post('/guides/{username}/feedback', [GuideFeedbackController::class, 'store']);
Route::get('/guides/{username}/feedbacks', [GuideFeedbackController::class, 'showFeedbacks']);




// ✅ Public route to return authenticated user (still protected if needed)
Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// ✅ Company resource routes
Route::apiResource('companies', CompanyController::class);

// ✅ Media API routes WITHOUT sanctum (TEMP for testing only)
Route::get('/media', [MediaController::class, 'index']);              // List 10 latest
Route::post('/media', [MediaController::class, 'store']);             // Upload media
Route::patch('/media/{media}', [MediaController::class, 'update']);   // Update caption / file
Route::delete('/media/{media}', [MediaController::class, 'destroy']); // Delete media

