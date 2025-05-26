<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\Quiz;
use App\Models\Course;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class QuizController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $quizzes = Quiz::all();
    
        return Inertia::render('Quiz/Index', [
            'quizzes' => $quizzes->map(function ($quiz) {
                return [
                    'id' => $quiz->id,
                    'title' => $quiz->title,
                    'description' => $quiz->description,
                    'time_duration' => $quiz->time_duration,
                    'guide_score' => $quiz->guide_score, // Access the accessor here
                ];
            }),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(Request $request)
    {
        $courseId = $request->query('course_id');
            return Inertia::render('Quiz/Create', [
            'course_id' => $courseId,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'time_duration' => 'nullable|integer',
            'total_score' => 'nullable|integer',
            'course_id' => 'required|exists:courses,id',
        ]);

        Quiz::create([
            'title' => $validated['title'],
            'description' => $validated['description'],
            'time_duration' => $validated['time_duration'],
            'total_score' => $validated['total_score'],
            'course_id' => $validated['course_id'],
            'created_by' => auth()->id(),
        ]);
        // return redirect()->route('quiz.index')->with('success', 'Quiz created successfully.');
        return redirect()->route('courses.modules.index', ['course' => $validated['course_id']])->with('success', 'Quiz created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Quiz $quiz)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit($id)
    {
        $quiz = Quiz::with('questions')->findOrFail($id); // Fetch the quiz with its questions
        return Inertia::render('Quiz/Edit', [
            'quiz' => $quiz,
            'existingQuestions' => $quiz->questions, // Pass the questions to the frontend
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Quiz $quiz)
    {
        // Validate the request data
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'time_duration' => 'nullable|integer|min:1',
        ]);

        // Update the quiz details
        $quiz->update([
            'title' => $validated['title'],
            'description' => $validated['description'],
            'time_duration' => $validated['time_duration'],
        ]);

        // Redirect back to the quiz index page with a success message
        return redirect()->route('quiz.index')->with('success', 'Quiz updated successfully.');
    }

    public function take(Quiz $quiz)
    {
        $quiz->load('questions');

        return Inertia::render('Quiz/Take', [
            'quiz' => $quiz,
        ]);
    }

    // public function submit(Request $request, Quiz $quiz)
    // {
    //     $validated = $request->validate([
    //         'answers' => 'required|array',
    //     ]);

    //     $score = 0;

    //     // Calculate the score
    //     foreach ($quiz->questions as $question) {
    //         $correctAnswer = $question->correct_answer;

    //         if ($question->question_type === 'Multiple Answer MCQ') {
    //             // For multiple answer MCQ, compare arrays
    //             $submittedAnswers = $validated['answers'][$question->id] ?? [];
    //             if (is_array($submittedAnswers) && $submittedAnswers == $correctAnswer) {
    //                 $score++;
    //             }
    //         } else {
    //             // For other question types, compare strings
    //             $submittedAnswer = $validated['answers'][$question->id] ?? '';
    //             if ($submittedAnswer === $correctAnswer) {
    //                 $score++;
    //             }
    //         }
    //     }

    //     // Update the total_score in the quizzes table
    //     $quiz->update([
    //         'total_score' => $score,
    //     ]);

    //     // Redirect to the Quiz Index page with a success message
    //     return redirect()->route('quiz.index')->with('success', 'Quiz submitted successfully. Your score: ' . $score);
    // }

    public function submitQuiz(Request $request, Quiz $quiz)
    {
        try {
            // Log session state
            Log::info('Session state', [
                'session_id' => session()->getId(),
                'has_session' => session()->isStarted(),
            ]);

            // Check for authenticated user
            $user = auth()->user();
            if (!$user) {
                Log::warning('Unauthenticated quiz submission attempt', [
                    'quiz_id' => $quiz->id,
                    'auth_id' => auth()->id(),
                    'session_data' => session()->all(),
                ]);
                return response()->json(['error' => 'Unauthenticated'], 401);
            }

            // Log request data
            Log::info('Received quiz submission request', [
                'quiz_id' => $quiz->id,
                'user_id' => $user->id,
                'request_data' => $request->all(),
            ]);

            // Validate the request
            $request->validate([
                'total_score' => 'required|integer|min:0',
                'time_taken' => 'required|integer|min:0',
            ]);

            // Verify quiz exists
            if (!$quiz->exists) {
                Log::error('Quiz not found', ['quiz_id' => $quiz->id]);
                return response()->json(['error' => 'Quiz not found'], 404);
            }

            // Check database connection
            try {
                DB::connection()->getPdo();
            } catch (\Exception $e) {
                Log::error('Database connection failed', ['error' => $e->getMessage()]);
                return response()->json(['error' => 'Database connection failed: ' . $e->getMessage()], 500);
            }

            // Check current pivot table state
            $currentPivot = DB::table('quiz_guide')
                ->where('quiz_id', $quiz->id)
                ->where('guide_id', $user->id)
                ->first();
            Log::info('Current quiz_guide state', [
                'quiz_id' => $quiz->id,
                'user_id' => $user->id,
                'current_pivot' => $currentPivot,
            ]);

            // Update the pivot table
            DB::beginTransaction();
            try {
                Log::info('Attempting syncWithoutDetaching', [
                    'quiz_id' => $quiz->id,
                    'user_id' => $user->id,
                    'data' => [
                        'total_score' => $request->input('total_score'),
                        'time_taken' => $request->input('time_taken'),
                    ],
                ]);
                $quiz->guides()->syncWithoutDetaching([
                    $user->id => [
                        'total_score' => $request->input('total_score'),
                        'time_taken' => $request->input('time_taken'),
                    ],
                ]);
            } catch (\Exception $e) {
                Log::warning('syncWithoutDetaching failed, falling back to manual update', [
                    'error' => $e->getMessage(),
                    'quiz_id' => $quiz->id,
                    'user_id' => $user->id,
                ]);
                DB::table('quiz_guide')->updateOrInsert(
                    [
                        'quiz_id' => $quiz->id,
                        'guide_id' => $user->id,
                    ],
                    [
                        'total_score' => $request->input('total_score'),
                        'time_taken' => $request->input('time_taken'),
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]
                );
            }
            DB::commit();

            // Verify the update
            $updatedPivot = DB::table('quiz_guide')
                ->where('quiz_id', $quiz->id)
                ->where('guide_id', $user->id)
                ->first();
            Log::info('Quiz submission successful', [
                'quiz_id' => $quiz->id,
                'user_id' => $user->id,
                'total_score' => $request->input('total_score'),
                'time_taken' => $request->input('time_taken'),
                'updated_pivot' => $updatedPivot,
            ]);

            if (!$updatedPivot) {
                Log::error('Pivot table update verification failed', [
                    'quiz_id' => $quiz->id,
                    'user_id' => $user->id,
                ]);
                return response()->json(['error' => 'Failed to verify quiz submission'], 500);
            }

            return response()->json([
                'message' => 'Quiz submitted successfully!',
            ], 200);
        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('Quiz submission validation failed', [
                'error' => $e->getMessage(),
                'quiz_id' => $quiz->id,
                'user_id' => $user?->id,
                'request_data' => $request->all(),
            ]);
            return response()->json([
                'error' => 'Validation failed: ' . $e->getMessage(),
            ], 422);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Quiz submission failed', [
                'error' => $e->getMessage(),
                'quiz_id' => $quiz->id,
                'user_id' => $user?->id,
                'request_data' => $request->all(),
            ]);
            return response()->json([
                'error' => 'Failed to submit quiz: ' . $e->getMessage(),
            ], 500);
        }
    }
    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Quiz $quiz)
    {
        $quiz->delete();

        return redirect()->route('quiz.index')->with('success', 'Quiz deleted successfully.');
    }

    public function assignGroup(Request $request, Course $course, Quiz $quiz)
    {
        $request->validate([
            'group_id' => 'nullable|integer|exists:module_groups,id',
        ]);

        if ($quiz->course_id !== $course->id) {
            return response()->json(['message' => 'Quiz does not belong to this course.'], 403);
        }

        $quiz->group_id = $request->input('group_id');
        $quiz->save();

        return response()->json(['message' => 'Quiz group updated.']);
    }

    public function reorder(Request $request, Course $course)
    {
        logger()->info('Received quiz reorder request', [
            'course_id' => $course->id,
            'payload' => $request->all(),
        ]);

        $request->validate([
            'quizzes' => 'required|array',
            'quizzes.*.id' => 'required|integer|exists:quizzes,id',
            'quizzes.*.position' => 'required|integer',
        ]);

        foreach ($request->input('quizzes') as $quizData) {
            $quiz = Quiz::where('id', $quizData['id'])->where('course_id', $course->id)->first();
            if ($quiz) {
                $quiz->position = $quizData['position'];
                $quiz->save();
            }
        }

        return response()->json(['message' => 'Quiz positions updated.']);
    }

}
