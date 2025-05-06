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

        $notification = Notification::create([
            'user_id' => $request->user()?->id,
            'message' => $request->message,
            'type' => 'info',
        ]);

        broadcast(new TestEvent($notification->message))->toOthers();

        return response()->json($notification);
    }
}
