<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class MakeCertificationFieldsNullable extends Migration
{
    public function up()
    {
        Schema::table('guide_certifications', function (Blueprint $table) {
            $table->string('certification_name')->nullable()->change();
            $table->string('certificate_number')->nullable()->change();
        });
    }

    public function down()
    {
        Schema::table('guide_certifications', function (Blueprint $table) {
            $table->string('certification_name')->nullable(false)->change();
            $table->string('certificate_number')->nullable(false)->change();
        });
    }
}
