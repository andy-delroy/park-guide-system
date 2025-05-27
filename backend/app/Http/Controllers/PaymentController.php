<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use App\Http\Controllers\CourseController;
use App\Models\Course;
use Inertia\Inertia;

class PaymentController extends Controller
{
    /**
     * Store a payment from user (card or bank)
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'course_id' => 'required|integer',
            'method' => 'required|string|in:card,bank',
            'receipt' => 'nullable|file|mimes:jpg,png,pdf|max:2048',
        ]);

        $path = null;

        if ($request->hasFile('receipt')) {
            $path = $request->file('receipt')->store('receipts', 'public');
        }

        Payment::create([
            'user_id' => Auth::id(),
            'course_id' => $data['course_id'],
            'method' => $data['method'],
            'status' => 'completed',
            'receipt_path' => $path,
        ]);

         // Enroll the guide manually
        $user = Auth::user();
        $course = Course::findOrFail($data['course_id']);

        if (
            $user->role_name === 'guide' &&
            !$course->users()->where('user_id', $user->id)->exists()
        ) {
            $course->users()->attach($user->id);
        }

        return redirect()->route('courses.index')->with('success', 'Payment completed and enrollment successful!');

        // return back()->with('success', 'Payment submitted successfully.');
        // return redirect()->route('courses.index')->with('success', 'Payment completed and enrollment successful!');
    }

    /**
     * Show all payments to admin
     */
    public function index()
    {
        $payments = Payment::with('user')->latest()->get();

        return Inertia::render('Payments/AdminView', [ 
            'payments' => $payments
        ]);
    }

    public function check(Request $request)
    {
        $userId = auth()->id();
        $courseId = $request->course_id;

        $alreadyPaid = Payment::where('user_id', $userId)
            ->where('course_id', $courseId)
            ->where('status', 'completed') // or whatever you use
            ->exists();

        return response()->json(['paid' => $alreadyPaid]);
    }

}
