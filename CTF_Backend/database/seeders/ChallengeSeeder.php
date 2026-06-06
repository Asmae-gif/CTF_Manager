<?php
namespace Database\Seeders;

use App\Models\Challenge;
use App\Models\Hint;
use App\Models\Category;
use App\Models\Competition;
use Illuminate\Database\Seeder;

class ChallengeSeeder extends Seeder
{
    public function run(): void
    {
        $competition = Competition::first();

        // Récupérer les catégories créées par CategorySeeder
        $web    = Category::where('slug', 'web')->first();
        $crypto = Category::where('slug', 'crypto')->first();
        $pwn    = Category::where('slug', 'pwn')->first();

        $challenges = [
            [
                'title'       => 'Hello Web',
                'description' => 'Trouvez le flag caché dans le code source.',
                'category_id' => $web->id,
                'difficulty'  => 'easy',
                'points'      => 100,
                'flag'        => 'CTF{hello_web_2026}',
                'is_active'   => true,
                'hints' => [
                    ['content' => 'Regarde le code source HTML.', 'cost' => 10, 'order' => 1],
                    ['content' => 'Cherche dans les commentaires.', 'cost' => 20, 'order' => 2],
                ],
            ],
            [
                'title'       => 'Caesar Cipher',
                'description' => 'Déchiffrez ce message encodé.',
                'category_id' => $crypto->id,
                'difficulty'  => 'easy',
                'points'      => 150,
                'flag'        => 'CTF{caesar_is_easy}',
                'is_active'   => true,
                'hints' => [
                    ['content' => 'ROT13 est ton ami.', 'cost' => 15, 'order' => 1],
                ],
            ],
            [
                'title'       => 'Binary Exploit',
                'description' => 'Exploitez ce binaire vulnérable.',
                'category_id' => $pwn->id,
                'difficulty'  => 'hard',
                'points'      => 500,
                'flag'        => 'CTF{pwn_master_2026}',
                'is_active'   => true,
                'hints' => [
                    ['content' => 'Buffer overflow classique.', 'cost' => 50, 'order' => 1],
                    ['content' => 'Utilise GDB pour déboguer.', 'cost' => 75, 'order' => 2],
                ],
            ],
        ];

        foreach ($challenges as $data) {
            $hints = $data['hints'];
            unset($data['hints']);
            $challenge = $competition->challenges()->create($data);
            foreach ($hints as $hint) {
                $challenge->hints()->create($hint);
            }
        }

        $juniorCompetition = Competition::where('slug', 'ctf-junior-2026')->first();
        if ($juniorCompetition) {
            foreach ($juniorCompetition->challenges as $challenge) {
                if ($challenge->hints()->exists()) {
                    continue;
                }

                $challenge->hints()->createMany([
                    [
                        'content' => 'Regarde d’abord l’énoncé et identifie la catégorie.',
                        'cost'    => 10,
                        'order'   => 1,
                    ],
                    [
                        'content' => 'Cherche les indices simples dans les fichiers fournis.',
                        'cost'    => 20,
                        'order'   => 2,
                    ],
                ]);
            }
        }
    }
}