<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use App\Events\TestEvent;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;

class NotificationController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $role = $user->role_name ?? 'guest';

        $filterRole = $request->query('filter_role');

        $notifications = Notification::query()
            ->when($role !== 'admin', function ($query) use ($role) {
                $query->where(function ($q) use ($role) {
                    $q->where('target_channel', "notifications.{$role}")
                    ->orWhere('target_channel', 'all_channels');
                });
            })
            ->when($role === 'admin' && $filterRole, function ($query) use ($filterRole) {
                $query->where(function ($q) use ($filterRole) {
                    $q->where('target_channel', $filterRole)
                    ->orWhere('target_channel', 'all_channels');
                });
            })
            ->when($role === 'admin' && !$filterRole, function ($query) {
                // If no filter is selected, show everything to admin
                $query->whereNotNull('target_channel');
            })
            ->latest()
            ->take(50)
            ->get();

        return Inertia::render('Notifications/List', [
            'auth' => ['user' => $user],
            'notifications' => $notifications->toArray(),
            'filterRole' => $filterRole,
            'availableRoles' => ['notifications.admin', 'notifications.visitor', 'notifications.guide'],
        ]);
    }

    
    public function markAsRead(Notification $notification)
    {
        $user = request()->user();
    
        if ($notification->user_id !== $user->id && $user->role_name !== 'admin') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }
    
        $notification->update([
            'is_read' => true,
            'read_date' => now(),
        ]);
    
        return response()->json(['status' => 'marked as read']);
    }


    public function store(Request $request)
    {
        $user = $request->user();
        // Check if user is admin
        if (!$user || $user->role_name !== 'admin') {
            Log::warning('Unauthorized attempt to send notification', [
                'user_id' => $user?->id,
                'role_name' => $user?->role_name,
            ]);
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $request->validate([
            'message' => 'required|string|max:255',
            'channel' => 'required|string|in:notifications.admin,notifications.visitor,notifications.guide,all_channels',
            'priority' => 'required|string|in:low,normal,medium,high',
        ]);

        $channel = $request->input('channel');
        $priority = $request->input('priority');

        // Log the request for debugging
        Log::info('Broadcast request received', [
            'channel' => $channel,
            'message' => $request->message,
            'priority' => $priority,
            'user_role' => $user->role_name,
        ]);

        // Create notification record
        $notification = Notification::create([
            'user_id' => $user->id,
            'role' => $user->role_name,
            'target_channel' => $channel,
            'message' => $request->message,
            'type' => 'info',
            'created_date' => now(),
            'is_read' => false,
            'priority_level' => $priority,
        ]);

        // Broadcast to the selected channel(s)
        Log::info('Broadcasting to channel', ['channel' => $channel]);
        try {
            if ($channel === 'all_channels') {
                // Broadcast to all channels
                foreach (['notifications.admin', 'notifications.visitor', 'notifications.guide'] as $targetChannel) {
                    broadcast(new TestEvent($request->message, $targetChannel, $priority))->toOthers();
                }
            } else {
                // Broadcast to single channel
                broadcast(new TestEvent($request->message, $channel, $priority))->toOthers();
            }
        } catch (\Exception $e) {
            Log::error('Broadcast failed', ['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            return response()->json(['error' => 'Broadcast failed: ' . $e->getMessage()], 500);
        }

        return response()->json($notification);
    }
}