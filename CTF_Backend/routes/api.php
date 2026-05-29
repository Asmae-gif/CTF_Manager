<?php

use App\Http\Controllers\Api\AdminRewardsController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CertificateController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\CompetitionController;
use App\Http\Controllers\Api\TeamController;
use App\Http\Controllers\Api\ChallengeController;
use App\Http\Controllers\Api\ScoreboardController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\AdminStatsController;
// ─────────────────────────────────────────
// Routes publiques
// ─────────────────────────────────────────
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login',    [AuthController::class, 'login']);
    Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);

    Route::post('/reset-password', [AuthController::class, 'resetPassword']); 
});
Route::get('/scoreboard', [ScoreboardController::class, 'index']);
Route::get('/leaderboard', [UserController::class, 'leaderboard']);
Route::get('/users/{user}', [UserController::class, 'show']);
Route::get('/competitions',        [CompetitionController::class, 'index']);
Route::middleware('App\Http\Middleware\OptionalAuth')->group(function () {
    Route::get('/competitions/{competition}', [CompetitionController::class, 'show']);
});
// ─────────────────────────────────────────
// Routes protégées
// ─────────────────────────────────────────
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me',      [AuthController::class, 'me']);

 // Profil personnel
    Route::get('/user/profile', [UserController::class, 'profile']);
    Route::match(['put', 'post'], '/user/profile', [UserController::class, 'updateProfile']);

    Route::get('/competitions/{competition}/certificate/status', [CertificateController::class, 'status']);
    Route::get('/competitions/{competition}/certificate/pdf', [CertificateController::class, 'download']);

    // ─────────────────────────────────────────
    // Routes admin seulement
    // ─────────────────────────────────────────
    Route::middleware('type:admin')->group(function () {
        Route::get('/users',                    [UserController::class, 'index']);
        Route::patch('/users/{user}/toggle',    [UserController::class, 'toggleActive']);
        Route::put('/users/{user}', [UserController::class, 'adminUpdate']);
        Route::delete('/users/{user}',          [UserController::class, 'destroy']);
        Route::post('/competitions',                        [CompetitionController::class, 'store']);
        Route::put('/competitions/{competition}',           [CompetitionController::class, 'update']);
        Route::delete('/competitions/{competition}',        [CompetitionController::class, 'destroy']);
        Route::patch('/competitions/{competition}/status',  [CompetitionController::class, 'updateStatus']);
        // routes/api.php — dans le groupe admin
Route::get('/admin/stats', [AdminStatsController::class, 'index']);

        Route::get('/admin/awarded-badges', [AdminRewardsController::class, 'awardedBadges']);
        Route::get('/admin/competitions/{competition}/certificate-preview', [AdminRewardsController::class, 'certificatePreview']);
    });
    Route::middleware(['auth:sanctum', 'type:admin'])->group(function () {
    Route::post('/admin/ban/team/{teamId}',    [TeamController::class, 'banTeam']);
    Route::post('/admin/unban/team/{teamId}',  [TeamController::class, 'unbanTeam']);
    Route::post('/admin/ban/ip/{ip}',          [ChallengeController::class, 'banIp']);
    Route::post('/admin/unban/ip/{ip}',        [ChallengeController::class, 'unbanIp']);
});
      // Chef d'équipe — inscription à une compétition
      Route::middleware('type:team_leader')->group(function () {
        Route::post('/competitions/{competition}/join',  [CompetitionController::class, 'join']);
        Route::post('/competitions/{competition}/leave', [CompetitionController::class, 'leave']);
        Route::get('/competitions/{competition}/teams', [CompetitionController::class, 'teams']);
    });
});

Route::middleware(['auth:sanctum'])->group(function () {
        Route::get('/teams', [TeamController::class, 'index']);

    // ── Teams ─────────────────────────────────────────────
    Route::post('/teams', [TeamController::class, 'store'])
    ->middleware('type:team_leader,admin,participant');
    Route::get('/teams/{team}', [TeamController::class, 'show']);
    Route::put('/teams/{team}/members/{user}', [TeamController::class, 'updateMemberRole']);
    Route::put('/teams/{team}', [TeamController::class, 'update']);

    Route::delete('/teams/{team}', [TeamController::class, 'destroy']);

    // Inviter un participant dans l'équipe
    Route::post('/teams/{team}/invite', [TeamController::class, 'invite']);
    Route::post('/teams/join', [TeamController::class, 'join']);


    // Retirer un membre
    Route::delete('/teams/{team}/members/{user}', [TeamController::class, 'removeMember']);

});
Route::get('/categories', function() {
    return \App\Models\Category::all();
});
// ── Categories (public) ──────────────────────────────
Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/categories/{category}', [CategoryController::class, 'show']);

// ── Categories (admin) ───────────────────────────────
Route::middleware(['auth:sanctum', 'type:admin'])->group(function () {
    Route::post('/categories', [CategoryController::class, 'store']);
    Route::put('/categories/{category}', [CategoryController::class, 'update']);
    Route::delete('/categories/{category}', [CategoryController::class, 'destroy']);
});
    // ── Challenges (public : liste) ───────────────────────────
Route::get('/competitions/{competition}/challenges',
    [ChallengeController::class, 'index']);

Route::get('/challenges/{challenge}',
    [ChallengeController::class, 'show']);

// ── Challenges (protégées) ────────────────────────────────
Route::middleware('auth:sanctum')->group(function () {

    // Soumettre un flag
    Route::post('/challenges/{challenge}/submit',
        [ChallengeController::class, 'submit']);

    // Voir les hints d'un challenge
    Route::get('/challenges/{challenge}/hints',
        [ChallengeController::class, 'hints']);

    // Utiliser un hint
    Route::post('/hints/{hint}/use',
        [ChallengeController::class, 'useHint']);

    // Admin seulement
    Route::middleware('type:admin')->group(function () {
        Route::post('/competitions/{competition}/challenges',
            [ChallengeController::class, 'store']);
        Route::put('/challenges/{challenge}',
            [ChallengeController::class, 'update']);
        Route::delete('/challenges/{challenge}',
            [ChallengeController::class, 'destroy']);
        Route::put('/admin/members/{user}', [UserController::class, 'adminUpdate']);
    });

});
