<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Trainings>
 */
class TrainingsFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        // Realistic start and end dates for training programs
        $startDate = fake()->dateTimeBetween('now', '+1 year');
        $endDate = fake()->dateTimeBetween($startDate, '+1 year');

        // Return realistic training program data
        return [
            // Meaningful title for a training program
            'title' => fake()->randomElement([
                'Introduction to Sarawak’s Rainforest Ecology',
                'Orangutan Conservation in Borneo',
                'Identifying Sarawak’s Wild Plants',
                'Orchid Conservation: Protecting Sarawak’s Flora',
                'Sustainable Forestry Practices in Sarawak',
                'Wildlife Tracking and Monitoring Techniques',
                'Borneo’s Forest Flora and Fauna',
                'Introduction to Tropical Plants in Sarawak',
                'Rainforest Biodiversity: A Field Guide',
                'Understanding Sarawak’s Endangered Species'
            ]),

            // Detailed description of the training
            'description' => fake()->paragraph(3),  // Using 3 meaningful paragraphs for training descriptions

            // Realistic start and end date for the training program
            'start_date' => $startDate,
            'end_date' => $endDate,

            // Realistic training location, assuming various conservation sites in Sarawak
            'location' => fake()->randomElement([
                'Sarawak Rainforest Conservation Center',
                'Borneo Orangutan Sanctuary',
                'Gunung Mulu National Park',
                'Sarawak Forestry Training Institute',
                'Semenggoh Wildlife Rehabilitation Center',
                'Bako National Park',
                'Mount Santubong Nature Reserve',
                'Mulu National Park - Forest Field Station',
                'Sarawak Orchid Garden',
                'Borneo Rainforest Discovery Center'
            ]),

            // Realistic capacity for a training session, which could range from 10 to 100 participants
            'capacity' => fake()->numberBetween(10, 100),
        ];
    }
}
