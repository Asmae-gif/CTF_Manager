<?php

namespace Database\Seeders;

use App\Models\Team;
use App\Models\User;
use App\Models\Competition;
use Illuminate\Database\Seeder;

class TeamSeeder extends Seeder
{
    public function run(): void
    {
        // Récupérer les users de test créés par UserSeeder
        $leader      = User::where('email', 'leader@ctf.ma')->first();
        $participant = User::where('email', 'participant@ctf.ma')->first();
        $competition = Competition::first();

        // Équipe principale de test
        $team = Team::create([
            'name'           => 'Team Alpha',
            'slug'           => 'team-alpha',
            'description'    => 'Équipe de test principale',
            'leader_id'      => $leader->id,
            'competition_id' => $competition?->id,
            'score'          => 0,
            'is_active'      => true,
        ]);

        // Attacher le leader et le participant comme membres
        $team->members()->attach($leader->id,      ['role' => 'leader']);
        $team->members()->attach($participant->id, ['role' => 'member']);

        // 2 équipes aléatoires supplémentaires
        Team::factory()->count(2)->create();
    }
}
