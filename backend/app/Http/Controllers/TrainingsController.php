<?php

namespace App\Http\Controllers;

use App\Models\Trainings;
use App\Http\Requests\StoreTrainingsRequest;
use App\Http\Requests\UpdateTrainingsRequest;
use App\Http\Resources\TrainingsResource;

class TrainingsController extends Controller
{
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
