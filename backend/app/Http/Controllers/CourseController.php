<?php

namespace App\Http\Controllers;

use App\Models\Course;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CourseController extends Controller
{
    public function index()
    {
        return Inertia::render('Courses/Index', [
            'courses' => Course::withCount('modules')->latest()->get(),
            'auth' => [
                'user' => auth()->user(),
            ],
        ]);
    }

    public function create()
    {
        return Inertia::render('Courses/Create');
    }

    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'thumbnail' => 'nullable|image|max:2048',
            'duration' => 'nullable|string|max:255',
        ]);

        $path = $request->file('thumbnail')?->store('thumbnails', 'public');

        Course::create([
            'title' => $request->title,
            'description' => $request->description,
            'thumbnail' => $path ? '/storage/' . $path : null,
            'duration' => $request->duration,
        ]);

        return redirect()->route('courses.index')->with('success', 'Course created.');
    }

    public function edit(Course $course)
    {
        return Inertia::render('Courses/Edit', [
            'course' => $course,
        ]);
    }

    public function update(Request $request, Course $course)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'thumbnail' => 'nullable|image|max:2048',
            'duration' => 'nullable|string|max:255',
        ]);

        $course->fill($request->only(['title', 'description', 'duration']));

        if ($request->hasFile('thumbnail')) {
            $path = $request->file('thumbnail')->store('thumbnails', 'public');
            $course->thumbnail = '/storage/' . $path;
        }

        $course->save();

        return redirect()->route('courses.index')->with('success', 'Course updated.');
    }

    public function destroy(Course $course)
    {
        $course->delete();

        return redirect()->route('courses.index')->with('success', 'Course deleted.');
    }
}
