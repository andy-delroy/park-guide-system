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
        Schema::create('media_libraries', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('media_type', 20);
            $table->string('file_url');
            $table->timestamp('upload_date')->useCurrent();
            $table->foreignId('uploaded_by')->constrained('users');
            $table->text('tags')->nullable();
            $table->foreignId('park_id')->nullable()->constrained('parks');
            $table->foreignId('species_id')->nullable()->constrained('species');
            $table->boolean('is_public')->default(false);
            $table->string('approval_status', 20)->default('pending');
            $table->timestamps(); 
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('media_libraries');
    }
};
