<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Alert;
use App\Events\AlertCreated;
use Illuminate\Http\Request;

class AlertController extends Controller
{
    public function store(Request $request)
    {
        $data = $request->validate([
            'message' => 'required|string|max:255',
            'type' => 'required|string',
            'expiry' => 'nullable|date',
            'park_id' => 'nullable|integer',
        ]);

        $alert = Alert::create($data);

        $users = User::query()
        ->when($alert->park_id, fn($q) => $q->where('park_id', $alert->park_id))
        ->whereHas('role', fn($q) => $q->whereIn('role_name', ['guide', 'visitor']))
        ->get();

        broadcast(new AlertCreated($alert, $users));

        return redirect()->back()->with('success', 'Alert created and email sent.');
    }
}