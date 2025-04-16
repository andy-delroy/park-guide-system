<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Carbon;

class TrainingsResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        // return parent::toArray($request);
        return [
            'id' => $this->id,
            'title' => $this->title,
            'description' => $this->description,
            'start_date' =>  (new Carbon($this->start_date))->format('Y-m-d'),
            'end_date' => (new Carbon($this->end_date))->format('Y-m-d'),
            'location' => $this->location,
            'capacity' => $this->capacity,
        ];
    }
}
