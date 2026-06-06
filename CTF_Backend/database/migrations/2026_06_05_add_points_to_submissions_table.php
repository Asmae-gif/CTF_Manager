<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('submissions', function (Blueprint $table) {
            if (!Schema::hasColumn('submissions', 'points')) {
                $table->unsignedInteger('points')->default(0)->after('is_correct');
            }
            if (!Schema::hasColumn('submissions', 'ip_address')) {
                $table->string('ip_address')->nullable()->after('points');
            }
        });
    }

    public function down(): void
    {
        Schema::table('submissions', function (Blueprint $table) {
            $table->dropColumn(['points', 'ip_address']);
        });
    }
};
