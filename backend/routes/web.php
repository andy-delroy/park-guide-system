<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\TrainingsController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\NotificationController;


use Inertia\Inertia;


use App\Http\Controllers\PostController;

//default laravel render page
// Route::get('/', function () {
//     return Inertia::render('Welcome', [
//         'canLogin' => Route::has('login'),
//         'canRegister' => Route::has('register'),
//         'laravelVersion' => Application::VERSION,
//         'phpVersion' => PHP_VERSION,
//     ]);
// });

Route::redirect('/', '/dashboard');



Route::middleware(['auth', 'verified'])->group(function() {
   Route::get('/dashboard', fn() => Inertia::render('Dashboard'))->name('dashboard'); 

   //what are resouces?
   Route::resource('trainings', TrainingsController::class);
//    Route::resouce('user', ::class);
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';

Auth::routes();

Route::get('/home', [App\Http\Controllers\HomeController::class, 'index'])->name('home');

Route::get('/posts', [PostController::class, 'index'])->name('posts.index');
Route::post('/posts', [PostController::class, 'store'])->name('posts.store');

Route::get('/notification-test', function () {
    return Inertia::render('NotificationTest', [
        'testProp' => 'This is a test', // Optional: Add props to verify
    ]);
});

Route::get('/notification-page', fn () => Inertia\Inertia::render('NotificationPage'))->name('notification.page');
Route::post('/send-notification', [NotificationController::class, 'send'])->name('notification.send');