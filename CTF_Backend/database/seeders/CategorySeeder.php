<?php
namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['name' => 'Web',       'icon' => '🌐', 'color' => '#388BFD', 'description' => 'Attaques web, XSS, SQLi...'],
            ['name' => 'Crypto',    'icon' => '🔐', 'color' => '#BC8CFF', 'description' => 'Chiffrement, encodage...'],
            ['name' => 'Pwn',       'icon' => '💥', 'color' => '#F78166', 'description' => 'Exploitation binaire...'],
            ['name' => 'Forensics', 'icon' => '🔍', 'color' => '#E3B341', 'description' => 'Analyse de fichiers...'],
            ['name' => 'Reverse',   'icon' => '⚙️',  'color' => '#00CC66', 'description' => 'Rétro-ingénierie...'],
            ['name' => 'Misc',      'icon' => '🎯', 'color' => '#8B949E', 'description' => 'Divers...'],
        ];

        foreach ($categories as $cat) {
            Category::create($cat);
        }
    }
}