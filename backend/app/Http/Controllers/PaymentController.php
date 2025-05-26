<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
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

        return back()->with('success', 'Payment submitted successfully.');
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
}
