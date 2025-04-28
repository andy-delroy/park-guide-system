<?php

namespace App\Http\Controllers;

use App\Models\Trainings;
use App\Http\Requests\StoreTrainingsRequest;
use App\Http\Requests\UpdateTrainingsRequest;
use App\Http\Resources\TrainingsResource;

class TrainingModuleController extends Controller
{
    // List all trainings
    public function index()
    {
        return Trainings::all();
    }

    // Show one training by ID
    public function show($id)
    {
        return Trainings::findOrFail($id);
    }

    // Create new training
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string',
            'category' => 'required|string',
            'duration' => 'required|string',
            'description' => 'nullable|string',
            'created_by' => 'required|exists:users,id', // assumes the user creating exists
        ]);

        $training = Trainings::create($validated);

        return response()->json($training, 201);
    }

    // Update existing training
    public function update(Request $request, $id)
    {
        $training = Trainings::findOrFail($id);

        $validated = $request->validate([
            'title' => 'sometimes|string',
            'category' => 'sometimes|string',
            'duration' => 'sometimes|string',
            'description' => 'nullable|string',
            'created_by' => 'sometimes|exists:users,id',
        ]);

        $training->update($validated);

        return response()->json($training);
    }

    // Delete training
    public function destroy($id)
    {
        Trainings::destroy($id);

        return response()->json(['message' => 'Training deleted']);
    }
}
