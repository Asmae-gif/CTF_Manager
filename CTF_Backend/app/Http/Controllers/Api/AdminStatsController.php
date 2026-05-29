<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Team;
use App\Models\Competition;
use App\Models\Challenge;
use App\Models\Submission;
use App\Models\Category;
use Illuminate\Http\JsonResponse;

class AdminStatsController extends Controller
{
    public function index(): JsonResponse
    {
        // Stats globales
        $global = [
            'total_users'          => User::count(),
            'active_users'         => User::where('is_active', true)->count(),
            'locked_users'         => User::where('is_active', false)->count(),
            'total_teams'          => Team::count(),
            'total_competitions'   => Competition::count(),
            'active_competitions'  => Competition::where('status', 'active')->count(),
            'total_challenges'     => Challenge::count(),
            'total_submissions'    => Submission::count(),
            'correct_submissions'  => Submission::where('is_correct', true)->count(),
            'solve_rate'           => Submission::count() > 0
                ? round(Submission::where('is_correct', true)->count() / Submission::count() * 100, 1)
                : 0,
        ];

        // Users par type
        $usersByType = User::selectRaw('type, count(*) as count')
            ->groupBy('type')
            ->pluck('count', 'type')
            ->toArray();

        // Challenges par catégorie
        $challengesByCategory = Challenge::with('category')
            ->get()
            ->groupBy(fn($ch) => $ch->category?->name ?? 'Unknown')
            ->map(fn($chs) => $chs->count())
            ->toArray();

        // Competitions avec le plus grand score total des équipes
        $topCompetitions = Competition::with(['teams' => function($q) {
            $q->orderByDesc('score');
        }])
        ->get()
        ->map(function($comp) {
            $totalScore = $comp->teams->sum('score');
            return [
                'id'          => $comp->id,
                'title'       => $comp->title,
                'total_score' => $totalScore,
                'teams'       => $comp->teams->count(),
            ];
        })
        ->sortByDesc('total_score')
        ->values()
        ->take(6);

        // Challenges les moins résolus
        $leastSolved = Challenge::withCount([
            'submissions as solved_count' => fn($q) => $q->where('is_correct', true)
        ])
        ->with('category')
        ->orderBy('solved_count', 'asc')
        ->take(5)
        ->get()
        ->map(fn($ch) => [
            'id'          => $ch->id,
            'title'       => $ch->title,
            'points'      => $ch->points,
            'difficulty'  => $ch->difficulty,
            'category'    => $ch->category?->name ?? 'Unknown',
            'solved_count'=> $ch->solved_count,
        ]);

        // Challenges les plus résolus
        $mostSolved = Challenge::withCount([
            'submissions as solved_count' => fn($q) => $q->where('is_correct', true)
        ])
        ->with('category')
        ->orderByDesc('solved_count')
        ->take(5)
        ->get()
        ->map(fn($ch) => [
            'id'          => $ch->id,
            'title'       => $ch->title,
            'points'      => $ch->points,
            'difficulty'  => $ch->difficulty,
            'category'    => $ch->category?->name ?? 'Unknown',
            'solved_count'=> $ch->solved_count,
        ]);

        // Compétitions actives
        $activeCompetitions = Competition::where('status', 'active')
            ->withCount('teams')
            ->get()
            ->map(fn($comp) => [
                'id'        => $comp->id,
                'title'     => $comp->title,
                'teams'     => $comp->teams_count,
                'max_teams' => $comp->max_teams,
                'ends_at'   => $comp->ends_at,
                'progress'  => $comp->max_teams
                    ? round($comp->teams_count / $comp->max_teams * 100)
                    : null,
            ]);

        // Soumissions récentes
        $recentSubmissions = Submission::with(['user:id,username', 'challenge:id,title'])
            ->orderByDesc('created_at')
            ->take(10)
            ->get()
            ->map(fn($s) => [
                'username'   => $s->user?->username,
                'challenge'  => $s->challenge?->title,
                'is_correct' => $s->is_correct,
                'created_at' => $s->created_at,
            ]);

        return response()->json([
            'global'                  => $global,
            'users_by_type'           => $usersByType,
            'challenges_by_category'  => $challengesByCategory,
            'top_competitions'        => $topCompetitions,
            'most_solved'             => $mostSolved,
            'least_solved'            => $leastSolved,
            'active_competitions'     => $activeCompetitions,
            'recent_submissions'      => $recentSubmissions,
        ]);
    }
}