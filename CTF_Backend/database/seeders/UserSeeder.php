<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // ── 1. Admin — pour tester interface admin, gestion users/competitions ──
        User::create([
            'username'  => 'Admin',
            'fullname'  => 'Administrator',
            'email'     => 'admin@ctf.ma',
            'password'  => 'Admin@1234',
            'type'      => User::TYPE_ADMIN,
            'country'   => 'MA',
            'is_active' => true,
        ]);

        // ── 2. Team Leader — pour tester créer équipe, rejoindre compétition ──
        User::create([
            'username'  => 'captain_jack',
            'fullname'  => 'Jack Sparrow',
            'email'     => 'leader@ctf.ma',
            'password'  => 'Leader@1234',
            'type'      => User::TYPE_TEAM_LEADER,
            'score'     => 1200,
            'country'   => 'MA',
            'skills'    => ['web', 'crypto'],
            'bio'       => 'Captain of the Black Pearl.',
            'is_active' => true,
        ]);
User::create([
    'username'  => 'cyber_queen',
    'fullname'  => 'Amina El Idrissi',
    'email'     => 'amina.leader@ctf.ma',
    'password'  => 'Leader@1234',
    'type'      => User::TYPE_TEAM_LEADER,
    'score'     => 1450,
    'country'   => 'MA',
    'skills'    => ['forensics', 'osint', 'web'],
    'bio'       => 'Experienced CTF team leader specializing in digital forensics and OSINT challenges.',
    'is_active' => true,
]);
        // ── 3. Participant actif — pour tester rejoindre équipe, soumettre flag ──
        User::create([
            'username'  => 'anne_bonny',
            'fullname'  => 'Anne Bonny',
            'email'     => 'participant@ctf.ma',
            'password'  => 'Part@1234',
            'type'      => User::TYPE_PARTICIPANT,
            'score'     => 850,
            'country'   => 'FR',
            'skills'    => ['pwn', 'reverse'],
            'bio'       => 'Best hacker of the Caribbean.',
            'is_active' => true,
        ]);

        // ── 4. Participant score élevé — pour tester rank Elite + leaderboard ──
        User::create([
            'username'  => 'calico_jack',
            'fullname'  => 'Calico Jack',
            'email'     => 'elite@ctf.ma',
            'password'  => 'Elite@1234',
            'type'      => User::TYPE_PARTICIPANT,
            'score'     => 6500,
            'country'   => 'US',
            'skills'    => ['web', 'crypto', 'forensics'],
            'is_active' => true,
        ]);

        // ── 5. Participant inactif — pour tester toggle active/locked ──
        User::create([
            'username'  => 'davy_jones',
            'fullname'  => 'Davy Jones',
            'email'     => 'locked@ctf.ma',
            'password'  => 'Locked@1234',
            'type'      => User::TYPE_PARTICIPANT,
            'score'     => 200,
            'is_active' => true,  // ← LOCKED dans la table admin
        ]);

        // ── 6. Participant sans skills/bio — pour tester profil vide ──
        User::create([
            'username'  => 'new_pirate',
            'fullname'  => null,
            'email'     => 'newbie@ctf.ma',
            'password'  => 'Newbie@1234',
            'type'      => User::TYPE_PARTICIPANT,
            'score'     => 0,      // ← rank Beginner
            'is_active' => true,
        ]);
    }
}
