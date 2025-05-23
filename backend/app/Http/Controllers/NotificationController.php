<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use App\Events\TestEvent;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;
use App\Models\ExpoPushToken;
use Illuminate\Support\Facades\Http;

class NotificationController extends Controller
{
    public function index(Request $request)
    {
        try {
            $user = $request->user();
            if (!$user) {
                Log::warning('No authenticated user for notification fetch');
                return response()->json(['error' => 'Unauthorized'], 403);
            }

            $role = $user->role_name ?? 'guest';
            $notifications = Notification::query()
                ->where(function ($q) use ($role) {
                    $q->where('target_channel', "notifications.{$role}")
                    ->orWhere('target_channel', 'all_channels');
                })
                ->orderBy('created_date', 'desc')
                ->take(50)
                ->get();

            Log::info('Notifications fetched', ['user_id' => $user->id, 'count' => $notifications->count()]);

            return response()->json($notifications, 200);
        } catch (\Exception $e) {
            Log::error('Notification fetch error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return response()->json(['error' => 'Server error'], 500);
        }
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
        try {
            Log::info('Starting notification store', ['user_id' => $request->user()?->id]);

            $user = $request->user();
            if (!$user || $user->role_name !== 'admin') {
                Log::warning('Unauthorized access attempt', ['user_id' => $user?->id]);
                return response()->json(['error' => 'Unauthorized'], 403);
            }

            $request->validate([
                'message' => 'required|string|max:255',
                'channel' => 'required|string|in:notifications.admin,notifications.visitor,notifications.guide,all_channels',
                'priority' => 'required|string|in:low,normal,medium,high',
            ]);

            $channel = $request->input('channel');
            $priority = $request->input('priority');
            $message = $request->input('message');

            Log::info('Creating notification', ['channel' => $channel, 'priority' => $priority]);

            $notification = Notification::create([
                'user_id' => $user->id,
                'role' => $user->role_name,
                'target_channel' => $channel,
                'message' => $message,
                'type' => 'info',
                'created_date' => now(),
                'is_read' => false,
                'priority_level' => $priority,
            ]);

            $channelsToSend = $channel === 'all_channels'
                ? ['notifications.admin', 'notifications.visitor', 'notifications.guide']
                : [$channel];

            Log::info('Broadcasting to channels', ['channels' => $channelsToSend]);

            foreach ($channelsToSend as $targetChannel) {
                broadcast(new TestEvent($message, $targetChannel, $priority));
                Log::info('Broadcast sent', ['channel' => $targetChannel]);
            }

            Log::info('Sending Expo push notifications', ['channels' => $channelsToSend]);

            foreach ($channelsToSend as $targetChannel) {
                $role = str_replace('notifications.', '', $targetChannel);
                $tokens = ExpoPushToken::whereHas('user.role', function ($q) use ($role) {
                    $q->where('role_name', $role);
                })->pluck('token');

                Log::info('Expo tokens found', ['role' => $role, 'tokens' => $tokens->toArray()]);

                foreach ($tokens as $token) {
                    $response = Http::post('https://exp.host/--/api/v2/push/send', [
                        'to' => $token,
                        'sound' => 'default',
                        'title' => ucfirst($role) . ' Alert',
                        'body' => $message,
                        'data' => ['priority' => $priority],
                    ]);
                    Log::info('Expo push sent', ['token' => $token, 'response' => $response->json()]);
                }
            }

            Log::info('Notification stored successfully', ['notification_id' => $notification->id]);

            return response()->json(['message' => 'Notification sent', 'notification' => $notification], 200);
        } catch (\Exception $e) {
            Log::error('Notification store error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return response()->json(['error' => 'Server error'], 500);
        }
    }

    public function storeExpoToken(Request $request)
    {
        try {
            $request->validate(['token' => 'required|string']);
            $user = $request->user();
            ExpoPushToken::updateOrCreate(
                ['user_id' => $user->id],
                ['token' => $request->token]
            );
            return response()->json(['message' => 'Token stored'], 200);
        } catch (\Exception $e) {
            Log::error('Expo token store error: ' . $e->getMessage());
            return response()->json(['error' => 'Server error'], 500);
        }
    }
}