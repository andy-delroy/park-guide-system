<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\CompanyController;
use App\Http\Controllers\NotificationApiController;

Route::post('/broadcast', [NotificationApiController::class, 'broadcast']);

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::apiResource('companies', CompanyController::class);

Route::post('/send-notification', [NotificationController::class, 'send']);

Route::post('/trigger-notification', function (Request $request) {
    broadcast(new PublicEvent(
        $request->input('title'),
        $request->input('message')
    ))->toOthers();

    return response()->json(['status' => '✅ Notification sent!']);
});