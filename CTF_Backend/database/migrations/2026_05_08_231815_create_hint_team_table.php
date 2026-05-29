<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Table pivot : historique des hints utilisés par équipe
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('hint_team', function (Blueprint $table) {
            $table->id();
            $table->foreignId('hint_id')
                  ->constrained()
                  ->cascadeOnDelete();
            $table->foreignId('team_id')
                  ->constrained()
                  ->cascadeOnDelete();
            $table->timestamp('used_at')->useCurrent();

            // Une équipe ne peut utiliser le même hint qu'une fois
            $table->unique(['hint_id', 'team_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('hint_team');
    }
};