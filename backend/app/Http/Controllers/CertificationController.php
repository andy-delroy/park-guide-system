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
    public function index(Request $request)
    {
        $user = auth()->user();
    
        if ($user->role->role_name === 'guide') {
            $certifications = Certification::with('issuer')->where('guide_id', $user->id)->paginate(10);
        } else if ($user->role->role_name === 'admin') {
            $certifications = Certification::with('issuer')->paginate(10);
        } else {
            abort(403, 'Unauthorized');
        }

        if ($request->expectsJson()) {
            return CertificationResource::collection($certifications);
        }
    
        return inertia('Certifications/Index', [
            'certifications' => $certifications,
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
            'guide_id' => 'required|exists:users,id',
            'certification_name' => 'required|string|unique:guide_certifications',
            'certificate_number' => 'required|string|unique:guide_certifications',
            'description' => 'required|string',
            'requirements_description' => 'nullable|string',
            'renewal_requirements' => 'nullable|string',
            'validity_period_months' => 'nullable|integer',
            // 'certificate_file_url' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:2048',
            // 'issued_by' => 'required|string',
            'issue_date' => 'required|date',
            'expiry_date' => 'nullable|date|after:issue_date',
            'status' => 'required|string|in:active,inactive',
        ]);

        $certification = Certification::create([
            'guide_id' => $validated['guide_id'],
            'certification_name' => $validated['certification_name'],
            'certificate_number' => $validated['certificate_number'],
            'description' => $validated['description'],
            'requirements_description' => $validated['requirements_description'],
            'renewal_requirements' => $validated['renewal_requirements'],
            'validity_period_months' => $validated['validity_period_months'],
            // 'certificate_file_url' => $validated['certificate_file_url'],
            'issued_by' => auth()->id(), // Assuming the user creating the certification is the issuer
            'issue_date' => $validated['issue_date'],
            'expiry_date' => $validated['expiry_date'] ?? null,
            'status' => $validated['status'],
        ]);

        // Check if the request expects JSON (API call)
        if ($request->wantsJson() || $request->is('api/*')) {
            return response()->json([
                'message' => "Certification \"{$certification->certification_name}\" created successfully.",
                'certification' => $certification,
            ], 201);
        }
        
        return to_route('certification.index')
        ->with('success', "Certification \"$certification->name\" created successfully.");
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $certification = Certification::with('issuer')->findOrFail($id);
    
        if (auth()->user()->role->role_name === 'guide' && $certification->guide_id !== auth()->id()) {
            abort(403, 'Unauthorized');
        }
    
        return inertia('Certifications/Details', [
            'certification' => $certification,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit($id, Request $request)
    {
        $certification = Certification::findOrFail($id);

        if ($request->expectsJson()) {
            return new CertificationResource($certification);
        }

        return inertia('Certifications/Edit', [
            'certification' => $certification,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Certification $certification)
    {
    $validated = $request->validate([
        'guide_id' => 'required|exists:users,id',
        'certification_name' => 'required|string|unique:guide_certifications,certification_name,' . $certification->id,
        'certificate_number' => 'required|string|unique:guide_certifications,certificate_number,' . $certification->id,
        'description' => 'required|string',
        'requirements_description' => 'nullable|string',
        'renewal_requirements' => 'nullable|string',
        'validity_period_months' => 'nullable|integer',
        // 'certificate_file_url' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:2048',
        'issue_date' => 'required|date',
        'expiry_date' => 'nullable|date|after:issue_date',
        'status' => 'required|string|in:active,inactive',
    ]);

    $certification->update([
        'guide_id' => $validated['guide_id'],
        'certification_name' => $validated['certification_name'],
        'certificate_number' => $validated['certificate_number'],
        'description' => $validated['description'],
        'requirements_description' => $validated['requirements_description'],
        'renewal_requirements' => $validated['renewal_requirements'],
        'validity_period_months' => $validated['validity_period_months'],
        // 'certificate_file_url' => $validated['certificate_file_url'],
        'issue_date' => $validated['issue_date'],
        'expiry_date' => $validated['expiry_date'] ?? null,
        'status' => $validated['status'],
    ]);

    if ($request->expectsJson()) {
        return response()->json([
            'message' => "Certification \"{$certification->certification_name}\" updated successfully.",
            'certification' => new CertificationResource($certification),
        ], 200);
    }

    return to_route('certification.index')
        ->with('success', "Certification \"{$certification->certification_name}\" updated successfully.");
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, Certification $certification)
    {
        try {
            $certification->delete();

            if ($request->expectsJson()) {
                return response()->json([
                    'message' => 'Certification deleted successfully',
                ], 200);
            }

            return redirect()->route('certification.index')->with('success', 'Certification deleted successfully.');
        } catch (\Exception $e) {
            if ($request->expectsJson()) {
                return response()->json([
                    'message' => 'Failed to delete certification',
                    'error' => $e->getMessage(),
                ], 500);
            }

            return redirect()->route('certification.index')->with('error', 'Failed to delete certification.');
        }
    }
}
