<?php
namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Alert;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AlertAdminController extends Controller
{
    public function index()
    {
        return Inertia::render('Alerts/AdminManageAlerts', [
            'alerts' => Alert::latest()->take(20)->get()
        ]);
    }

    public function update(Request $request, Alert $alert)
    {
        $request->validate([
            'message' => 'required|string',
        ]);

        $alert->update([
            'message' => $request->message,
        ]);

        return redirect()->route('admin.alerts.index')->with('success', 'Alert updated.');
    }
}
