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
        Schema::create('parks', function (Blueprint $table) {
            $table->id();
            $table->string('park_name');
            $table->text('location')->nullable();
            $table->text('description')->nullable();
            $table->date('established_date')->nullable();
            $table->decimal('area_size', 10, 2)->nullable();
            $table->text('contact_info')->nullable();
            $table->text('operating_hours')->nullable();
            $table->string('website_url')->nullable();
            $table->json('coordinates')->nullable();
            $table->string('status', 20)->default('open');
            $table->timestamps();
        });        
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('parks');
    }
};
