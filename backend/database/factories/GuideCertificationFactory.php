<?php

namespace Database\Factories;

use App\Models\GuideCertification;
use App\Models\TrainingProgram;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class GuideCertificationFactory extends Factory
{
    protected $model = GuideCertification::class;

    public function definition()
    {
        $issueDate = $this->faker->dateTimeBetween('-1 year', 'now');
        return [
            'guide_id' => User::factory(),
            'certification_name' => $this->faker->word() . ' Certificate',
            'description' => $this->faker->sentence(),
            'program_id' => TrainingProgram::factory(),
            'issue_date' => $issueDate,
            'expiry_date' => (clone $issueDate)->modify('+1 year'),
            'certificate_number' => strtoupper(Str::random(10)),
            'issued_by' => User::factory(),
            'renewal_count' => 0,
            'status' => 'active',
            'certificate_file_url' => $this->faker->url(),
            'verification_code' => strtoupper(Str::random(6)),
            'requirements_description' => 'Completed core training modules',
            'validity_period_months' => 12,
            'renewal_requirements' => 'Retake safety module'
        ];
    }
}