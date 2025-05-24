<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Alert;
use App\Models\User;
use App\Events\AlertCreated;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;

class AlertAdminController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        if (!$user || $user->role_name !== 'admin') {
            Log::warning('Unauthorized attempt to access alerts', [
                'user_id' => $user?->id,
                'role_name' => $user?->role_name,
            ]);
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        Log::info('Accessing admin alerts index', ['user_id' => $user->id]);
        return Inertia::render('Alerts/ListAlert', [
            'auth' => ['user' => $user],
            'alerts' => Alert::latest()->take(20)->get()->toArray(),
        ]);
    }

    public function store(Request $request)
    {
        $user = $request->user();
        if (!$user || $user->role_name !== 'admin') {
            Log::warning('Unauthorized attempt to create alert', [
                'user_id' => $user?->id,
                'role_name' => $user?->role_name,
            ]);
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        Log::info('POST /alerts request:', [
            'data' => $request->all(),
            'referer' => $request->header('referer'),
            'user_id' => $user->id,
        ]);

        $data = $request->validate([
            'id' => 'nullable|integer|exists:alerts,id',
            'message' => 'required|string|max:255',
            'type' => 'required|string|in:info,emergency',
            'expiry' => 'nullable|date',
            'park_id' => 'nullable|integer|exists:parks,id',
        ]);

        if ($request->has('id') && $request->id) {
            // Update existing alert
            $alert = Alert::findOrFail($request->id);
            $alert->update([
                'message' => $data['message'],
                'type' => $data['type'],
                'expiry' => $data['expiry'],
                'park_id' => $data['park_id'],
            ]);
        } else {
            // Create new alert
            $alert = Alert::create([
                'message' => $data['message'],
                'type' => $data['type'],
                'expiry' => $data['expiry'],
                'park_id' => $data['park_id'],
                'user_id' => $user->id,
            ]);

            // Broadcast to all non-admin users
            $users = User::whereHas('role', fn($q) => $q->whereIn('role_name', ['guide', 'visitor']))
                ->when($alert->park_id, fn($q) => $q->where('park_id', $alert->park_id))
                ->get();

            broadcast(new AlertCreated($alert, $users))->toOthers();
        }

        return redirect()->route('admin.alerts.index')->with('success', $request->id ? 'Alert updated.' : 'Alert created and broadcast sent.');
    }

    public function destroy(Request $request, Alert $alert)
    {
        $user = $request->user();
        if (!$user || $user->role_name !== 'admin') {
            Log::warning('Unauthorized attempt to delete alert', [
                'user_id' => $user?->id,
                'role_name' => $user?->role_name,
            ]);
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        Log::info('Delete alert request:', ['alert_id' => $alert->id, 'user_id' => $user->id]);
        $alert->delete();
        return redirect()->route('admin.alerts.index')->with('success', 'Alert deleted.');
    }

    public function redirectAlerts(Request $request)
    {
        Log::info('Unexpected GET /alerts request', [
            'url' => $request->fullUrl(),
            'referer' => $request->header('referer'),
        ]);
        return redirect()->route('admin.alerts.index')->with('error', 'Please use /admin/alerts for alert management.');
    }
}