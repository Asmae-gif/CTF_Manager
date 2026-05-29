<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('hints', function (Blueprint $table) {
            $table->id();
            $table->foreignId('challenge_id')
                  ->constrained()
                  ->cascadeOnDelete();

            $table->text('content');
            // Coût en points pour débloquer ce hint
            $table->unsignedInteger('cost')->default(0);
            // Ordre d'affichage des hints
            $table->unsignedTinyInteger('order')->default(1);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('hints');
    }
};