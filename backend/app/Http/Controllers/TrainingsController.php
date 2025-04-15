<?php

namespace App\Http\Controllers;

use App\Models\Trainings;
use App\Http\Requests\StoreTrainingsRequest;
use App\Http\Requests\UpdateTrainingsRequest;
use App\Http\Resources\TrainingsResource;

class TrainingsController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //it's not recommended to pass the entire list of data with Inertia
        $query = Trainings::query();
        //load the data here and pass it to render
        $trainings = $query->paginate(10)->onEachSide(1);

        return inertia("Trainings/Index", [
            "trainings" => TrainingsResource::collection($trainings),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
        return inertia("Trainings/CreateTrainings", [
            "word" => "nigga",
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreTrainingsRequest $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(Trainings $trainings)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Trainings $trainings)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateTrainingsRequest $request, Trainings $trainings)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Trainings $trainings)
    {
        //
    }
}
