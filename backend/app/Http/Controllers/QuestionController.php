<?php

namespace App\Http\Controllers;

use App\Models\Quiz;
use App\Models\Question;
use Illuminate\Http\Request;

class QuestionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Quiz $quiz)
    {
        $questions = $quiz->questions; // Fetch all questions for the quiz
        return view('questions.index', compact('quiz', 'questions'));
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(Quiz $quiz)
    {
        return view('questions.create', compact('quiz'));
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request, Quiz $quiz)
    {
        $validated = $request->validate([
            'question' => 'required|string',
            'options' => 'nullable|array', // Options are only required for MCQ and Multiple Answer MCQ
            'question_type' => 'required|string|in:MCQ,True/False,Fill in the Blank,Multiple Answer MCQ',
            'correct_answer' => 'required|string',
        ]);

        $quiz->questions()->create($validated);

        return redirect()->route('quiz.edit', $quiz->id)->with('success', 'Question added successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Question $question)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Quiz $quiz, Question $question)
    {
        return Inertia::render('Question/Edit', [
            'quiz' => $quiz,
            'question' => $question,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Quiz $quiz, Question $question)
    {
        $validated = $request->validate([
            'question' => 'required|string',
            'options' => 'nullable|array',
            'question_type' => 'required|string|in:MCQ,True/False,Fill in the Blank,Multiple Answer MCQ',
            'correct_answer' => 'required|string',
        ]);

        $question->update($validated);

        return redirect()->route('quizzes.questions.index', $quiz)->with('success', 'Question updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Quiz $quiz, Question $question)
    {
        $question->delete();

        return redirect()->route('quizzes.questions.index', $quiz)->with('success', 'Question deleted successfully.');
    }
}
