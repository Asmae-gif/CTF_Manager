<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Challenge;
use App\Models\Competition;
use App\Models\Hint;
use App\Models\Submission;
use App\Models\Team;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;

class ChallengeController extends Controller
{
    // ─── Liste des challenges d'une compétition ───────────
    public function index(Competition $competition)
    {
        $user = \Illuminate\Support\Facades\Auth::guard('sanctum')->user();
        $team = $user ? $user->leadingTeam : null;

        $challenges = $competition->challenges()
            ->active()
            ->withCount('hints')
            ->with('category:id,name,icon,color')
            ->get()
            ->map(function ($c) use ($team) {
                $solved = false;
                if ($team) {
                    $solved = \App\Models\Submission::where('team_id', $team->id)
                        ->where('challenge_id', $c->id)
                        ->where('is_correct', true)
                        ->exists();
                }

                return collect($c)
                    ->except('flag')
                    ->put('solved', $solved);
            });

        return response()->json($challenges)
            ->header('Cache-Control', 'no-cache, no-store, must-revalidate')
            ->header('Pragma', 'no-cache')
            ->header('Expires', '0');
    }
public function banIp($ip)
{
    cache()->put('banned:ip:' . $ip, true, now()->addDays(7));
    return response()->json(['message' => 'IP bannie.']);
}

public function unbanIp($ip)
{
    cache()->forget('banned:ip:' . $ip);
    cache()->forget('ip-fail-count:' . $ip);
    return response()->json(['message' => 'IP debannie.']);
}
    // ─── Voir un challenge (sans le flag) ─────────────────
    public function show(Challenge $challenge)
    {
        $data = $challenge->load('hints:id,challenge_id,cost,order,content', 'category:id,name,icon,color');
        return response()->json(collect($data)->except('flag'));
    }

    // ─── Créer un challenge (admin) ───────────────────────
    public function store(Request $request, Competition $competition)
    {
        $data = $request->validate([
            'title'       => 'required|string|max:150',
            'description' => 'required|string',
            'category_id' => 'required|exists:categories,id',
            'difficulty'  => 'required|in:easy,medium,hard',
            'points'      => 'required|integer|min:1',
            'flag'        => 'required|string',
            'url'         => 'nullable|url',
            'file'        => 'nullable|file|max:10240',
            'is_active'   => 'boolean',
            'hints'       => 'nullable|json',
        ]);

        // Upload fichier
        if ($request->hasFile('file')) {
            $data['file_path'] = $request->file('file')->store('challenges', 'public');
        }

        unset($data['file']);
        $challenge = $competition->challenges()->create($data);

        // Créer les hints
        if ($request->has('hints')) {
            $hints = json_decode($request->input('hints'), true);
            if (is_array($hints)) {
                foreach ($hints as $order => $hint) {
                    Hint::create([
                        'challenge_id' => $challenge->id,
                        'content' => $hint['content'] ?? '',
                        'cost' => $hint['cost'] ?? 0,
                        'order' => $order,
                    ]);
                }
            }
        }

        return response()->json($challenge, 201);
    }

    // ─── Modifier un challenge (admin) ────────────────────
    public function update(Request $request, Challenge $challenge)
    {
        $data = $request->validate([
            'title'       => 'sometimes|string|max:150',
            'description' => 'sometimes|string',
            'category_id' => 'sometimes|exists:categories,id',
            'difficulty'  => 'sometimes|in:easy,medium,hard',
            'points'      => 'sometimes|integer|min:1',
            'flag'        => 'sometimes|string',
            'is_active'   => 'boolean',
        ]);

        $challenge->update($data);
        return response()->json($challenge);
    }

    // ─── Supprimer un challenge (admin) ───────────────────
    public function destroy(Challenge $challenge)
    {
        $challenge->delete();
        return response()->json(['message' => 'Challenge supprimé.']);
    }

