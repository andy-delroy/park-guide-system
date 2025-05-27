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
                return response()->json([
                    'error' => 'Unauthorized',
                    'notifications' => [],
                    'availableRoles' => [],
                    'filterRole' => '',
                ], 403);
            }

            $role = $user->role_name ?? 'guest';
            $filterRole = $request->query('filter_role', '');

            $query = Notification::query();
            if ($filterRole && $role === 'admin') {
                $query->where('target_channel', $filterRole);
            } elseif ($role !== 'admin') {
                $query->where(function ($q) use ($role) {
                    $q->where('target_channel', "notifications.{$role}")
                      ->orWhere('target_channel', 'all_channels');
                });
            }

            $notifications = $query->orderBy('created_date', 'desc')->take(50)->get();

            $availableRoles = $role === 'admin' ? [
                'notifications.admin',
                'notifications.guide',
                'notifications.visitor',
                'all_channels',
            ] : [];

            Log::info('Notifications fetched', [
                'user_id' => $user->id,
                'count' => $notifications->count(),
                'filter_role' => $filterRole,
                'available_roles' => $availableRoles,
            ]);

            return response()->json([
                'notifications' => $notifications,
                'filterRole' => $filterRole,
                'availableRoles' => $availableRoles,
            ], 200);
        } catch (\Exception $e) {
            Log::error('Notification fetch error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return response()->json([
                'error' => 'Server error',
                'notifications' => [],
                'availableRoles' => [],
                'filterRole' => '',
            ], 500);
        }
    }

    public function markAsRead(Request $request, Notification $notification)
    {
        try {
            $user = $request->user();
            if (!$user) {
                Log::warning('No authenticated user for mark as read');
                return response()->json(['error' => 'Unauthorized'], 401);
            }

            if ($notification->user_id !== $user->id && $user->role_name !== 'admin') {
                Log::warning('Unauthorized mark as read attempt', [
                    'user_id' => $user->id,
                    'notification_id' => $notification->id,
                ]);
                return response()->json(['error' => 'Unauthorized'], 403);
            }

            $notification->update([
                'is_read' => true,
                'read_date' => now(),
            ]);

            Log::info('Notification marked as read', ['notification_id' => $notification->id]);
            return response()->json(['status' => 'marked as read']);
        } catch (\Exception $e) {
            Log::error('Mark as read error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return response()->json(['error' => 'Failed to mark notification as read'], 500);
        }
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
                try {
                    broadcast(new TestEvent($message, $targetChannel, $priority));
                    Log::info('Broadcast sent', ['channel' => $targetChannel, 'message' => $message]);
                } catch (\Exception $e) {
                    Log::error('Broadcast failed', [
                        'channel' => $targetChannel,
                        'error' => $e->getMessage(),
                    ]);
                }
            }

            Log::info('Sending Expo push notifications', ['channels' => $channelsToSend]);

            foreach ($channelsToSend as $targetChannel) {
                $role = str_replace('notifications.', '', $targetChannel);

                $tokens = ExpoPushToken::whereHas('user.role', function ($q) use ($role) {
                    $q->where('role_name', $role);
                })->pluck('token');

                Log::info('Expo tokens found', ['role' => $role, 'tokens' => $tokens->toArray()]);

                foreach ($tokens as $token) {
                    try {
                        $response = Http::post('https://exp.host/--/api/v2/push/send', [
                            'to' => $token,
                            'sound' => 'default',
                            'title' => ucfirst($role) . ' Alert',
                            'body' => $message,
                            'data' => ['priority' => $priority],
                        ]);
                        Log::info('Expo push sent', ['token' => $token, 'response' => $response->json()]);
                    } catch (\Exception $e) {
                        Log::error('Expo push failed', [
                            'token' => $token,
                            'error' => $e->getMessage(),
                        ]);
                    }
                }
            }

            Log::info('Notification stored successfully', ['notification_id' => $notification->id]);

            return response()->json(['message' => 'Notification sent', 'notification' => $notification], 200);
        } catch (\Exception $e) {
            Log::error('Notification store error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return response()->json(['error' => 'Server error', 'details' => $e->getMessage()], 500);
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