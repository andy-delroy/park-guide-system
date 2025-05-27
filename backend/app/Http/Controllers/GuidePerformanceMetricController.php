<?php

namespace App\Http\Controllers;

use App\Models\GuidePerformanceMetric;
use App\Models\GuideModuleProgress;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use App\Models\GuideFeedback;


class GuidePerformanceMetricController extends Controller
{
    public function index()
    {
        return Inertia::render('Guide_Analytic/Analytic');
    }

    public function fetchData(Request $request)
    {
        $guideId = $request->input('guide_id');
        $date = $request->input('date');

        if (!$guideId) {
            return response()->json([]);
        }

        // Query from guide_performance_metrics
        $metricsQuery = GuidePerformanceMetric::where('guide_id', $guideId)
            ->when($date, fn($q) => $q->whereDate('activity_date', $date));

        $dailyActivity = (clone $metricsQuery)
            ->select(DB::raw('DATE(activity_date) as date'))
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        $quizScores = (clone $metricsQuery)
            ->select(DB::raw('DATE(activity_date) as quiz'), DB::raw('AVG(quiz_score) as average_score'))
            ->groupBy('quiz')
            ->orderBy('quiz')
            ->get();

        // New: Pull module progress from guide_module_progress
        $moduleCompletion = GuideModuleProgress::where('guide_id', $guideId)
            ->select('module_id', 'score')
            ->get()
            ->map(function ($row) {
                return [
                    'module' => 'Module ' . $row->module_id,
                    'completion_rate' => $row->score !== null ? round($row->score * 100) : 0,
                ];
            });

        $ratings = GuideFeedback::where('guide_id', $guideId)
    ->when($date, function ($query) use ($date) {
        $end = \Carbon\Carbon::parse($date)->startOfDay();
        $start = $end->copy()->subDays(6);
        return $query->whereBetween('tour_date', [$start, $end]);
    })
    ->get()
    ->groupBy(fn ($row) => \Carbon\Carbon::parse($row->tour_date)->toDateString())
    ->map(fn ($group, $day) => [
        'date' => $day,
        'rating' => round($group->avg('rating'), 2),
    ])
    ->values();


        return response()->json([
            'Daily Active Guides' => $dailyActivity,
            'Quiz Scores' => $quizScores,
            'Module Completion Rate' => $moduleCompletion,
            'Ratings' => $ratings,
            // 'Certification Status' => $certifications, // removed as requested
        ]);
    }
}