    // ─── Soumettre un flag ────────────────────────────────
    public function submit(Request $request, Challenge $challenge)
    {
        $request->validate([
            'flag' => 'required|string',
        ]);

        $user = $request->user();
        $ip   = $request->ip();

        // Trouver l'équipe
        $team = Team::whereHas('members', fn($q) =>
            $q->where('user_id', $user->id)
        )->first();

        if (!$team) {
            return response()->json(
                ['message' => 'Tu dois être dans une équipe.'], 403
            );
        }

        // ══════════════════════════════════════════════════
        // CLÉS CACHE
        // ══════════════════════════════════════════════════
        $cid = $challenge->id;
        $tid = $team->id;

        // Rate limiter (fenêtre glissante 15 min)
        $teamRlKey  = "rl:team:{$tid}:challenge:{$cid}";
        $ipRlKey    = "rl:ip:{$ip}:challenge:{$cid}";

        // Compteurs de blocs (combien de fois bloqué)
        $teamBlockCount = "block-count:team:{$tid}:challenge:{$cid}";
        $ipBlockCount   = "block-count:ip:{$ip}:challenge:{$cid}";

        // Compteurs de fails totaux
        $teamFailCount  = "fail-count:team:{$tid}:challenge:{$cid}";
        $ipFailCount    = "fail-count:ip:{$ip}:challenge:{$cid}";

        // Clés de ban
        $teamBanKey = "banned:team:{$tid}:challenge:{$cid}";
        $ipBanKey   = "banned:ip:{$ip}";

        // ══════════════════════════════════════════════════
        // VÉRIFICATION BAN IP → ban équipe automatique
        // ══════════════════════════════════════════════════
        if (cache()->has($ipBanKey)) {
            // Bannir l'équipe automatiquement si pas déjà bannie
            if (!cache()->has($teamBanKey)) {
                cache()->put($teamBanKey, [
                    'reason'  => 'IP bannie : ' . $ip,
                    'auto'    => true,
                ], now()->addDays(7));
            }

            return response()->json([
                'message' => '🚫 IP bannie. Votre équipe est automatiquement bannie. Contactez un admin.',
                'banned'  => true,
            ], 429);
        }

        // ══════════════════════════════════════════════════
        // VÉRIFICATION BAN ÉQUIPE
        // ══════════════════════════════════════════════════
        if (cache()->has($teamBanKey)) {
            $banInfo = cache()->get($teamBanKey);
            $reason  = is_array($banInfo) ? $banInfo['reason'] : 'Trop de tentatives.';

            return response()->json([
                'message' => '🚫 Équipe bannie : ' . $reason . ' Contactez un admin.',
                'banned'  => true,
            ], 429);
        }

        // ══════════════════════════════════════════════════
        // VÉRIFICATION BLOCAGE TEMPORAIRE IP
        // ══════════════════════════════════════════════════
        if (RateLimiter::tooManyAttempts($ipRlKey, maxAttempts: 5)) {
            $seconds      = RateLimiter::availableIn($ipRlKey);
            $blocksIp     = cache()->get($ipBlockCount, 0);

            // Bloqué plus de 3 fois → ban IP + ban équipe
            if ($blocksIp >= 3) {
                cache()->put($ipBanKey, true, now()->addDays(7));
                cache()->put($teamBanKey, [
                    'reason' => 'IP bloquée plus de 3 fois : ' . $ip,
                    'auto'   => true,
                ], now()->addDays(7));

                return response()->json([
                    'message' => '🚫 IP bannie après 3 blocages. Équipe bannie automatiquement.',
                    'banned'  => true,
                ], 429);
            }

            return response()->json([
                'message'     => '🚫 IP bloquée. Réessaie dans ' . gmdate('i\m s\s', $seconds) . '.',
                'retry_after' => $seconds,
                'ip_blocks'   => $blocksIp,
            ], 429);
        }

        // ══════════════════════════════════════════════════
        // VÉRIFICATION BLOCAGE TEMPORAIRE ÉQUIPE
        // ══════════════════════════════════════════════════
        if (RateLimiter::tooManyAttempts($teamRlKey, maxAttempts: 5)) {
            $seconds    = RateLimiter::availableIn($teamRlKey);
            $blocksTeam = cache()->get($teamBlockCount, 0);
            $totalFails = cache()->get($teamFailCount, 0);

            // Bloqué plus de 3 fois → ban équipe
            if ($blocksTeam >= 3) {
                cache()->put($teamBanKey, [
                    'reason' => 'Bloquée plus de 3 fois sur le même challenge.',
                    'auto'   => false,
                ], now()->addDays(7));

                return response()->json([
                    'message' => '🚫 Équipe bannie après 3 blocages sur ce challenge.',
                    'banned'  => true,
                ], 429);
            }

            return response()->json([
                'message'     => '⏳ Trop de tentatives ! Réessaie dans ' . gmdate('i\m s\s', $seconds) . '.',
                'retry_after' => $seconds,
                'total_fails' => $totalFails,
                'blocks'      => $blocksTeam,
            ], 429);
        }

        // ══════════════════════════════════════════════════
        // DÉJÀ RÉSOLU ?
        // ══════════════════════════════════════════════════
        $alreadySolved = Submission::where('challenge_id', $cid)
            ->where('team_id', $tid)
            ->where('is_correct', true)
            ->exists();

        if ($alreadySolved) {
            return response()->json(
                ['message' => 'Challenge déjà résolu par votre équipe !'], 422
            );
        }

        // ══════════════════════════════════════════════════
        // VÉRIFICATION DU FLAG
        // ══════════════════════════════════════════════════
        $isCorrect = $challenge->checkFlag($request->flag);

        Submission::create([
            'challenge_id'   => $cid,
            'team_id'        => $tid,
            'user_id'        => $user->id,
            'flag_submitted' => $request->flag,
            'is_correct'     => $isCorrect,
            'ip_address'     => $ip,
        ]);

        // ══════════════════════════════════════════════════
        // FLAG CORRECT
        // ══════════════════════════════════════════════════
        if ($isCorrect) {
            RateLimiter::clear($teamRlKey);
            RateLimiter::clear($ipRlKey);
            cache()->forget($teamFailCount);
            cache()->forget($ipFailCount);

            // Calculer les points finaux en fonction des hints utilisés
            $usedHints = Hint::where('challenge_id', $cid)
                ->whereHas('teams', fn($q) => $q->where('team_id', $tid))
                ->sum('cost');

            $finalPoints = max(0, $challenge->points - $usedHints);

            $team->increment('score', $finalPoints);
            $user->increment('score', $finalPoints);

            // Mettre à jour la soumission avec les points réels
            $submission = Submission::where('challenge_id', $cid)
                ->where('team_id', $tid)
                ->where('user_id', $user->id)
                ->latest()
                ->first();

            if ($submission) {
                $submission->update(['points' => $finalPoints]);
            }

            return response()->json([
                'correct' => true,
                'message' => '🎉 Bravo ! Flag correct !',
                'points'  => $finalPoints,
                'hint_reduction' => $usedHints,
            ]);
        }

        // ══════════════════════════════════════════════════
        // FLAG INCORRECT → blocage progressif
        // ══════════════════════════════════════════════════

        // Incrémenter fail totaux équipe
        $totalFails = cache()->get($teamFailCount, 0) + 1;
        cache()->put($teamFailCount, $totalFails, now()->addHours(24));

        // Incrémenter fail totaux IP
        $totalIpFails = cache()->get($ipFailCount, 0) + 1;
        cache()->put($ipFailCount, $totalIpFails, now()->addHours(24));

        // ── Ban équipe à 20+ tentatives totales ───────────
        if ($totalFails >= 20) {
            cache()->put($teamBanKey, [
                'reason' => '20 tentatives échouées sur ce challenge.',
                'auto'   => false,
            ], now()->addDays(7));

            return response()->json([
                'correct' => false,
                'message' => '🚫 Équipe bannie 7 jours après 20 tentatives.',
                'banned'  => true,
            ], 429);
        }

        // ── Blocage 2h à partir de 15 fails ───────────────
        if ($totalFails >= 15) {
            RateLimiter::clear($teamRlKey);
            RateLimiter::hit($teamRlKey, 7200);
            $blocks = cache()->get($teamBlockCount, 0) + 1;
            cache()->put($teamBlockCount, $blocks, now()->addDays(1));

            return response()->json([
                'correct'     => false,
                'message'     => '⛔ Trop de tentatives. Équipe bloquée 2 heures.',
                'retry_after' => 7200,
                'total_fails' => $totalFails,
                'blocks'      => $blocks,
            ], 429);
        }

        // ── Blocage 30 min à partir de 10 fails ───────────
        if ($totalFails >= 10) {
            RateLimiter::clear($teamRlKey);
            RateLimiter::hit($teamRlKey, 1800);
            $blocks = cache()->get($teamBlockCount, 0) + 1;
            cache()->put($teamBlockCount, $blocks, now()->addDays(1));

            return response()->json([
                'correct'     => false,
                'message'     => '⚠️ Trop de tentatives. Équipe bloquée 30 minutes.',
                'retry_after' => 1800,
                'total_fails' => $totalFails,
                'blocks'      => $blocks,
            ], 429);
        }

        // ── Fenêtre normale 5 essais / 15 min ─────────────
        RateLimiter::hit($teamRlKey, 900);
        RateLimiter::hit($ipRlKey, 900);

        // Si IP atteint 5 → incrémenter bloc IP
        if (RateLimiter::tooManyAttempts($ipRlKey, maxAttempts: 5)) {
            $blocksIp = cache()->get($ipBlockCount, 0) + 1;
            cache()->put($ipBlockCount, $blocksIp, now()->addDays(1));
        }

        $remaining = 5 - RateLimiter::attempts($teamRlKey);

        return response()->json([
            'correct'       => false,
            'message'       => '❌ Flag incorrect. Réessaie !',
            'attempts_left' => max(0, $remaining),
            'total_fails'   => $totalFails,
        ]);
    }

