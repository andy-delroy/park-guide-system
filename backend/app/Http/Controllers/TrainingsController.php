<?php

namespace App\Http\Controllers;

use App\Models\Trainings;
use App\Http\Requests\StoreTrainingsRequest;
use App\Http\Requests\UpdateTrainingsRequest;
use App\Http\Resources\TrainingsResource;
use App\Services\IcsService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

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
        $icsContent = $icsService->generateTrainingIcs($training);

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

    public function index()
    {
        $query = Trainings::query();
        $trainings = $query->paginate(10)->onEachSide(1);

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
        $user = auth()->user();
        if ($user->role->role_name !== 'admin') {
            abort(403, 'Unauthorized');
        }

        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'location' => 'required|string|max:255',
            'capacity' => 'required|integer|min:1',
        ]);

        Trainings::create($request->all());

        return redirect()->route('trainings.index')->with('success', 'Training created successfully!');
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

    public function edit(Trainings $trainings)
    {
        // Not needed for API 
    }

    public function update(UpdateTrainingsRequest $request, Trainings $trainings)
    {
        $trainings->update($request->validated());
        return new TrainingsResource($trainings);
    }

    public function destroy(Trainings $trainings)
    {
        $trainings->delete();
        return response()->json(['message' => 'Training deleted']);
    }
}
