<?php

namespace Database\Seeders;

use App\Models\Badge;
use Illuminate\Database\Seeder;

class BadgeSeeder extends Seeder
{
    public function run(): void
    {
        $rows = [
            [
                'slug' => Badge::SLUG_GOLD,
                'name' => 'Gold Winner',
                'emoji' => '🥇',
                'description' => "Top 1 d’une compétition",
            ],
            [
                'slug' => Badge::SLUG_SILVER,
                'name' => 'Silver Winner',
                'emoji' => '🥈',
                'description' => "Top 2 d’une compétition",
            ],
            [
                'slug' => Badge::SLUG_BRONZE,
                'name' => 'Bronze Winner',
                'emoji' => '🥉',
                'description' => "Top 3 d’une compétition",
            ],
        ];

        foreach ($rows as $row) {
            Badge::query()->updateOrCreate(['slug' => $row['slug']], $row);
        }
    }
}
