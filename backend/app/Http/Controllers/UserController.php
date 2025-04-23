<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Validator;

class UserController extends Controller
{
    /**
     * Fetch all users with role_id = 2 (guides).
     */
    public function fetchGuides()
    {
        $guides = User::where('role_id', 2)->get();

        return response()->json($guides);
    }

    /**
     * Fetch a specific guide by username.
     */
    public function getGuide($username)
    {
        $guide = User::where('username', $username)
            ->where('role_id', 2) // Ensure the user is a guide
            ->first();

        if (!$guide) {
            return response()->json(['message' => 'Guide not found'], 404);
        }

        return response()->json(['guide' => $guide]);
    }

    public function getProfile(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        return response()->json([
            'user' => $user,
        ]);
    }

    public function updateProfile(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $validator = Validator::make($request->all(), [
            'username' => 'string|max:255|unique:users,username,' . $user->id,
            'email' => 'email|max:255|unique:users,email,' . $user->id,
            'phone_number' => 'nullable|string|max:20',
            'full_name' => 'nullable|string|max:255',
            'date_of_birth' => 'nullable|date',
            'gender' => 'nullable|string|in:male,female,other',
            'address' => 'nullable|string',
            'profile_image' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
            'identification_number' => 'nullable|string|max:50',
            'emergency_contact' => 'nullable|string|max:255',
            'biography' => 'nullable|string',
            'languages_spoken' => 'nullable|string',
            'years_of_experience' => 'nullable|integer|min:0',
            'specializations' => 'nullable|string',
            'employment_status' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        // Handle profile image upload
        if ($request->hasFile('profile_image')) {
            $file = $request->file('profile_image');
            $filename = uniqid('profile_') . '.' . $file->getClientOriginalExtension();
            $file->move(public_path('mobile/profile'), $filename);

            // Save full URL or relative path
            $user->profile_image_url = url('mobile/profile/' . $filename);
        }

        // Only update fields that are present in the request
        $user->fill($request->only([
            'username',
            'email',
            'phone_number',
            'full_name',
            'date_of_birth',
            'gender',
            'address',
            'identification_number',
            'emergency_contact',
            'biography',
            'languages_spoken',
            'years_of_experience',
            'specializations',
            'employment_status',
        ]));

        $user->save();

        return response()->json([
            'message' => 'Profile updated successfully.',
            'user' => $user,
        ]);
    }

}
