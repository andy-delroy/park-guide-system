<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\GuideFeedback; 
use Illuminate\Support\Facades\Validator;
use App\Models\User;

class GuideFeedbackController extends Controller
{
    public function store(Request $request, $username)
    {
        // Find the guide by username
        $guide = User::where('username', $username)->firstOrFail();

        // Validate the incoming request data
        $validator = Validator::make($request->all(), [
            'visitor_id' => 'nullable|exists:users,id',
            'tour_date' => 'nullable|date',
            'rating' => 'required|integer|between:1,5',
            'comments' => 'nullable|string',
            'feedback_categories' => 'nullable|string',
            'is_public' => 'boolean',
            'status' => 'in:pending,approved,rejected',
            'park_id' => 'nullable|exists:parks,id',
        ]);

        // If validation fails, return errors
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Create the feedback for the guide
        $feedback = GuideFeedback::create([
            'guide_id' => $guide->id,  // Use the guide's ID here
            'visitor_id' => $request->visitor_id,
            'tour_date' => $request->tour_date,
            'rating' => $request->rating,
            'comments' => $request->comments,
            'feedback_categories' => $request->feedback_categories,
            'is_public' => $request->is_public ?? false,
            'status' => $request->status ?? 'pending',
            'park_id' => $request->park_id,
        ]);

        // Return a success response
        return response()->json([
            'message' => 'Feedback submitted successfully.',
            'feedback' => $feedback
        ], 201);
    }

    public function showFeedbacks($username)
    {
        // Find the guide by username
        $guide = User::where('username', $username)->firstOrFail();

        // Fetch the feedbacks ordered by submitted_date descending (newest first)
        $feedbacks = GuideFeedback::where('guide_id', $guide->id)
            ->orderBy('submitted_date', 'desc')
            ->get();

        // Return a success response with the feedbacks
        return response()->json([
            'feedbacks' => $feedbacks
        ], 200);
    }

}
