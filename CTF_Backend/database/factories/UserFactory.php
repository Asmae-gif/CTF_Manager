<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class UserFactory extends Factory
{
    protected $model = User::class;

    public function definition(): array
    {
        return [
            'username'           => fake()->unique()->userName(),
            'fullname'           => fake()->name(),
            'email'              => fake()->unique()->safeEmail(),
            'email_verified_at'  => now(),                          // ✅ reset password
            'password'           => 'Password@123',                 // ✅ hashé via cast
            'remember_token'     => Str::random(10),                // ✅ "se souvenir"
            'avatar'             => null,
            'bio'                => fake()->sentence(),
            'country'            => fake()->countryCode(),
            'type'               => User::TYPE_PARTICIPANT,
            'score'              => fake()->numberBetween(0, 4999),
            'skills'             => fake()->randomElements(
                                        ['web', 'crypto', 'forensics', 'pwn', 'reverse', 'osint'],
                                        fake()->numberBetween(1, 3)
                                    ),
            'is_active'          => true,
        ];
    }

    // ─────────────────────────────────────────
    // States
    // ─────────────────────────────────────────
    public function admin(): static
    {
        return $this->state(fn() => [
            'type'  => User::TYPE_ADMIN,
            'score' => 0,
        ]);
    }

    public function teamLeader(): static
    {
        return $this->state(fn() => [
            'type'  => User::TYPE_TEAM_LEADER,
            'score' => fake()->numberBetween(500, 4999),
        ]);
    }

    public function participant(): static
    {
        return $this->state(fn() => [
            'type'  => User::TYPE_PARTICIPANT,
            'score' => fake()->numberBetween(0, 4999),
        ]);
    }

    public function inactive(): static
    {
        return $this->state(fn() => [
            'is_active' => false,
        ]);
    }

    public function elite(): static
    {
        return $this->state(fn() => [
            'score' => fake()->numberBetween(5000, 9999),
        ]);
    }

    public function unverified(): static
    {
        return $this->state(fn() => [
            'email_verified_at' => null,
        ]);
    }
}
