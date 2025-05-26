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
use Carbon\Carbon;
use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Gd\Driver;
use App\Models\Course;
use App\Models\User;

class CertificationController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $user = auth()->user();
        $type = $request->query('type', 'certificate'); // Default to 'certificate'

        // Validate type
        if (!in_array($type, ['certificate', 'license'])) {
            abort(400, 'Invalid type.');
        }

        // Base query
        $query = Certification::with(['guide', 'issuer'])->where('type', $type);

        // Role-based filtering
        if ($user->role->role_name === 'guide') {
            $query->where('guide_id', $user->id);
        } elseif ($user->role->role_name !== 'admin') {
            abort(403, 'Unauthorized');
        }

        $certifications = $query->get();

        // JSON for API consumers
        if ($request->expectsJson()) {
            return CertificationResource::collection($certifications);
        }

        // Inertia page selection based on type
        return inertia($type === 'license' ? 'Licenses/Index' : 'Certifications/Index', [
            'certifications' => $certifications,
        ]);
    }


    /**
     * Show the form for creating a new resource.
     */
    public function create(Request $request)
    {
        $type = $request->query('type', 'certificate'); // default to certificate

        if ($type === 'license') {
            return inertia('Licenses/Create');
        }

        return inertia('Certifications/Create');
    }

    private function getInitials(string $text): string
    {
        return collect(explode(' ', $text))
            ->filter() // remove empty elements
            ->map(fn($word) => strtoupper($word[0]))
            ->implode('');
    }

    private function generateNextCertificateNumber(string $type): string
    {
        $prefix = $type === 'certificate' ? 'CERT' : 'LIC';

        // Fetch all certificate numbers of this type
        $latestNumber = Certification::where('type', $type)
            ->whereNotNull('certificate_number')
            ->pluck('certificate_number')
            ->map(function ($number) use ($prefix) {
                if (preg_match('/' . $prefix . '(\d{8})/', $number, $matches)) {
                    return (int) $matches[1];
                }
                return 0;
            })
            ->max();

        $nextNumber = $latestNumber ? $latestNumber + 1 : 1;

        return $prefix . str_pad($nextNumber, 8, '0', STR_PAD_LEFT);
    }



    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'guide_id' => 'required|exists:users,id',
            'course_id' => 'nullable|exists:courses,id',
            'park_name' => 'nullable|string|max:255',
            'description' => 'required|string',
            'issue_date' => 'required|date',
            'expiry_date' => 'nullable|date|after:issue_date',
            'status' => 'required|string|in:active,inactive',
            'base_url' => 'required|url',
            'type' => 'required|string',
        ]);

        $guide = User::findOrFail($validated['guide_id']);

        // Generate certification name based on type
        $guideName = strtok($guide->full_name, ' ');

        if ($validated['type'] === 'certificate') {
            $course = Course::findOrFail($validated['course_id']);
            $courseInitials = $this->getInitials($course->title);
            $certificationName = "{$guideName} - {$courseInitials} Cert";
        } else {
            $parkName = $validated['park_name'] ?? 'Unknown';
            $parkInitials = $this->getInitials($parkName);
            $certificationName = "{$guideName} - {$parkInitials} License";
        }

        $certificateNumber = $this->generateNextCertificateNumber($validated['type']);

        // First, create the Certification (without image URL yet)
        $certification = Certification::create([
            'guide_id' => $validated['guide_id'],
            'course_id' => $validated['course_id'] ?? null,
            'certification_name' => $certificationName,
            'certificate_number' => $certificateNumber,
            'description' => $validated['description'],
            'certificate_file_url' => null, // temporarily null
            'issued_by' => auth()->id(),
            'issue_date' => $validated['issue_date'],
            'expiry_date' => $validated['expiry_date'] ?? null,
            'status' => $validated['status'],
            'type' => $validated['type'],
        ]);

        if ($certification->type === 'certificate') {
            // Generate the certificate image and get its public URL
            $imageUrl = $this->generateCertificateImage($certification->fresh(['guide', 'course', 'issuer']), $validated['base_url']);
        }

        if ($certification->type === 'license') {
            // Generate the license image and get its public URL
            $imageUrl = $this->generateLicenseImage($certification->fresh(['guide', 'course', 'issuer']), $validated['base_url'], $validated['park_name'] ?? 'Unknown');
        }

        // Update the certificate record with the image URL
        $certification->update([
            'certificate_file_url' => $imageUrl,
        ]);

        // Return JSON or redirect
        if ($request->wantsJson() || $request->is('api/*')) {
            return response()->json([
                'message' => "Certification \"{$certification->certification_name}\" created and image generated successfully.",
                'certification' => $certification,
            ], 201);
        }

        // Redirect based on type
        if ($certification->type === 'certificate') {
            return to_route('certification.index', ['type' => 'certificate'])
                ->with('success', "Certificate \"{$certification->certification_name}\" created and image generated successfully.");
        } elseif ($certification->type === 'license') {
            return to_route('certification.index', ['type' => 'license'])
                ->with('success', "License \"{$certification->certification_name}\" created and image generated successfully.");
        }

        // Fallback
        return to_route('certification.index')
            ->with('success', "Certification \"{$certification->certification_name}\" created and image generated successfully.");
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $certification = Certification::with(['guide', 'issuer', 'course'])->findOrFail($id);
    
        if (auth()->user()->role->role_name === 'guide' && $certification->guide_id !== auth()->id()) {
            abort(403, 'Unauthorized');
        }
    
        if ($certification->type === 'license') {
            return inertia('Licenses/Details', [
                'certification' => $certification,
            ]);
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
                    'course_id' => 'nullable|exists:courses,id',
                    'certificate_number' => 'nullable|string|max:255|unique:guide_certifications,certificate_number,' . $certification->id,
                    'certification_name' => 'nullable|string|max:255|unique:guide_certifications,certification_name,' . $certification->id,
                    'description' => 'nullable|string',
                    'issue_date' => 'nullable|date',
                    'expiry_date' => 'nullable|date|after_or_equal:issue_date',
                    'status' => 'nullable|in:active,inactive',
                ]);

                if ($validator->fails()) {
                    return response()->json([
                        'message' => 'Validation failed',
                        'errors' => $validator->errors(),
                    ], 422);
                }

                // Only update fields that are present in the request
                $certification->fill($request->only([
                    'guide_id',
                    'course_id',
                    'certificate_number',
                    'certification_name',
                    'description',
                    'issue_date',
                    'expiry_date',
                    'status',
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
                    'course_id' => 'required|exists:courses,id',
                    'certificate_number' => 'required|string|max:255|unique:guide_certifications,certificate_number,' . $certification->id,
                    'certification_name' => 'required|string|max:255|unique:guide_certifications,certification_name,' . $certification->id,
                    'description' => 'nullable|string',
                    'issue_date' => 'required|date',
                    'expiry_date' => 'nullable|date|after_or_equal:issue_date',
                    'status' => 'required|in:active,inactive',
                    'base_url' => 'required|url',
                ]);

                // Prepare data for update
                $updateData = $validated;

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

            // Redirect based on type
            if ($certification->type === 'certificate') {
                return redirect()->route('certification.index', ['type' => 'certificate'])->with('success', 'Certification deleted successfully.');
            } elseif ($certification->type === 'license') {
                return redirect()->route('certification.index', ['type' => 'license'])->with('success', 'License deleted successfully.');
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

    public function renew($id)
    {
        $cert = Certification::findOrFail($id);

        // Add 12 months to current expiry date or now
        $currentExpiry = $cert->expiry_date ? Carbon::parse($cert->expiry_date) : Carbon::now();
        $newExpiry = $currentExpiry->copy()->addMonths(12);

        // Store only the date part (Y-m-d), no time
        $cert->expiry_date = $newExpiry->format('Y-m-d');

        // Increment renewal count
        $cert->renewal_count = $cert->renewal_count + 1;

        $cert->save();

        return redirect()->back()->with('success', 'Certification renewed successfully.');
    }

    public function generateCertificateImage($certification, $baseUrl)
    {
        // Validate file paths
        $templatePath = public_path('storage/templates/certificate_template.png');
        $outputDir = public_path('storage/certificates');

        if (!file_exists($templatePath)) {
            \Log::error('Certificate template not found at: ' . $templatePath);
            throw new \Exception('Certificate template not found');
        }
        if (!is_dir($outputDir)) {
            mkdir($outputDir, 0755, true);
        }

        // Create an ImageManager instance with GD driver
        $manager = new ImageManager(new Driver());

        // Load the base certificate template image
        $img = $manager->read($templatePath);

        // Set text properties
        $guideName = $certification->guide->full_name;
        $programName = $certification->course->title;
        $issuedBy = $certification->issuer->full_name;
        $issueDate = Carbon::parse($certification->issue_date)->format('F j, Y');

        $img->text($guideName, 1000, 620, function ($font) {
            $font->filename(public_path('fonts/q.ttf'));
            $font->size(90);
            $font->color('#000000');
            $font->align('center');
            $font->valign('middle');
        });

        $img->text($programName, 1000, 800, function ($font) {
            $font->filename(public_path('fonts/q.ttf'));
            $font->size(60);
            $font->color('#000000');
            $font->align('center');
            $font->valign('middle');
        });

        $img->text($issuedBy, 1100, 1190, function ($font) {
            $font->filename(public_path('fonts/q.ttf'));
            $font->size(35);
            $font->color('#000000');
            $font->align('center');
            $font->valign('middle');
        });

        $img->text($issueDate, 1100, 1250, function ($font) {
            $font->filename(public_path('fonts/q.ttf'));
            $font->size(35);
            $font->color('#000000');
            $font->align('center');
            $font->valign('middle');
        });

        // Save to the same public path as uploaded certificates
        $filename = time() . '_certificate_' . $certification->id . '.png';
        $path = public_path('storage/certificates/' . $filename);
        $img->save($path);

        // Return the full public URL
        return $baseUrl . '/certificates/' . $filename;
    }

    public function generateLicenseImage($certification, $baseUrl, $parkName)
    {
        // Validate file paths
        $templatePath = public_path('storage/templates/license_template.png');
        $outputDir = public_path('storage/licenses');

        if (!file_exists($templatePath)) {
            \Log::error('License template not found at: ' . $templatePath);
            throw new \Exception('License template not found');
        }
        if (!is_dir($outputDir)) {
            mkdir($outputDir, 0755, true);
        }

        // Create an ImageManager instance with GD driver
        $manager = new ImageManager(new Driver());

        // Load the base certificate template image
        $img = $manager->read($templatePath);

        // Set text properties
        $guideID = $certification->guide->identification_number;
        $guideName = $certification->guide->full_name;
        $phoneNumber = $certification->guide->phone_number ?? 'N/A';
        $issueDate = $certification->issue_date ? Carbon::parse($certification->issue_date)->format('F j, Y') : 'N/A';
        $expiryDate = $certification->expiry_date ? Carbon::parse($certification->expiry_date)->format('F j, Y') : 'N/A';

        $img->text($parkName, 400, 130, function ($font) {
            $font->filename(public_path('fonts/q.ttf'));
            $font->size(60);
            $font->color('#ffffff');
            $font->align('center');
            $font->valign('middle');
        });

        $img->text($guideID, 180, 444, function ($font) {
            $font->filename(public_path('fonts/q.ttf'));
            $font->size(30);
            $font->color('#000000');
            $font->align('center');
            $font->valign('middle');
        });

        $img->text($guideName, 270, 480, function ($font) {
            $font->filename(public_path('fonts/q.ttf'));
            $font->size(30);
            $font->color('#000000');
            $font->align('center');
            $font->valign('middle');
        });

        $img->text($phoneNumber, 370, 520, function ($font) {
            $font->filename(public_path('fonts/q.ttf'));
            $font->size(30);
            $font->color('#000000');
            $font->align('center');
            $font->valign('middle');
        });

        $img->text($issueDate, 290, 560, function ($font) {
            $font->filename(public_path('fonts/q.ttf'));
            $font->size(30);
            $font->color('#000000');
            $font->align('center');
            $font->valign('middle');
        });

        $img->text($expiryDate, 300, 600, function ($font) {
            $font->filename(public_path('fonts/q.ttf'));
            $font->size(30);
            $font->color('#000000');
            $font->align('center');
            $font->valign('middle');
        });

        // Save to the same public path as uploaded certificates
        $filename = time() . '_license_' . $certification->id . '.png';
        $path = public_path('storage/licenses/' . $filename);
        $img->save($path);

        // Return the full public URL
        return $baseUrl . '/licenses/' . $filename;
    }
}
