<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Course;
use Illuminate\Support\Str;

class CourseSeeder extends Seeder
{
    public function run(): void
    {
        $courses = [
            'Nature Guide Training',
            'Wildlife Conservation Basics',
            'First Aid for Tour Guides',
            'Effective Communication in Ecotourism',
            'Advanced Navigation & Orienteering',
            'Local Flora and Fauna Identification',
            'Conflict Management in the Field',
            'Cultural Awareness and Ethics',
            'Sustainable Tourism Practices',
            'Tour Planning & Guest Safety',
        ];

        foreach ($courses as $title) {
            Course::create([
                'title' => $title,
                'description' => fake()->paragraph(3),
                'thumbnail' => 'https://via.placeholder.com/640x480.png?text=' . Str::slug($title),
            ]);
        }
    }
}
