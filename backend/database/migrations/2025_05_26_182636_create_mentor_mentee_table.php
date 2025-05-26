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
        Schema::create('mentor_mentee', function (Blueprint $table) {
            $table->id();
            $table->foreignId('mentor_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('mentee_id')->constrained('users')->onDelete('cascade');
            $table->text('message')->nullable(); // For storing a question or note
            $table->timestamps();

            $table->unique('mentee_id'); // Each mentee can have only one mentor
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('mentor_mentee');
    }
};
