<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Competition extends Model
{
    use HasFactory, SoftDeletes;

    // ─────────────────────────────────────────
    // Constantes des statuts
    // ─────────────────────────────────────────
    const STATUS_DRAFT    = 'draft';
    const STATUS_UPCOMING = 'upcoming';
    const STATUS_ACTIVE   = 'active';
    const STATUS_ENDED    = 'ended';

    // ─────────────────────────────────────────
    // Fillable
    // ─────────────────────────────────────────
    protected $fillable = [
        'title',
        'slug',
        'description',
        'status',
        'starts_at',
        'ends_at',
        'max_teams',
        'max_team_members',
        'is_public',
        'banner',
        'created_by',
        'organizer_name',
        'first_place_prize',
        'second_place_prize',
        'third_place_prize',
        'finalized_at',
    ];

    // ─────────────────────────────────────────
    // Casts
    // ─────────────────────────────────────────
    protected $casts = [
        'starts_at'   => 'datetime',
        'ends_at'     => 'datetime',
        'is_public'   => 'boolean',
        'max_teams'   => 'integer',
        'max_team_members' => 'integer',
        'finalized_at' => 'datetime',
    ];

    // ─────────────────────────────────────────
    // Slug automatique à la création
    // ─────────────────────────────────────────
    protected static function boot(): void
    {
        parent::boot();

        static::creating(function ($competition) {
            $competition->slug = Str::slug($competition->title);
        });
    }

    // ─────────────────────────────────────────
    // Accessors
    // ─────────────────────────────────────────

    // Vérifie si la compétition est active maintenant
    public function getIsRunningAttribute(): bool
    {
        return $this->status === self::STATUS_ACTIVE
            && now()->between($this->starts_at, $this->ends_at);
    }


    // Nombre de teams inscrites
    public function getTeamsCountAttribute(): int
    {
        return $this->teams()->count();
    }

    // Places restantes
    public function getRemainingTeamsAttribute(): ?int
    {
        if (!$this->max_teams) return null;
        return max(0, $this->max_teams - $this->teams_count);
    }


    // ─────────────────────────────────────────
    // Helpers
    // ─────────────────────────────────────────
    public function isDraft(): bool
    {
        return $this->status === self::STATUS_DRAFT;
    }

    public function isUpcoming(): bool
    {
        return $this->status === self::STATUS_UPCOMING;
    }

    public function isActive(): bool
    {
        return $this->status === self::STATUS_ACTIVE;
    }

    public function isEnded(): bool
    {
        return $this->status === self::STATUS_ENDED;
    }

    public function isFull(): bool
    {
        if (!$this->max_teams) return false;
        return $this->teams_count >= $this->max_teams;
    }

    // ─────────────────────────────────────────
    // Scopes
    // ─────────────────────────────────────────
    public function scopePublic(Builder $query): Builder
    {
        return $query->where('is_public', true);
    }

    public function scopeDraft(Builder $query): Builder
    {
        return $query->where('status', self::STATUS_DRAFT);
    }

    public function scopeUpcoming(Builder $query): Builder
    {
        return $query->where('status', self::STATUS_UPCOMING);
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('status', self::STATUS_ACTIVE);
    }

    public function scopeEnded(Builder $query): Builder
    {
        return $query->where('status', self::STATUS_ENDED);
    }

    // ─────────────────────────────────────────
    // Relations
    // ─────────────────────────────────────────

    // Admin qui a créé la compétition
    public function creator(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

   // Teams inscrites à cette compétition
    public function teams()
{
    return $this->hasMany(Team::class);
}

    // L'équipe que ce capital dirige
public function leadingTeam(): \Illuminate\Database\Eloquent\Relations\HasOne
{
    return $this->hasOne(Team::class, 'leader_id');
}

public function challenges()
{
    return $this->hasMany(Challenge::class);
}

    public function teamResults(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(CompetitionTeamResult::class);
    }

    public function userBadges(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(UserBadge::class);
    }
}
