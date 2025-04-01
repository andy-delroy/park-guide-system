<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\GuideFeedback;
use App\Models\User;
use App\Models\Park;
use Illuminate\Support\Arr;

class GuideFeedbackSeeder extends Seeder
{
    public function run()
    {
        $guides = User::where('role_id', 2)->get();
        $visitors = User::where('role_id', 3)->get();
        $parks = Park::all();

        foreach ($guides as $guide) {
            GuideFeedback::factory()->count(2)->create([
                'guide_id' => $guide->id,
                'visitor_id' => $visitors->random()->id,
                'park_id' => $parks->random()->id,
                'tour_date' => now()->subDays(rand(1, 90)),
                'rating' => rand(1, 5),
                'comments' => fake()->sentence(10),
                'feedback_categories' => json_encode(Arr::random([
                    ['communication', 'knowledge'],
                    ['safety', 'experience'],
                    ['punctuality', 'friendliness'],
                ])),
                'submitted_date' => now(),
                'is_public' => fake()->boolean(),
                'status' => 'pending',
            ]);
        }
    }
}
