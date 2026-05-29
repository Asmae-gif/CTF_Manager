<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('competition_team_results', function (Blueprint $table) {
            $table->id();
            $table->foreignId('competition_id')->constrained('competitions')->cascadeOnDelete();
            $table->foreignId('team_id')->constrained('teams')->cascadeOnDelete();
            $table->unsignedInteger('rank');
            $table->unsignedBigInteger('score')->default(0);
            $table->timestamp('last_solve_at')->nullable();
            $table->timestamps();

            $table->unique(['competition_id', 'team_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('competition_team_results');
    }
};
