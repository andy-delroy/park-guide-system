<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use App\Events\TestEvent;
use Illuminate\Http\Request;
use Inertia\Inertia;
class NotificationController extends Controller
{
    public function index(Request $request)
    {
        return Inertia::render('Notifications/List', [
            'auth' => ['user' => $request->user()],
            'notifications' => Notification::latest()->get(),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate(['message' => 'required|string|max:255']);
    
        $user = $request->user();
    
        $notification = Notification::create([
            'user_id' => $user?->id,
            'role' => $user->role_name ?? 'guest',
            'message' => $request->message,
            'type' => 'info',
            'created_date' => now(),
            'is_read' => false,
            'priority_level' => 'medium',
        ]);
    
        broadcast(new TestEvent($notification->role, $notification->message));
    
        return response()->json($notification);
    }
    
}
