<?php

namespace Database\Seeders;

use App\Models\Submission;
use App\Models\Team;
use App\Models\Challenge;
use App\Models\Competition;
use Illuminate\Database\Seeder;

class SubmissionSeeder extends Seeder
{
    public function run(): void
    {
        // Récupérer toutes les compétitions
        $competitions = Competition::all();

        if ($competitions->isEmpty()) {
            $this->command->info('Aucune compétition trouvée. Créez d\'abord des compétitions.');
            return;
        }

        foreach ($competitions as $competition) {
            // Récupérer les teams de la compétition
            $teams = $competition->teams()->with('members')->get();

            if ($teams->isEmpty()) {
                continue;
            }

            // Récupérer les challenges de la compétition
            $challenges = $competition->challenges()->get();

            if ($challenges->isEmpty()) {
                continue;
            }

            // Pour chaque team
            foreach ($teams as $team) {
                $members = $team->members()->get();

                if ($members->isEmpty()) {
                    continue;
                }

                // Pour chaque challenge
                foreach ($challenges as $challenge) {
                    // Générer 1-3 soumissions par challenge et team
                    $submissionsCount = random_int(1, 3);

                    for ($i = 0; $i < $submissionsCount; $i++) {
                        $user = $members->random();
                        $isCorrect = $i === $submissionsCount - 1; // Le dernier est correct

                        if ($isCorrect) {
                            // Soumettre le bon flag
                            $flagSubmitted = $this->generateCorrectFlag($challenge->title);
                        } else {
                            // Soumettre un mauvais flag
                            $flagSubmitted = 'CTF{incorrect_flag_' . random_int(1000, 9999) . '}';
                        }

                        Submission::create([
                            'user_id' => $user->id,
                            'team_id' => $team->id,
                            'challenge_id' => $challenge->id,
                            'flag_submitted' => $flagSubmitted,
                            'is_correct' => $isCorrect,
                        ]);
                    }
                }
            }

            $this->command->info("✓ Soumissions créées pour la compétition: {$competition->title}");
        }

        $this->command->info('Toutes les soumissions ont été créées avec succès!');
    }

    /**
     * Générer un flag correct basé sur le titre du challenge
     */
    private function generateCorrectFlag(string $challengeTitle): string
    {
        // Créer un pattern de flag basé sur le titre
        $slug = str_replace(' ', '_', strtolower($challengeTitle));
        return 'CTF{' . $slug . '_2026}';
    }
}
