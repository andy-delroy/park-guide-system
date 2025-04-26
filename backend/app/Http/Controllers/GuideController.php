<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use App\Http\Resources\UserResource;

class GuideController extends Controller
{
    public function __construct()
    {
        // Restrict all methods to admins only
        //you can apply middlewares like this 
        // $this->middleware('auth');
        // $this->middleware('role:admin');
    }
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $guides = User::with('role')
            ->where('role_id', 2)
            ->select('id', 'full_name', 'email', 'role_id') // Only safe fields
            ->get();

        if ($request->expectsJson()) {
            return UserResource::collection($guides);
        }

        return Inertia::render('Guides/Index', [
            'guides' => UserResource::collection($guides)->response()->getData(),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    // Show the form for creating a new guide
    public function create()
    {
        return Inertia::render('Guides/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'username' => 'required|string|unique:users',
            'email' => 'required|email|unique:users',
            'password' => 'required|string|min:6',
            'full_name' => 'required|string',
            'phone_number' => 'required|string',
            'years_of_experience' => 'required|integer|min:0',
            'specializations' => 'required|string',
        ]);

        $guide = User::create([
            'username' => $validated['username'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'full_name' => $validated['full_name'],
            'phone_number' => $validated['phone_number'],
            'years_of_experience' => $validated['years_of_experience'],
            'specializations' => $validated['specializations'],
            'role_id' => 2, // Hardcode guide role
            'status' => 'active',
            'registration_date' => now(),
        ]);

        return redirect()->route('guides.index')
            ->with('success', 'Guide created successfully');
    }

    /**
     * Display the specified resource.
     */
    // Show a single guide (optional for Inertia, but included for completeness)
    public function show(Request $request, $id)
    {
        $guide = User::with('role')
            ->where('role_id', 2)
            ->select('id', 'full_name', 'email', 'phone_number', 'profile_image_url', 'role_id', 'biography', 'languages_spoken', 'years_of_experience', 'specializations')
            ->findOrFail($id);
        if ($request->expectsJson()) {
            return new UserResource($guide);
        }
        return Inertia::render('Guides/Show', [
            'guide' => new UserResource($guide),
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    //form for editing a guide
    public function edit($id)
    {
        $guide = User::where('role_id', 2)->findOrFail($id);

        return Inertia::render('Guides/Edit', [
            'guide' => $guide,
        ]);
    }

    // Update an existing guide
    public function update(Request $request, $id)
    {
        $guide = User::where('role_id', 2)->findOrFail($id);

        $validated = $request->validate([
            'username' => 'required|string|unique:users,username,' . $id,
            'email' => 'required|email|unique:users,email,' . $id,
            'password' => 'nullable|string|min:6',
            'full_name' => 'required|string',
            'phone_number' => 'required|string',
            'years_of_experience' => 'required|integer|min:0',
            'specializations' => 'required|string',
        ]);

        $updateData = [
            'username' => $validated['username'],
            'email' => $validated['email'],
            'full_name' => $validated['full_name'],
            'phone_number' => $validated['phone_number'],
            'years_of_experience' => $validated['years_of_experience'],
            'specializations' => $validated['specializations'],
        ];

        if ($validated['password']) {
            $updateData['password'] = Hash::make($validated['password']);
        }

        $guide->update($updateData);

        return redirect()->route('guides.index')
            ->with('success', 'Guide updated successfully');
    }

    // Delete a guide
    public function destroy($id)
    {
        $guide = User::where('role_id', 2)->findOrFail($id);
        $guide->delete();

        return redirect()->route('guides.index')
            ->with('success', 'Guide deleted successfully');
    }
}
