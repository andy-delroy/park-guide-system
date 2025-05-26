<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Carbon\Carbon;

class CertificationResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return[
        'id' => $this->id,
        'guide_id' => $this->guide_id,
        'course_id' => $this->course_id,
        'type' => $this->type,
        'certification_name' => $this->certification_name,
        'description' => $this->description,
        'issue_date' => Carbon::parse($this->issue_date)->format('Y-m-d'),
        'expiry_date' => $this->expiry_date ? Carbon::parse($this->expiry_date)->format('Y-m-d') : null,
        'certificate_number' => $this->certificate_number,
        'issued_by' => $this->issued_by,
        'renewal_count' => $this->renewal_count,
        'status' => $this->status,
        'certificate_file_url' => $this->certificate_file_url,
        'created_at' => Carbon::parse($this->created_at)->format('Y-m-d'),
        'updated_at' => Carbon::parse($this->updated_at)->format('Y-m-d'),
        'guide' => $this->whenLoaded('guide', function () {
            return [
                'id' => $this->guide->id,
                'full_name' => $this->guide->full_name,
            ];
        }),
        'issuer' => $this->whenLoaded('issuer', function () {
            return [
                'id' => $this->issuer->id,
                'full_name' => $this->issuer->full_name,
            ];
        }),
        ];
    }
}
