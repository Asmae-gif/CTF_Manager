<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('teams', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->string('slug')->unique();
            $table->string('invite_code')->unique();
            $table->text('description')->nullable();
            $table->string('avatar')->nullable();

            // Le chef d'équipe
            $table->foreignId('leader_id')
                  ->constrained('users')
                  ->cascadeOnDelete();

            // Compétition à laquelle l'équipe est inscrite (nullable)
            $table->foreignId('competition_id')
                  ->nullable()
                  ->constrained('competitions')
                  ->nullOnDelete();

            $table->unsignedBigInteger('score')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('teams');
    }
};
