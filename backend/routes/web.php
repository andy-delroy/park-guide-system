<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\TrainingsController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

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


//Route::middleware applies the middlewares in this group, in this case authed and verified users only can access the routes in this group  
Route::middleware(['auth', 'verified'])->group(function() {
    // Inertia:: render looks for files under resources/js/Pages
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



// Route::redirect('/nigga', '/dashboard');
// Route::redirect('/nigga', '/thehood');
