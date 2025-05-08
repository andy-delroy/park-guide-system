<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateModuleGroupsTable extends Migration
{
    public function up()
    {
        Schema::create('module_groups', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('course_id');
            $table->string('name');
            $table->timestamps();

            $table->foreign('course_id')->references('id')->on('courses')->onDelete('cascade');
        });

        Schema::table('modules', function (Blueprint $table) {
            $table->unsignedBigInteger('group_id')->nullable()->after('course_id');
            $table->foreign('group_id')->references('id')->on('module_groups')->onDelete('set null');
        });
    }

    public function down()
    {
        Schema::table('modules', function (Blueprint $table) {
            $table->dropForeign(['group_id']);
            $table->dropColumn('group_id');
        });

        Schema::dropIfExists('module_groups');
    }
}
