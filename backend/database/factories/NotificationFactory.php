<?php

namespace Database\Factories;

use App\Models\Notification;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class NotificationFactory extends Factory
{
    protected $model = Notification::class;

    public function definition()
    {
        return [
            'user_id' => User::factory(),
            'title' => $this->faker->sentence(3),
            'message' => $this->faker->paragraph(),
            'notification_type' => $this->faker->randomElement(['info', 'alert', 'reminder']),
            'created_date' => now(),
            'is_read' => false,
            'read_date' => null,
            'expiry_date' => now()->addDays(7),
            'action_url' => $this->faker->url(),
            'priority_level' => 'medium'
        ];
    }
}