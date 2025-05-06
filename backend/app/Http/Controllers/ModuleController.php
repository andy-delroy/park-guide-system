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
        // Validate incoming data
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'material_type' => 'required|string|in:Video,Document,Quiz,Assignment,Reading,Interactive,Other',
            'resources' => 'nullable|array',
            'resources.*.title' => 'required|string|max:255',
            'resources.*.type' => 'required|string|in:link,file',
            'resources.*.url' => 'nullable|url',
            'resources.*.file' => 'nullable|file|mimes:pdf,doc,docx,mp4|max:20480', // 20MB
        ]);

        // Log incoming data
        Log::info('Store request data:', [
            'course_id' => $courseId,
            'validated' => $validated,
            'files' => $request->file('resources') ?? [],
        ]);

        try {
            $module = DB::transaction(function () use ($request, $courseId, $validated) {
                // Create module
                $module = Module::create([
                    'course_id' => $courseId,
                    'title' => $validated['title'],
                    'description' => $validated['description'],
                    'material_type' => $validated['material_type'],
                ]);

                Log::info('Module created:', [
                    'module_id' => $module->id,
                    'attributes' => $module->getAttributes(),
                ]);

                // Handle resources
                $resources = $validated['resources'] ?? [];
                foreach ($resources as $index => $res) {
                    $url = null;

                    if ($res['type'] === 'link') {
                        $url = $res['url'] ?? null;
                    } elseif ($res['type'] === 'file') {
                        if ($file = $request->file("resources.{$index}.file")) {
                            $url = $file->store('resources', 'public');
                        } elseif (isset($res['url'])) {
                            $url = $res['url'];
                        }
                    }

                    $resource = $module->resources()->create([
                        'title' => $res['title'],
                        'type' => $res['type'],
                        'url' => $url,
                    ]);

                    Log::info('Resource created:', [
                        'resource_id' => $resource->id,
                        'title' => $res['title'],
                        'type' => $res['type'],
                        'url' => $url,
                    ]);
                }

                return $module;
            });

            Log::info('Module creation completed successfully:', ['module_id' => $module->id]);
        } catch (\Exception $e) {
            Log::error('Module creation failed:', [
                'course_id' => $courseId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            throw $e; // Rethrow for debugging
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
        // Validate incoming data
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'material_type' => 'required|string|in:Video,Document,Quiz,Assignment,Reading,Interactive,Other',
            'resources' => 'nullable|array',
            'resources.*.title' => 'required|string|max:255',
            'resources.*.type' => 'required|string|in:link,file',
            'resources.*.url' => 'nullable|url',
            'resources.*.file' => 'nullable|file|mimes:pdf,doc,docx,mp4|max:20480',
            'resources.*.id' => 'nullable|integer|exists:resources,id',
        ]);

        // Log incoming data
        Log::info('Update request data:', [
            'module_id' => $module->id,
            'validated' => $validated,
            'files' => $request->file('resources') ?? [],
            'raw_input' => $request->all(),
        ]);

        try {
            DB::transaction(function () use ($request, $module, $validated) {
                // Log current module state
                Log::info('Module before update:', [
                    'module_id' => $module->id,
                    'attributes' => $module->getAttributes(),
                ]);

                // Update module
                $module->title = $validated['title'];
                $module->description = $validated['description'];
                $module->material_type = $validated['material_type'];
                $updated = $module->save();

                Log::info('Module update attempt:', [
                    'module_id' => $module->id,
                    'updated' => $updated,
                    'changes' => $module->getChanges(),
                    'new_attributes' => $module->getAttributes(),
                ]);

                // Get existing resources
                $existingResources = $module->resources()->pluck('id')->toArray();
                $submittedResourceIds = array_filter(array_column($validated['resources'] ?? [], 'id'));

                // Delete resources not in the submitted list
                $module->resources()->whereNotIn('id', $submittedResourceIds)->delete();
                Log::info('Resources deleted:', [
                    'module_id' => $module->id,
                    'deleted_ids' => array_diff($existingResources, $submittedResourceIds),
                ]);

                // Update or create resources
                $resources = $validated['resources'] ?? [];
                foreach ($resources as $index => $res) {
                    $url = null;

                    if ($res['type'] === 'link') {
                        $url = $res['url'] ?? null;
                    } elseif ($res['type'] === 'file') {
                        if ($file = $request->file("resources.{$index}.file")) {
                            $url = $file->store('resources', 'public');
                        } elseif (isset($res['url'])) {
                            $url = $res['url'];
                        }
                    }

                    $resourceData = [
                        'title' => $res['title'],
                        'type' => $res['type'],
                        'url' => $url,
                    ];

                    if (isset($res['id']) && in_array($res['id'], $existingResources)) {
                        $resource = $module->resources()->find($res['id']);
                        $resource->update($resourceData);
                        Log::info('Resource updated:', [
                            'resource_id' => $res['id'],
                            'data' => $resourceData,
                        ]);
                    } else {
                        $resource = $module->resources()->create($resourceData);
                        Log::info('Resource created:', [
                            'resource_id' => $resource->id,
                            'data' => $resourceData,
                        ]);
                    }
                }

                // Log final module state
                $module->refresh();
                Log::info('Module after update:', [
                    'module_id' => $module->id,
                    'attributes' => $module->getAttributes(),
                    'resources' => $module->resources()->get()->toArray(),
                ]);
            });

            Log::info('Module update completed successfully:', ['module_id' => $module->id]);
        } catch (\Exception $e) {
            Log::error('Module update failed:', [
                'module_id' => $module->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            throw $e;
        }

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