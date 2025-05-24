<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class RecommenderController extends Controller
{
    public function getRecommendations(Request $request)
    {
        $guideId = $request->user()->id;

        $response = Http::get("http://127.0.0.1:5000/recommend", [
            'guide_id' => $guideId
        ]);

        if ($response->successful()) {
            return response()->json($response->json());
        }

        return response()->json(['error' => 'Unable to get recommendations'], 500);
    }
}
