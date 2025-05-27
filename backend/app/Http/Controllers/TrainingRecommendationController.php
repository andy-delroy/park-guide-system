<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Http;

class TrainingRecommendationController extends Controller
{
    public function index(Request $request)
    {
        // Get guide_id from query or logged-in user
        $guideId = $request->user()?->id ?: $request->query('guide_id');

        if (!$guideId) {
            abort(400, 'Guide ID is required.');
        }

        // Flask API URL (adjust host/port if needed)
        $flaskApiUrl = 'http://localhost:5001/recommend_training';

        // Call Flask API
        $response = Http::get($flaskApiUrl, ['guide_id' => $guideId]);

        if ($response->failed()) {
            // Return empty or error data if needed
            return Inertia::render('TrainingRecommendations', [
                'recommendedTrainings' => [],
                'error' => 'Failed to get training recommendations.',
            ]);
        }

        // Get recommended trainings from Flask API response
        $recommendedTrainings = $response->json('recommended_trainings', []);

        return Inertia::render('TrainingRecommendations', [
            'recommendedTrainings' => $recommendedTrainings,
        ]);
    }
}
