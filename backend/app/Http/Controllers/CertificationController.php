<?php

namespace App\Http\Controllers;

use App\Models\Certification;
use App\Http\Requests\StoreCertificationRequest;
use App\Http\Requests\UpdateCertificationRequest;
use App\Http\Resources\CertificationResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str; 
use Illuminate\Support\Facades\Validator;     

class CertificationController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $user = auth()->user();
    
        if ($user->role->role_name === 'guide') {
            $certifications = Certification::with(['guide', 'issuer'])->where('guide_id', $user->id)->paginate(10);
        } else if ($user->role->role_name === 'admin') {
            $certifications = Certification::with(['guide', 'issuer'])->paginate(10);
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
        $validated = $request->validate([
            'guide_id' => 'required|exists:users,id',
            'certification_name' => 'required|string|unique:guide_certifications',
            'certificate_number' => 'required|string|unique:guide_certifications',
            'description' => 'required|string',
            'renewal_requirements' => 'nullable|string',
            'validity_period_months' => 'nullable|integer',
            'certificate_file_url' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:2048',
            'issue_date' => 'required|date',
            'expiry_date' => 'nullable|date|after:issue_date',
            'status' => 'required|string|in:active,inactive',
            'base_url' => 'required|url', // Require base_url to match API_BASE_URL
        ]);

        // Handle file upload and store the full URL
        $fileUrl = null;
        if ($request->hasFile('certificate_file_url') && $request->file('certificate_file_url')->isValid()) {
            $file = $request->file('certificate_file_url');
            // Generate a unique filename
            $filename = time() . '_' . $file->getClientOriginalName();
            // Store directly in public/certificates
            $file->storeAs('certificates', $filename, 'public_direct');
            $fileUrl = $validated['base_url'] . '/certificates/' . $filename; // Constructs full URL, e.g., http://172.20.10.7:8000/certificates/filename.pdf
        }

        $certification = Certification::create([
            'guide_id' => $validated['guide_id'],
            'certification_name' => $validated['certification_name'],
            'certificate_number' => $validated['certificate_number'],
            'description' => $validated['description'],
            'renewal_requirements' => $validated['renewal_requirements'],
            'validity_period_months' => $validated['validity_period_months'],
            'certificate_file_url' => $fileUrl, // Store the full URL
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
            ->with('success', "Certification \"{$certification->certification_name}\" created successfully.");
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $certification = Certification::with(['guide', 'issuer'])->findOrFail($id);
    
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
        try {
            if ($request->expectsJson()) {
                // Mobile API logic (mimicking updateProfile)
                $validator = Validator::make($request->all(), [
                    'guide_id' => 'nullable|exists:users,id',
                    'certificate_number' => 'nullable|string|max:255|unique:guide_certifications,certificate_number,' . $certification->id,
                    'certification_name' => 'nullable|string|max:255|unique:guide_certifications,certification_name,' . $certification->id,
                    'description' => 'nullable|string',
                    'renewal_requirements' => 'nullable|string',
                    'validity_period_months' => 'nullable|integer',
                    'certificate_file' => 'nullable|image|mimes:jpeg,png,jpg,pdf|max:2048',
                    'issue_date' => 'nullable|date',
                    'expiry_date' => 'nullable|date|after_or_equal:issue_date',
                    'status' => 'nullable|in:active,inactive',
                    'program_name' => 'nullable|string|max:255',
                ]);

                if ($validator->fails()) {
                    return response()->json([
                        'message' => 'Validation failed',
                        'errors' => $validator->errors(),
                    ], 422);
                }

                // Handle certificate file upload
                if ($request->hasFile('certificate_file')) {
                    $file = $request->file('certificate_file');
                    $filename = uniqid('cert_') . '.' . $file->getClientOriginalExtension();
                    $file->move(public_path('certificates'), $filename);
                    $certification->certificate_file_url = url('certificates/' . $filename);
                }

                // Only update fields that are present in the request
                $certification->fill($request->only([
                    'guide_id',
                    'certificate_number',
                    'certification_name',
                    'description',
                    'renewal_requirements',
                    'validity_period_months',
                    'issue_date',
                    'expiry_date',
                    'status',
                    'program_name',
                ]));

                $certification->save();

                return response()->json([
                    'message' => "Certification \"{$certification->certification_name}\" updated successfully.",
                    'certification' => new CertificationResource($certification),
                ])->setStatusCode(200, 'OK');
            } else {
                // Web logic (exactly as provided)
                $validated = $request->validate([
                    'guide_id' => 'required|exists:users,id',
                    'certificate_number' => 'required|string|max:255|unique:guide_certifications,certificate_number,' . $certification->id,
                    'certification_name' => 'required|string|max:255|unique:guide_certifications,certification_name,' . $certification->id,
                    'description' => 'nullable|string',
                    'renewal_requirements' => 'nullable|string',
                    'validity_period_months' => 'nullable|integer',
                    'certificate_file_url' => 'nullable', // Allow null or file
                    'issue_date' => 'required|date',
                    'expiry_date' => 'nullable|date|after_or_equal:issue_date',
                    'status' => 'required|in:active,inactive',
                    'base_url' => 'required|url',
                ]);

                // Prepare data for update
                $updateData = $validated;

                if ($request->hasFile('certificate_file_url')) {
                    // Validate file separately if uploaded
                    $request->validate([
                        'certificate_file_url' => 'file|mimes:pdf,jpg,jpeg,png|max:2048',
                    ]);

                    // Delete old file if exists
                    if ($certification->certificate_file_url) {
                        $oldFilePath = parse_url($certification->certificate_file_url, PHP_URL_PATH);
                        $relativePath = ltrim(str_replace('/certificates/', '', $oldFilePath), '/');
                        if ($relativePath && Storage::disk('public_direct')->exists('certificates/' . $relativePath)) {
                            Storage::disk('public_direct')->delete('certificates/' . $relativePath);
                        }
                    }

                    // Store new file
                    $file = $request->file('certificate_file_url');
                    $filename = time() . '_' . $file->getClientOriginalName();
                    $file->storeAs('certificates', $filename, 'public_direct');
                    $updateData['certificate_file_url'] = $request->base_url . '/certificates/' . $filename;
                } else {
                    // Preserve existing certificate_file_url, ignoring any string sent
                    $updateData['certificate_file_url'] = $certification->certificate_file_url;
                }

                $certification->update($updateData);

                return to_route('certifications.index')
                    ->with('success', "Certification \"{$certification->certification_name}\" updated successfully.");
            }
        } catch (\Illuminate\Validation\ValidationException $e) {
            if ($request->expectsJson()) {
                return response()->json([
                    'message' => 'Validation failed.',
                    'errors' => $e->errors(),
                ], 422);
            }

            return back()->withErrors($e->errors())->with('error', 'Failed to update certification. Please check the form.');
        } catch (\Exception $e) {
            if ($request->expectsJson()) {
                return response()->json([
                    'message' => 'An error occurred while updating the certification.',
                    'error' => $e->getMessage(),
                ], 500);
            }

            return back()->with('error', 'An unexpected error occurred. Please try again.');
        }
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
