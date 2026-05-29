<?php

namespace Database\Factories;

use App\Models\Competition;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class CompetitionFactory extends Factory
{
    protected $model = Competition::class;

    public function definition(): array
    {
        $title     = fake()->unique()->words(3, true);
        $startsAt  = fake()->dateTimeBetween('-1 month', '+1 month');
        $endsAt    = fake()->dateTimeBetween($startsAt, '+3 months');

        return [
            'title'            => ucfirst($title),
            'slug'             => Str::slug($title),
            'description'      => fake()->paragraph(),
            'status'           => fake()->randomElement([
                                    Competition::STATUS_DRAFT,
                                    Competition::STATUS_UPCOMING,
                                    Competition::STATUS_ACTIVE,
                                    Competition::STATUS_ENDED,
                                  ]),
            'starts_at'        => $startsAt,
            'ends_at'          => $endsAt,
            'max_teams'        => fake()->randomElement([null, 5, 10, 20]),
            'max_team_members' => fake()->randomElement([3, 4, 5]),
            'is_public'        => true,
            'banner'           => null,
            'created_by'       => User::admins()->first()?->id ?? 1,
        ];
    }

    // ─────────────────────────────────────────
    // States
    // ─────────────────────────────────────────
    public function draft(): static
    {
        return $this->state(fn() => [
            'status'    => Competition::STATUS_DRAFT,
            'starts_at' => now()->addDays(10),
            'ends_at'   => now()->addDays(17),
        ]);
    }

    public function upcoming(): static
    {
        return $this->state(fn() => [
            'status'    => Competition::STATUS_UPCOMING,
            'starts_at' => now()->addDays(3),
            'ends_at'   => now()->addDays(10),
        ]);
    }

    public function active(): static
    {
        return $this->state(fn() => [
            'status'    => Competition::STATUS_ACTIVE,
            'starts_at' => now()->subDay(),
            'ends_at'   => now()->addDays(7),
        ]);
    }

    public function ended(): static
    {
        return $this->state(fn() => [
            'status'    => Competition::STATUS_ENDED,
            'starts_at' => now()->subDays(14),
            'ends_at'   => now()->subDays(7),
        ]);
    }

    public function private(): static
    {
        return $this->state(fn() => [
            'is_public' => false,
        ]);
    }
}
