<?php

namespace App\Http\Controllers;

use App\Models\Trainings;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class TrainingSessionController extends Controller
{
    // List all sessions with basic training info
    public function index()
    {
        return Trainings::with('creator')->get();
    }

    // Enroll a user into a training session
    public function enroll(Request $request, $trainingId)
    {
        $training = Trainings::findOrFail($trainingId);

        // Use authenticated user or passed-in user_id
        $userId = $request->user()->id ?? $request->input('user_id');

        // Check if already enrolled
        if ($training->users()->where('user_id', $userId)->exists()) {
            return response()->json(['message' => 'Already enrolled'], 409);
        }

        // Capacity check (if implemented)///////////RECHECK////////
        if ($training->users()->count() >= $training->capacity) {
            return response()->json(['message' => 'Training is full'], 403);
        }

        $training->users()->attach($userId);

        return response()->json(['message' => 'Successfully enrolled'], 201);
    }

    // Unenroll a user from a training session
    public function unenroll(Request $request, $trainingId)
    {
        $training = Trainings::findOrFail($trainingId);
        $userId = $request->user()->id ?? $request->input('user_id');

        $training->users()->detach($userId);

        return response()->json(['message' => 'Unenrolled successfully']);
    }

    // View enrolled users for a training session
    public function enrolledUsers($trainingId)
    {
        $training = Trainings::with('users')->findOrFail($trainingId);
        return response()->json($training->users);
    }
}
