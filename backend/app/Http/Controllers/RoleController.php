<?php

namespace App\Http\Controllers;

use App\Models\Role;
use Illuminate\Http\Request;

class RoleController extends Controller
{
    // Function to get all roles from the 'roles' table
    public function getAllRoles()
    {
        // Retrieve all roles
        $roles = Role::all();

        // Return the roles as a JSON response (or you can use a view if needed)
        return response()->json($roles);
    }
}
