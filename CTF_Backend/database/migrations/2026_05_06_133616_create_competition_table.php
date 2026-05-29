<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('competitions', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
        
            $table->enum('status', [
                'draft',
                'upcoming',
                'active',
                'ended'
            ])->default('draft');
        
            $table->dateTime('starts_at');
            $table->dateTime('ends_at');
        
            $table->integer('max_teams')->nullable();
            $table->integer('max_team_members')->default(5);
        
            $table->boolean('is_public')->default(true);
        
            $table->string('banner')->nullable();
        
            $table->foreignId('created_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();
        
            // NOUVELLES COLONNES
            $table->string('organizer_name')->nullable();
        
            $table->string('first_place_prize')->nullable();
        
            $table->string('second_place_prize')->nullable();
        
            $table->string('third_place_prize')->nullable();
        
            $table->timestamp('finalized_at')->nullable();
        
            $table->timestamps();
            $table->softDeletes();
        });
       
    }

    public function down(): void
    {
        Schema::dropIfExists('competitions');
    }
};