    // ─── Voir les hints d'un challenge ────────────────────
    public function hints(Request $request, Challenge $challenge)
    {
        $team = Team::whereHas('members', fn($q) =>
            $q->where('user_id', $request->user()->id)
        )->first();

        $hints = $challenge->hints->map(function ($hint) use ($team) {
            $used = $team ? $hint->teams->contains($team->id) : false;
            return [
                'id'      => $hint->id,
                'cost'    => $hint->cost,
                'order'   => $hint->order,
                'used'    => $used,
                'content' => $used ? $hint->content : null,
            ];
        });

        return response()->json($hints);
    }

    // ─── Utiliser un hint ─────────────────────────────────
    public function useHint(Request $request, Hint $hint)
    {
        $user = $request->user();

        $team = Team::whereHas('members', fn($q) =>
            $q->where('user_id', $user->id)
        )->first();

        if (!$team) {
            return response()->json(
                ['message' => 'Tu dois être dans une équipe.'], 403
            );
        }

        if ($hint->teams->contains($team->id)) {
            return response()->json([
                'message' => 'Hint déjà utilisé.',
                'content' => $hint->content,
            ]);
        }

        if ($hint->cost > 0 && $team->score >= $hint->cost) {
            $team->decrement('score', $hint->cost);
        }

        $hint->teams()->attach($team->id, ['used_at' => now()]);

        return response()->json([
            'message' => 'Hint débloqué !',
            'content' => $hint->content,
            'cost'    => $hint->cost,
        ]);
    }
}
