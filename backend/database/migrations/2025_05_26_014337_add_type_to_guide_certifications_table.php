<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('guide_certifications', function (Blueprint $table) {
            $table->string('type')->nullable()->after('certification_name');
        });
    }

    public function down(): void
    {
        Schema::table('guide_certifications', function (Blueprint $table) {
            $table->dropColumn('type');
        });
    }
};

