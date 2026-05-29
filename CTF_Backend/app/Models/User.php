<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Laravel\Sanctum\PersonalAccessToken;
use App\Notifications\ResetPasswordNotification;

/**
 * @method static Builder active()
 * @method static Builder admins()
 * @method static Builder teamLeaders()
 * @method static Builder participants()
 * @method static Builder leaderboard()
 * @method PersonalAccessToken createToken(string $name, array $abilities = ['*'])
 * @method \Illuminate\Database\Eloquent\Relations\MorphMany tokens()
 * @property-read string $rank
 */

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, SoftDeletes;

    // ─────────────────────────────────────────
    // Constantes des types
    // ─────────────────────────────────────────
    const TYPE_ADMIN       = 'Admin';
    const TYPE_TEAM_LEADER = 'Capitain';
    const TYPE_PARTICIPANT = 'Participant';

    //ordre logique clarifié
const TYPES_ORDER = [
    self::TYPE_ADMIN,
    self::TYPE_TEAM_LEADER,
    self::TYPE_PARTICIPANT,
];

    // ─────────────────────────────────────────
    // Constantes des rangs
    // ─────────────────────────────────────────
    const RANKS = [
        0    => 'Beginner',
        500  => 'Intermediate',
        2000 => 'Expert',
        5000 => 'Elite',
    ];

    // ─────────────────────────────────────────
    // Fillable
    // ─────────────────────────────────────────
    protected $fillable = [
        'username',
        'fullname',
        'email',
        'password',
        'avatar',
        'bio',
        'country',
        'type',
        'score',
        'skills',
        'is_active',
        'last_seen_at',
    ];

    // ─────────────────────────────────────────
    // Hidden
    // ─────────────────────────────────────────
    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $appends = ['rank'];

    // ─────────────────────────────────────────
    // Casts — password hashé automatiquement
    // ─────────────────────────────────────────
    protected function casts(): array
    {
        return [
            'password'     => 'hashed',   // ← hash automatique Laravel 11
            'skills'       => 'array',
            'is_active'    => 'boolean',
            'last_seen_at' => 'datetime',
            'score'        => 'integer',
        ];
    }

    // ─────────────────────────────────────────
    // Accessor : rank calculé depuis le score
    // ─────────────────────────────────────────
    public function getRankAttribute(): string
    {
        $rank = 'Beginner';
        foreach (self::RANKS as $minScore => $label) {
            if ($this->score >= $minScore) {
                $rank = $label;
            }
        }
        return $rank;
    }

    // ─────────────────────────────────────────
    // Helpers de rôle
    // ─────────────────────────────────────────
    public function isAdmin(): bool
    {
        return $this->type === self::TYPE_ADMIN;
    }

    public function isTeamLeader(): bool
    {
        return $this->type === self::TYPE_TEAM_LEADER;
    }

    public function isParticipant(): bool
    {
        return $this->type === self::TYPE_PARTICIPANT;
    }

    public static function normalizeType(string $type): string
    {
        return match (strtolower($type)) {
            'admin' => self::TYPE_ADMIN,
            'team_leader', 'teamleader', 'captain', 'capitain' => self::TYPE_TEAM_LEADER,
            'participant' => self::TYPE_PARTICIPANT,
            default => $type,
        };
    }

    public function canManage(): bool
    {
        return in_array($this->type, [
            self::TYPE_ADMIN,
            self::TYPE_TEAM_LEADER,
        ], true);
    }

    // ─────────────────────────────────────────
    // Scopes
    // ─────────────────────────────────────────
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    public function scopeAdmins(Builder $query): Builder
    {
        return $query->where('type', self::TYPE_ADMIN);
    }

    public function scopeTeamLeaders(Builder $query): Builder
    {
        return $query->where('type', self::TYPE_TEAM_LEADER);
    }

    public function scopeParticipants(Builder $query): Builder
    {
        return $query->where('type', self::TYPE_PARTICIPANT);
    }

    public function scopeLeaderboard(Builder $query): Builder
    {
        return $query->active()->orderByDesc('score');
    }

    // ─────────────────────────────────────────
    // Relations
    // ─────────────────────────────────────────
    public function team()
{
    return $this->belongsToMany(Team::class, 'team_user')
                ->withPivot('role', 'joined_at');
}



public function submissions()
{
    return $this->hasMany(Submission::class);
}

    public function leadingTeam()
{
    return $this->hasOne(Team::class, 'leader_id');
}

    public function userBadges(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(UserBadge::class);
    }

// ✅ Corriger avec les bonnes clés étrangères
public function solvedChallenges()
{
    return $this->hasManyThrough(
        Challenge::class,  // destination finale
        Submission::class, // table intermédiaire
        'user_id',         // FK dans submissions → users.id
        'id',              // PK dans challenges
        'id',              // PK dans users
        'challenge_id'     // FK dans submissions → challenges.id
    )->where('submissions.is_correct', true);
}

public function sendPasswordResetNotification($token): void
{
    $this->notify(new ResetPasswordNotification($token));
}
}
