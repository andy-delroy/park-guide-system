<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\GuideCertification;
use App\Models\User;

class GuideCertificationSeeder extends Seeder
{
    public function run()
    {
        $guides = User::where('role_id', 2)->get();
        $issuers = User::where('role_id', 1)->get();

        foreach ($guides as $guide) {
            GuideCertification::factory()->create([
                'guide_id' => $guide->id,
                'issued_by' => $issuers->random()->id
            ]);
        }
    }
}
