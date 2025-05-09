<?php

namespace App\Http\Controllers;

use App\Models\Trainings;
use App\Http\Requests\StoreTrainingsRequest;
use App\Http\Requests\UpdateTrainingsRequest;
use App\Http\Resources\TrainingsResource;
use App\Services\IcsService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;
use Inertia\Inertia;

class TrainingsController extends Controller
{
    public function enroll($id)
    {
        $user = Auth::user();
        $training = Trainings::findOrFail($id);

        if ($training->users()->where('user_id', $user->id)->exists()) {
            return response()->json(['message' => 'Already enrolled.'], 409);
        }

        if ($training->users()->count() >= $training->capacity) {
            return response()->json(['message' => 'Training is full.'], 403);
        }

        $training->users()->attach($user->id);

        $icsService = new IcsService();
        // Reuse bulk method with a single-item array
        $icsContent = $icsService->generateBulkTrainingIcs([$training]);

        return response($icsContent, 200, [
            'Content-Type' => 'text/calendar',
            'Content-Disposition' => 'attachment; filename="training.ics"',
        ]);
    }

    public function unenroll($id)
    {
        $user = Auth::user();
        $training = Trainings::findOrFail($id);

        if (!$training->users()->where('user_id', $user->id)->exists()) {
            return response()->json(['message' => 'Not enrolled in this training.'], 409);
        }

        $training->users()->detach($user->id);

        return response()->json(['message' => 'Enrollment cancelled successfully.']);
    }


    public function downloadSchedule()
    {
        $user = auth()->user();
        $trainings = $user->trainings;

        $icsService = new IcsService();
        $icsContent = $icsService->generateBulkTrainingIcs($trainings);

        return response($icsContent, 200, [
            'Content-Type' => 'text/calendar',
            'Content-Disposition' => 'attachment; filename="my-trainings.ics"',
        ]);
    }

    public function index(Request $request)
    {
        $user = auth()->user();

        if ($user->role->role_name === 'guide') {
            $trainings = Trainings::query()->paginate(10)->onEachSide(1);
        } else if ($user->role->role_name === 'admin') {
            $trainings = Trainings::query()->paginate(10)->onEachSide(1);
        } else {
            abort(403, 'Unauthorized');
        }

        if ($request->expectsJson()) {
            return TrainingsResource::collection($trainings);
        }
        
        return inertia("Trainings/Index", [
            "trainings" => TrainingsResource::collection($trainings),
        ]);
    }

    public function create()
    {
        $user = auth()->user();
        if ($user->role->role_name !== 'admin') {
            abort(403, 'Unauthorized');
        }

        return inertia('Trainings/Create');
    }

    public function store(Request $request)
    {
        // Authenticate using Sanctum's Bearer token
        $user = Auth::guard('sanctum')->user();
        if (!$user || $user->role->role_name !== 'admin') {
            if ($request->expectsJson()) {
                return response()->json([
                    'message' => 'Unauthorized',
                    'errors' => ['auth' => ['You do not have permission to perform this action.']],
                ], 403);
            }
            abort(403, 'Unauthorized');
        }

        // Validate the request
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'location' => 'required|string|max:255',
            'capacity' => 'required|integer|min:1',
        ]);

        try {
            // Parse dates using Carbon
            $validated['start_date'] = Carbon::parse($validated['start_date']);
            $validated['end_date'] = Carbon::parse($validated['end_date']);

            // Create the training
            $training = Trainings::create($validated);

            if ($request->expectsJson()) {
                // Return JSON response with TrainingsResource for mobile
                return new TrainingsResource($training);
            }

            // Return web response for Inertia
            return redirect()->route('trainings.index')->with('success', 'Training created successfully!');
        } catch (\Exception $e) {
            if ($request->expectsJson()) {
                // Handle unexpected errors for JSON requests
                return response()->json([
                    'message' => 'Failed to create training.',
                    'errors' => ['server' => [$e->getMessage()]],
                ], 500);
            }
            throw $e; // Let Laravel handle web errors
        }
    }

    public function myTrainings()
    {
        $user = auth()->user();
        $trainings = $user->trainings()->paginate(10)->onEachSide(1);

        return inertia('Trainings/MyTrainings', [
            'trainings' => TrainingsResource::collection($trainings),
        ]);
    }

    public function show(Trainings $trainings)
    {
        return new TrainingsResource($trainings);
    }

    public function edit($id)
    {
        $user = auth()->user();
        if ($user->role->role_name !== 'admin') {
            abort(403, 'Unauthorized');
        }

        $training = Trainings::findOrFail($id);

        return Inertia::render('Trainings/Edit', [
            'training' => $training,
        ]);
    }

    public function update(Request $request, $id)
    {
        // Authenticate using Sanctum's Bearer token
        $user = Auth::guard('sanctum')->user();
        if (!$user || $user->role->role_name !== 'admin') {
            if ($request->expectsJson()) {
                return response()->json([
                    'message' => 'Unauthorized',
                    'errors' => ['auth' => ['You do not have permission to perform this action.']],
                ], 403);
            }
            abort(403, 'Unauthorized');
        }

        // Find the training or return 404
        $training = Trainings::findOrFail($id);

        // Validate the JSON request
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'location' => 'required|string|max:255',
            'capacity' => 'required|integer|min:1',
        ]);

        try {
            // Parse dates using Carbon
            $validated['start_date'] = Carbon::parse($validated['start_date']);
            $validated['end_date'] = Carbon::parse($validated['end_date']);

            // Update the training
            $training->update($validated);

            if ($request->expectsJson()) {
                // Return JSON response with TrainingsResource for mobile
                return new TrainingsResource($training);
            }

            // Return web response for Inertia
            return redirect()->route('trainings.index')->with('success', 'Training updated successfully!');
        } catch (\Exception $e) {
            if ($request->expectsJson()) {
                // Handle unexpected errors for JSON requests
                return response()->json([
                    'message' => 'Failed to update training.',
                    'errors' => ['server' => [$e->getMessage()]],
                ], 500);
            }
            throw $e; // Let Laravel handle web errors
        }
    }

    public function destroy($id)
    {
        $training = Trainings::findOrFail($id);

        // If you have a pivot table or dependencies, detach or delete them first
        $training->users()->detach();

        $training->delete();

        return response()->json(['message' => 'Training deleted successfully.']);
    }

}
