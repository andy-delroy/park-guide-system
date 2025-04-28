<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::create('training_user', function (Blueprint $table) {
            $table->id();

            $table->foreignId('training_id')
                  ->constrained('trainings')
                  ->onDelete('cascade');

            $table->foreignId('user_id') // assuming a registered guide is a user
                  ->constrained('users')
                  ->onDelete('cascade');

            $table->timestamps();

            $table->unique(['training_id', 'user_id']); // prevent duplicate enrollments
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down()
    {
        Schema::dropIfExists('training_user');
    }
};
