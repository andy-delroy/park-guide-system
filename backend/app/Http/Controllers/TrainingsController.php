<?php

namespace App\Http\Controllers;

use App\Models\Trainings;
use App\Http\Requests\StoreTrainingsRequest;
use App\Http\Requests\UpdateTrainingsRequest;
use App\Http\Resources\TrainingsResource;
use App\Services\IcsService;
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

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $query = Trainings::query();
        $trainings = $query->paginate(10)->onEachSide(1);

        // If you're using Inertia (full-stack Laravel+React/Vue):
        return inertia("Trainings/Index", [
            "trainings" => TrainingsResource::collection($trainings),
        ]);

        // If you're returning JSON only (for React API frontend), use this instead:
        // return TrainingsResource::collection($trainings);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        // Not needed for API 
    }

    public function myTrainings()
{
    $user = auth()->user();
    $trainings = $user->trainings()->paginate(10)->onEachSide(1);

    return inertia('Trainings/MyTrainings', [
        'trainings' => TrainingsResource::collection($trainings),
    ]);
}

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreTrainingsRequest $request)
    {
        $training = Trainings::create($request->validated());
        return new TrainingsResource($training);
    }

    /**
     * Display the specified resource.
     */
    public function show(Trainings $trainings)
    {
        return new TrainingsResource($trainings);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Trainings $trainings)
    {
        // Not needed for API 
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateTrainingsRequest $request, Trainings $trainings)
    {
        $trainings->update($request->validated());
        return new TrainingsResource($trainings);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Trainings $trainings)
    {
        $trainings->delete();
        return response()->json(['message' => 'Training deleted']);
    }
}
