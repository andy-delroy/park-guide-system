<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\CompanyController;
use App\Http\Controllers\Api\MediaController;

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
