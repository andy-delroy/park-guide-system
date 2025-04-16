<?php

namespace App\Http\Controllers;

use App\Models\GuideCertification;
use Illuminate\Http\Request;

class GuideCertificationController extends Controller
{
    // Create a new guide certification record (Admin)
    public function store(Request $request)
    {
        $validated = $request->validate([
            'guide_id' => 'required|exists:users,id',
            'type' => 'required|string|max:255',
            'expiry_date' => 'nullable|date',
            'certificate_number' => 'nullable|string|max:255',
            'certificate_file_url' => 'nullable|url',
        ]);

        $validated['certificate_number'] = encrypt($validated['certificate_number']);
        $validated['certificate_file_url'] = encrypt($validated['certificate_file_url']);

        $certification = GuideCertification::create($validated);

        return response()->json($certification, 201);
    }

    // Read guide certification details (Admin)
    public function show(GuideCertification $guideCertification)
    {
        $guideCertification->certificate_number = decrypt($guideCertification->certificate_number);
        $guideCertification->certificate_file_url = decrypt($guideCertification->certificate_file_url);

        return response()->json($guideCertification);
    }

    // Update guide certification details (Admin)
    public function update(Request $request, GuideCertification $guideCertification)
    {
        $validated = $request->validate([
            'type' => 'nullable|string|max:255',
            'expiry_date' => 'nullable|date',
            'certificate_number' => 'nullable|string|max:255',
            'certificate_file_url' => 'nullable|url',
        ]);

        if (isset($validated['certificate_number'])) {
            $validated['certificate_number'] = encrypt($validated['certificate_number']);
        }

        if (isset($validated['certificate_file_url'])) {
            $validated['certificate_file_url'] = encrypt($validated['certificate_file_url']);
        }

        $guideCertification->update($validated);

        return response()->json($guideCertification);
    }

    // Delete a guide certification record (Admin)
    public function destroy(GuideCertification $guideCertification)
    {
        $guideCertification->delete();

        return response()->json(['message' => 'Guide certification deleted successfully.']);
    }

    // View personal guide certification status (Park Guide)
    public function myCertifications(Request $request)
    {
        $certifications = GuideCertification::where('guide_id', $request->user()->id)->get();

        foreach ($certifications as $certification) {
            $certification->certificate_number = decrypt($certification->certificate_number);
            $certification->certificate_file_url = decrypt($certification->certificate_file_url);
        }

        return response()->json($certifications);
    }

    // Update personal certification details (Park Guide)
    public function updateMyCertification(Request $request, GuideCertification $guideCertification)
    {
        $this->authorize('update', $guideCertification);

        $validated = $request->validate([
            'certificate_file_url' => 'nullable|url',
        ]);

        if (isset($validated['certificate_file_url'])) {
            $validated['certificate_file_url'] = encrypt($validated['certificate_file_url']);
        }

        $guideCertification->update($validated);

        return response()->json($guideCertification);
    }

    public function updateReminderSettings(Request $request)
    {
    $validated = $request->validate([
        'days_before' => 'required|integer|min:1',
    ]);

    // Save the reminder settings (e.g., in a settings table or config file)
    // Example: App\Models\Setting::updateOrCreate(['key' => 'reminder_days_before'], ['value' => $validated['days_before']]);

    return response()->json(['message' => 'Reminder settings updated successfully.']);
    }
}
