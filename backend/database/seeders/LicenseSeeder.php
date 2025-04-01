<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\License;
use App\Models\User;
use App\Models\Park;

class LicenseSeeder extends Seeder
{
    public function run()
    {
        $guides = User::where('role_id', 2)->get();
        $issuers = User::where('role_id', 1)->get();
        $parks = Park::all();

        foreach ($guides as $guide) {
            License::factory()->create([
                'guide_id' => $guide->id,
                'issued_by' => $issuers->random()->id,
                'park_id' => $parks->random()->id
            ]);
        }
    }
}
