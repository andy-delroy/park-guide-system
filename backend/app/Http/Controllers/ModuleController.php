<?php

namespace App\Http\Controllers;

use App\Models\Module;
use App\Models\Course;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ModuleController extends Controller
{
    public function index(Course $course)
    {
        return Inertia::render('Modules/Index', [
            'course' => $course->loadCount('modules'),
            'modules' => Module::where('course_id', $course->id)
                ->with('resources')
                ->orderBy('position')
                ->get()
        ]);
    }

    public function create(Course $course)
    {
        return Inertia::render('Modules/Create', ['course' => $course]);
    }

    public function show(Course $course, Module $module)
    {
        $module->load('resources');
    
        return Inertia::render('Modules/Show', [
            'course' => $course,
            'module' => $module,
        ]);
    }

    public function store(Request $request, $courseId)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'material_type' => 'required|string',
            'resources' => 'array',
            'resources.*.title' => 'required|string|max:255',
            'resources.*.type' => 'required|string',
            'resources.*.url' => 'nullable|url',
            'resources.*.file' => 'nullable|file|max:20480', // 20MB
        ]);

        $module = Module::create([
            'course_id' => $courseId,
            'title' => $request->title,
            'description' => $request->description,
            'material_type' => $request->material_type,
        ]);

        if (is_array($request->resources)) {
            foreach ($request->resources as $res) {
                $resourceUrl = null;
        
                if ($res['type'] === 'file') {
                    if (isset($files[$index]['file'])) {
                        $url = $files[$index]['file']->store('resources', 'public');
                    } elseif (isset($res['url'])) {
                        $url = $res['url'];
                    }
                }
        
                $module->resources()->create([
                    'title' => $res['title'],
                    'type' => $res['type'],
                    'url' => $resourceUrl,
                ]);
            }
        }

        return redirect()->route('courses.modules.index', $courseId)->with('success', 'Module created.');
    }

    public function edit(Course $course, Module $module)
    {
        if (!in_array(auth()->user()->role_name, ['admin', 'superadmin'])) {
            abort(403, 'Only admins can edit modules.');
        }
    
        $module->load('resources');
    
        return Inertia::render('Modules/Edit', compact('course', 'module'));
    }

    public function update(Request $request, Course $course, Module $module)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'material_type' => 'required|string|in:Video,Document,Quiz,Assignment,Reading,Interactive,Other',
            'resources' => 'nullable|array',
            'resources.*.title' => 'required|string|max:255',
            'resources.*.type' => 'required|string|in:link,file',
            'resources.*.url' => 'nullable|string', // validated below
            'resources.*.file' => 'nullable|file|mimes:pdf,doc,docx,mp4|max:20480',
        ]);

        DB::transaction(function () use ($request, $module, $validated) {

            $module->forceFill([
                'title' => $validated['title'],
                'description' => $validated['description'],
                'material_type' => $validated['material_type'],
            ])->save();

            $module->resources()->delete();

            $resources = $validated['resources'] ?? [];

            foreach ($resources as $index => $res) {
                $url = null;

                if ($res['type'] === 'link') {
                    $url = $res['url'] ?? null;
                } elseif ($res['type'] === 'file') {
                    $fileInputName = "resources.$index.file";
                    if ($request->hasFile($fileInputName)) {
                        $file = $request->file($fileInputName);
                        $url = $file->store('resources', 'public');
                    } elseif (!empty($res['url'])) {
                        $url = $res['url']; 
                    }
                }

                $module->resources()->create([
                    'title' => $res['title'],
                    'type' => $res['type'],
                    'url' => $url,
                ]);
            }
        });

        return redirect()
            ->route('courses.modules.index', $course->id)
            ->with('success', 'Module updated successfully.');
    }


    public function reorder(Request $request, Course $course)
    {
        $request->validate([
            'modules' => 'required|array',
            'modules.*.id' => 'required|integer|exists:modules,id',
            'modules.*.position' => 'required|integer',
        ]);
    
        foreach ($request->modules as $mod) {
            $module = Module::find($mod['id']);
            if ($module && $module->course_id === $course->id) {
                $module->position = $mod['position'];
                $module->save();
            }
        }
    
        return response()->json(['status' => 'ok']);
    }

    public function destroy(Course $course, Module $module)
    {
        if (!in_array(auth()->user()->role_name, ['admin', 'superadmin'])) {
            return response()->json(['error' => 'Only admins can delete modules.'], 403);
        }

        $module->delete();

        return response()->json(['message' => 'Module deleted']);
    }
}