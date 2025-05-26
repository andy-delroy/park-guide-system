<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('guide_certifications', function (Blueprint $table) {
            // Drop the foreign key and column for program_id
            $table->dropForeign(['program_id']);
            $table->dropColumn('program_id');

            // Add the new course_id column and foreign key
            $table->unsignedBigInteger('course_id')->nullable()->after('guide_id');
            $table->foreign('course_id')->references('id')->on('courses')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::table('guide_certifications', function (Blueprint $table) {
            // Rollback: drop the course_id column
            $table->dropForeign(['course_id']);
            $table->dropColumn('course_id');

            // Restore program_id column and foreign key
            $table->unsignedBigInteger('program_id')->nullable()->after('guide_id');
            $table->foreign('program_id')->references('id')->on('training_programs')->onDelete('set null');
        });
    }
};
