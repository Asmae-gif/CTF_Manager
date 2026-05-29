<?php

namespace Database\Seeders;

use App\Models\Competition;
use App\Models\User;
use Illuminate\Database\Seeder;

class CompetitionSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::admins()->first();

        // ── 1. Active — pour tester JOIN + challenges ──────────────────────
        Competition::create([
            'title'              => 'CTF Maroc 2026',
            'slug'               => 'ctf-maroc-2026',
            'description'        => 'Compétition nationale de cybersécurité. Relevez les défis en équipe.',
            'status'             => Competition::STATUS_ACTIVE,
            'starts_at'          => now()->subDay(),
            'ends_at'            => now()->addDays(7),
            'max_teams'          => 10,
            'max_team_members'   => 5,
            'is_public'          => true,
            'organizer_name'     => 'Pirate Cyber HQ',
            'first_place_prize'  => '5000 MAD',
            'second_place_prize' => '3000 MAD',
            'third_place_prize'  => '1000 MAD',
            'created_by'         => $admin->id,
        ]);

        // ── 2. Upcoming — pour tester badge + pas de JOIN possible ─────────
        Competition::create([
            'title'            => 'CTF Junior 2026',
            'slug'             => 'ctf-junior-2026',
            'description'      => 'Compétition pour les débutants. Parfait pour apprendre !',
            'status'           => Competition::STATUS_UPCOMING,
            'starts_at'        => now()->addDays(5),
            'ends_at'          => now()->addDays(12),
            'max_teams'        => 8,
            'max_team_members' => 3,
            'is_public'        => true,
            'created_by'       => $admin->id,
        ]);

        // ── 3. Ended — pour tester certificat + suppression team admin ─────
        Competition::create([
            'title'            => 'CTF Winter 2025',
            'slug'             => 'ctf-winter-2025',
            'description'      => 'Édition hivernale terminée.',
            'status'           => Competition::STATUS_ENDED,
            'starts_at'        => now()->subDays(14),
            'ends_at'          => now()->subDays(7),
            'max_team_members' => 5,
            'is_public'        => true,
            'created_by'       => $admin->id,
        ]);

        // ── 4. Draft — pour tester que les participants ne la voient pas ───
        Competition::create([
            'title'       => 'CTF Secret Draft',
            'slug'        => 'ctf-secret-draft',
            'description' => 'Brouillon non visible publiquement.',
            'status'      => Competition::STATUS_DRAFT,
            'starts_at'   => now()->addDays(30),
            'ends_at'     => now()->addDays(37),
            'is_public'   => false,
            'created_by'  => $admin->id,
        ]);
    }
}
