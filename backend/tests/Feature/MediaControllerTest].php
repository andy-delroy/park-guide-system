<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\Media;

class MediaControllerTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function it_can_list_all_media()
    {
        Media::factory()->create([
            'park_id' => 1,
            'type' => 'image',
            'url' => 'https://example.com/sample-image.jpg',
            'caption' => 'A beautiful park image',
        ]);

        $response = $this->getJson('/api/media');

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'data' => [
                         '*' => ['id', 'park_id', 'type', 'url', 'caption', 'created_at', 'updated_at']
                     ]
                 ]);
    }
}