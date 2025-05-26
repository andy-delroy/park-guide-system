<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use App\Models\User;
use App\Models\MentorMentee;
use App\Models\Discussion;

class MentorMenteeController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        $guides = User::where('role_id', 2)->get(['id', 'full_name']);

        // Find assignment for current user (as mentor or mentee)
        $assignment = \App\Models\MentorMentee::where('mentor_id', $user->id)
            ->orWhere('mentee_id', $user->id)
            ->first();

        // Only mentors see discussions
        $discussions = [];
        if ($assignment && $assignment->mentor_id == $user->id) {
            $discussions = \App\Models\Discussion::where('mentor_id', $user->id)->latest()->get();
        }

        return Inertia::render('MentorMentee/Index', [
            'guides' => $guides,
            'assignment' => $assignment,
            'discussions' => $discussions,
            'auth' => [
                'user' => $user,
            ],
        ]);
    }

    public function assign(Request $request)
    {
        \Log::info('Assign request received', $request->all());
        $validated = $request->validate([
            'mentor_id' => 'required|exists:users,id|different:mentee_id',
            'mentee_id' => 'required|exists:users,id',
        ]);

        // This will update if mentee_id exists, or create if not
        \App\Models\MentorMentee::updateOrCreate(
            ['mentee_id' => $validated['mentee_id']],
            [
                'mentor_id' => $validated['mentor_id'],
            ]
        );
        
        return redirect()->route('mentormentee.index')->with('success', 'Mentor assigned successfully!');
    }

    public function askQuestion(Request $request)
    {
        $request->validate([
            'message' => 'required|string|max:2000',
        ]);

        $mentee_id = auth()->id();
        $assignment = MentorMentee::where('mentee_id', $mentee_id)->first();

        if (!$assignment) {
            return back()->withErrors(['error' => 'No mentor assigned.']);
        }

        Discussion::create([
            'mentor_id' => $assignment->mentor_id,
            'mentee_id' => $mentee_id,
            'user_id' => $mentee_id,
            'message' => $request->message,
        ]);

        return back()->with('success', 'Question sent to your mentor!');
    }
}
