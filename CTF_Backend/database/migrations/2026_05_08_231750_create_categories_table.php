<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('categories', function (Blueprint $table) {
            $table->id();
            $table->string('name');          // ex: Web, Crypto, Pwn
            $table->string('slug')->unique(); // ex: web, crypto, pwn
            $table->string('icon')->nullable(); // ex: 🌐, 🔐, 💥
            $table->string('color')->nullable(); // ex: #00CC66
            $table->text('description')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('categories');
    }
};