<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\SystemLog;
use App\Models\User;

class SystemLogSeeder extends Seeder
{
    public function run()
    {
        $users = User::all();

        foreach ($users as $user) {
            SystemLog::factory()->count(2)->create([
                'user_id' => $user->id
            ]);
        }
    }
}
