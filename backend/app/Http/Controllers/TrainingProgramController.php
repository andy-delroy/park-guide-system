<?php

namespace App\Http\Controllers;

use App\Models\Trainings;
use App\Http\Requests\StoreTrainingsRequest;
use App\Http\Requests\UpdateTrainingsRequest;
use App\Http\Resources\TrainingsResource;

class TrainingProgramController extends Controller
{
    // GET /api/training-programs
    public function index()
    {
        return Trainings::all();
    }

    // POST /api/training-programs
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string',
            'category' => 'required|string',
            'duration' => 'required|string',
            'description' => 'nullable|string',
            'created_by' => 'required|exists:users,id', // make sure the user exists
        ]);

        $training = Trainings::create($validated);

        return response()->json($training, 201);
    }

    // GET /api/training-programs/{id}
    public function show($id)
    {
        return Trainings::findOrFail($id);
    }

    // PUT /api/training-programs/{id}
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

    // DELETE /api/training-programs/{id}
    public function destroy($id)
    {
        Trainings::destroy($id);

        return response()->json(['message' => 'Training deleted']);
    }
}
