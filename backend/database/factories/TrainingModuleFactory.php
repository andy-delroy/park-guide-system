<?php

namespace Database\Factories;

use App\Models\TrainingModule;
use App\Models\TrainingProgram;
use Illuminate\Database\Eloquent\Factories\Factory;

class TrainingModuleFactory extends Factory
{
    protected $model = TrainingModule::class;

    public function definition()
    {
        return [
            // Linking the module to a specific training program
            'program_id' => TrainingProgram::factory(),

            // Realistic module names related to Sarawak Forestry and wildlife
            'module_name' => $this->faker->randomElement([
                'Introduction to Sarawak’s Rainforest Ecology',
                'Understanding Orangutan Conservation Efforts',
                'Wild Plant Identification in Sarawak',
                'Orchid Diversity in Sarawak Forests',
                'Ecological Importance of Borneo’s Rainforest',
                'Sustainable Forestry Practices in Sarawak',
                'Wildlife Tracking and Monitoring Techniques',
                'Forest Flora and Fauna of Sarawak',
                'Orchid Conservation: Protecting Sarawak’s Rich Heritage',
                'Introduction to Tropical Plants in Sarawak',
            ]),

            // Realistic and meaningful descriptions related to each training module
            'description' => $this->faker->paragraph(3),  // Multiple meaningful sentences

            // Typical duration for each module in hours (e.g., 2-5 hours)
            'duration_hours' => $this->faker->numberBetween(2, 5),

            // Sequence number to order the modules (e.g., module order)
            'sequence_number' => $this->faker->numberBetween(1, 10),

            // Learning objectives that explain the focus of the module
            'learning_objectives' => implode(' ', $this->faker->paragraphs(2)),  // 2 paragraphs explaining objectives

            // Realistic pass threshold (e.g., 60% to 100%)
            'pass_threshold' => $this->faker->randomFloat(2, 0.6, 1.0),  // Random float between 0.6 (60%) and 1.0 (100%)

            // Content type, realistic options for training formats (e.g., video, interactive)
            'content_type' => $this->faker->randomElement(['video', 'text', 'quiz', 'interactive'])
        ];
    }
}
