<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\MediaController;
use App\Http\Controllers\Api\CompanyController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\TrainingsController;

// ✅ Auth API routes
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
        Route::post('trainings/{id}/enroll', [TrainingsController::class, 'enroll']);
        Route::apiResource('trainings', TrainingsController::class);
        Route::get('roles', [RoleController::class, 'getAllRoles']);
    });
});

// ✅ Public get user
Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

// ✅ Companies
Route::apiResource('companies', CompanyController::class);

// ✅ Media - public and protected
Route::prefix('media')->group(function () {
    Route::get('/', [MediaController::class, 'index']); // Public: view gallery
    Route::post('/upload', [MediaController::class, 'store']); // Upload (public allowed here)
    Route::patch('/{media}', [MediaController::class, 'update']);
    Route::delete('/{media}', [MediaController::class, 'destroy']);
});
