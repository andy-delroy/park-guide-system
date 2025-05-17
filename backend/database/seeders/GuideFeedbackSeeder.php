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

            $feedbackSamples = [
        'communication' => [
            'The guide communicated very clearly and confidently.',
            'Excellent explanation throughout the tour.',
            'Could improve clarity in speech and responses to questions.',
            'Had difficulty explaining complex topics.'
        ],
        'knowledge' => [
            'Very knowledgeable about local flora and fauna.',
            'Impressed with the depth of knowledge.',
            'Struggled to answer some basic questions.',
            'Needs more training on park history and wildlife.'
        ],
        'safety' => [
            'Ensured we followed safety protocols at all times.',
            'Felt secure and informed during the hike.',
            'Didn’t provide enough safety instructions.',
            'Needs to focus more on group awareness and safety.'
        ],
        'experience' => [
            'The tour was fun and well-paced.',
            'Very engaging and enjoyable experience.',
            'Felt a bit rushed and unorganized.',
            'Could improve on storytelling to enhance experience.'
        ],
        'punctuality' => [
            'Arrived on time and started the tour promptly.',
            'Very respectful of everyone’s time.',
            'Guide arrived 15 minutes late.',
            'Tour was delayed unnecessarily.'
        ],
        'friendliness' => [
            'The guide was very friendly and approachable.',
            'Made everyone feel welcomed.',
            'Was a bit distant and unengaging.',
            'Needs to work on interpersonal skills.'
        ]
    ];

    foreach ($guides as $guide) {
        for ($i = 0; $i < 2; $i++) {
            $visitor = $visitors->random();
            $park = $parks->random();
            $categories = Arr::random(array_keys($feedbackSamples), rand(1, 2));

            // Collect category-based comments
            $comments = collect($categories)
                ->map(function ($cat) use ($feedbackSamples) {
                    return Arr::random($feedbackSamples[$cat]);
                })
                ->implode(' ');

            $rating = rand(1, 5);

            GuideFeedback::create([
                'guide_id' => $guide->id,
                'visitor_id' => $visitor->id,
                'park_id' => $park->id,
                'tour_date' => now()->subDays(rand(1, 90)),
                'rating' => $rating,
                'comments' => $comments,
                'feedback_categories' => json_encode($categories),
                'submitted_date' => now(),
                'is_public' => fake()->boolean(),
                'status' => 'approved',
            ]);
        }
    }
}
}

