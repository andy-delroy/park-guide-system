<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (!Schema::hasTable('media')) {
            Schema::create('media', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('park_id'); // Foreign key to parks table
                $table->string('type'); // 'image' or 'video'
                $table->string('url'); // URL of the media file
                $table->string('caption')->nullable(); // Optional caption for the media
                $table->timestamps();

                $table->foreign('park_id')->references('id')->on('parks')->onDelete('cascade');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('media');
    }
};
