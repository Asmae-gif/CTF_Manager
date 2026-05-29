<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class TeamFactory extends Factory
{
    public function definition(): array
    {
        $name = $this->faker->unique()->words(2, true);

        return [
            'name'         => Str::title($name),
            'slug'         => Str::slug($name) . '-' . Str::random(4),
            'description'  => $this->faker->sentence(),
            'leader_id'    => User::factory()->state(['type' => 'Capitain']),
            'score'        => 0,
            'is_active'    => true,
        ];
    }
}
