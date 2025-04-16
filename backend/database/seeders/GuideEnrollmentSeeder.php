<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\GuideEnrollment;
use App\Models\User;
use App\Models\TrainingSession;

class GuideEnrollmentSeeder extends Seeder
{
    public function run()
    {
        $guides = User::where('role_id', 2)->get();
        $sessions = TrainingSession::all()->pluck('id')->toArray();

        foreach ($guides as $guide) {
            $usedSessions = collect($sessions)->shuffle()->take(2);
            foreach ($usedSessions as $sessionId) {
                GuideEnrollment::factory()->create([
                    'guide_id' => $guide->id,
                    'session_id' => $sessionId,
                ]);
            }
        }
    }
}
