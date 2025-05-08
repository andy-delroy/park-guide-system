<?php

namespace App\Http\Controllers;

use App\Models\Module;
use App\Models\Course;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Models\ModuleGroup;

class ModuleController extends Controller
{
    public function index(Course $course)
    {
        return Inertia::render('Modules/Index', [
            'course' => $course->loadCount('modules'),
            'modules' => Module::where('course_id', $course->id)
                ->with(['resources', 'group'])
                ->orderBy('position')
                ->get(),
            'groups' => ModuleGroup::where('course_id', $course->id)->orderBy('id')->get(),
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
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'material_type' => 'required|string|in:Video,Document,Quiz,Assignment,Reading,Interactive,Other',
            'resources' => 'nullable|array',
            'resources.*.title' => 'required|string|max:255',
            'resources.*.type' => 'required|string|in:link,file',
            'resources.*.url' => 'nullable|url',
            'resources.*.file' => 'nullable|file|mimes:pdf,doc,docx,mp4|max:20480',
        ]);

        try {
            $module = DB::transaction(function () use ($request, $courseId, $validated) {
                $module = Module::create([
                    'course_id' => $courseId,
                    'title' => $validated['title'],
                    'description' => $validated['description'],
                    'material_type' => $validated['material_type'],
                ]);

                foreach ($validated['resources'] ?? [] as $index => $res) {
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

                    $module->resources()->create([
                        'title' => $res['title'],
                        'type' => $res['type'],
                        'url' => $url,
                    ]);
                }

                return $module;
            });
        } catch (\Exception $e) {
            Log::error('Module creation failed', [
                'course_id' => $courseId,
                'error' => $e->getMessage(),
            ]);
            throw $e;
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
            'resources.*.url' => 'nullable|url',
            'resources.*.file' => 'nullable|file|mimes:pdf,doc,docx,mp4|max:20480',
            'resources.*.id' => 'nullable|integer|exists:module_resources,id'
        ]);

        try {
            DB::transaction(function () use ($request, $module, $validated) {
                $module->update([
                    'title' => $validated['title'],
                    'description' => $validated['description'],
                    'material_type' => $validated['material_type'],
                ]);

                $existingResources = $module->resources()->pluck('id')->toArray();
                $submittedResourceIds = array_filter(array_column($validated['resources'] ?? [], 'id'));

                $module->resources()->whereNotIn('id', $submittedResourceIds)->delete();

                foreach ($validated['resources'] ?? [] as $index => $res) {
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

                    $data = [
                        'title' => $res['title'],
                        'type' => $res['type'],
                        'url' => $url,
                    ];

                    if (isset($res['id']) && in_array($res['id'], $existingResources)) {
                        $module->resources()->find($res['id'])->update($data);
                    } else {
                        $module->resources()->create($data);
                    }
                }
            });
        } catch (\Exception $e) {
            Log::error('Module update failed', [
                'module_id' => $module->id,
                'error' => $e->getMessage(),
            ]);
            throw $e;
        }

        return redirect()->route('courses.modules.index', $course->id)->with('success', 'Module updated successfully.');
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
        abort(403, 'Only admins can delete modules.');
    }

    if ($module->course_id !== $course->id) {
        abort(404, 'Module does not belong to this course.');
    }

    // Optional: delete related resources (if not handled by cascade)
    $module->resources()->delete();

    $module->delete();

    return redirect()
        ->route('courses.modules.index', $course->id)
        ->with('success', 'Module deleted successfully.');
}

    public function assignGroup(Request $request, Course $course, Module $module)
    {
        $request->validate([
            'group_id' => 'nullable|integer|exists:module_groups,id',
        ]);

        if ($module->course_id !== $course->id) {
            abort(403);
        }

        $groupId = $request->group_id !== null ? (int) $request->group_id : null;

        Log::info('Assigning group to module', [
            'module_id' => $module->id,
            'old_group_id' => $module->group_id,
            'new_group_id' => $groupId,
        ]);

        $module->group_id = $groupId;
        $module->save();

        return response()->json(['status' => 'group updated']);
    }

    public function createGroup(Request $request, Course $course)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $group = ModuleGroup::create([
            'course_id' => $course->id,
            'name' => $validated['name'],
        ]);

        return response()->json($group);
    }
}
