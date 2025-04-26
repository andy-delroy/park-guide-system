<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\GuideFeedback;
use Illuminate\Support\Facades\Validator;
use App\Models\User;

class GuideFeedbackController extends Controller
{
    public function store(Request $request, $id)
    {
        // Find the guide by ID, ensure role_id = 2
        $guide = User::where('id', $id)
            ->where('role_id', 2)
            ->firstOrFail();

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

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Use authenticated user as visitor_id if available, otherwise null
        $visitorId = $request->visitor_id ?? ($request->user() ? $request->user()->id : null);

        // Create the feedback for the guide
        $feedback = GuideFeedback::create([
            'guide_id' => $guide->id,
            'visitor_id' => $visitorId,
            'tour_date' => $request->tour_date,
            'rating' => $request->rating,
            'comments' => $request->comments,
            'feedback_categories' => $request->feedback_categories,
            'is_public' => $request->is_public ?? false,
            'status' => $request->status ?? 'pending',
            'park_id' => $request->park_id,
            'submitted_date' => now(),
        ]);

        return response()->json([
            'message' => 'Feedback submitted successfully.',
            'feedback' => $feedback
        ], 201);
    }

    public function showFeedbacks($id)
    {
        // Find the guide by ID, ensure role_id = 2
        $guide = User::where('id', $id)
            ->where('role_id', 2)
            ->firstOrFail();

        // Fetch the feedbacks ordered by submitted_date descending
        $feedbacks = GuideFeedback::where('guide_id', $guide->id)
            ->select('rating', 'comments', 'submitted_date', 'tour_date', 'feedback_categories', 'is_public', 'status')
            ->orderBy('submitted_date', 'desc')
            ->get();

        return response()->json([
            'feedbacks' => $feedbacks
        ], 200);
    }
}