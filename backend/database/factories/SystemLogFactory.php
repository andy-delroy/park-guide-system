<?php

namespace Database\Factories;

use App\Models\SystemLog;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class SystemLogFactory extends Factory
{
    protected $model = SystemLog::class;

    public function definition()
    {
        return [
            'user_id' => User::factory(),
            'action' => 'viewed_dashboard',
            'action_timestamp' => now(),
            'ip_address' => $this->faker->ipv4(),
            'user_agent' => $this->faker->userAgent(),
            'action_details' => 'Accessed main dashboard',
            'status' => 'success',
            'affected_entity_type' => 'dashboard',
            'affected_entity_id' => null
        ];
    }
}
