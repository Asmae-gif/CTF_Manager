<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            UserSeeder::class,
            BadgeSeeder::class,
            CompetitionSeeder::class,
            TeamSeeder::class,
            CategorySeeder::class,
            ChallengeSeeder::class,
            BadgeSeeder::class,
        ]);
    }
}
