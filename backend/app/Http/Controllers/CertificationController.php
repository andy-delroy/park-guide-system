<?php

namespace App\Http\Controllers;

use App\Models\Certification;
use App\Http\Requests\StoreCertificationRequest;
use App\Http\Requests\UpdateCertificationRequest;
use App\Http\Resources\CertificationResource;
use Illuminate\Http\Request;

class CertificationController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $query = Certification::query();

        $certifications = $query->paginate(10)->onEachside(1);

        return inertia('Certifications/Index', [
            "certifications" => CertificationResource::collection($certifications),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return inertia('Certifications/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // $guides = User::where('role_id', 2)->get(['id', 'username']);
        $validated = $request->validate([
            // 'guide_id' => 'required|exists:users,id',
            'certification_name' => 'required|string|unique:guide_certifications',
            'certificate_number' => 'required|string|unique:guide_certifications',
            'description' => 'required|string',
            // 'issued_by' => 'required|string',
            'issue_date' => 'required|date',
            'expiry_date' => 'nullable|date|after:issue_date',
            'status' => 'required|string|in:active,inactive',
        ]);

        $certification = Certification::create([
            'guide_id' => auth()->id(),
            'certification_name' => $validated['certification_name'],
            'certificate_number' => $validated['certificate_number'],
            'description' => $validated['description'],
            'issued_by' => auth()->id(), // Assuming the user creating the certification is the issuer
            'issue_date' => $validated['issue_date'],
            'expiry_date' => $validated['expiry_date'] ?? null,
            'status' => $validated['status'],
        ]);
        return to_route('certification.index')
        ->with('success', "Certification \"$certification->name\" created successfully.");
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $certification = Certification::with('guide')
            ->findOrFail($id);

        return inertia('Certifications/Show', [
            'certification' => $certification,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit($id)
    {
        $certification = Certification::findOrFail($id);

        return inertia('Certifications/Edit', [
            'certification' => $certification,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateCertificationRequest $request, Certification $certification)
    {
        $date = $request->validated();
        $certification ->update($data);

    $validated = $request->validate([
        'certification_name' => 'required|string|unique:guide_certifications,certification_name,' . $id,
        'certificate_number' => 'required|string|unique:guide_certifications,certificate_number,' . $id,
        'description' => 'required|string',
        'issue_date' => 'required|date',
        'expiry_date' => 'nullable|date|after:issue_date',
        'status' => 'required|string|in:active,inactive',
    ]);

    $certification->update([
        'guide_id' => auth()->id(),
        'certification_name' => $validated['certification_name'],
        'certificate_number' => $validated['certificate_number'],
        'description' => $validated['description'],
        'issue_date' => $validated['issue_date'],
        'expiry_date' => $validated['expiry_date'] ?? null,
        'status' => $validated['status'],
    ]);

    return to_route('certification.index')
        ->with('success', "Certification \"$certification->name\" updated successfully.");
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Certification $certification)
    {
        $certification->delete();

        return redirect()->route('certification.index')->with('success', 'Certification deleted successfully.');
    }
}
