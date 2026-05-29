<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Support\Str;
class Team extends Model
{
    use HasFactory, SoftDeletes;
    protected $fillable = [
        'name',
        'slug',
        'description',
        'avatar',
        'leader_id',
        'invite_code',
        'competition_id',
        'score',
        'is_active',
    ];
    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'score'     => 'integer',
        ];
    }
    protected static function boot(): void
    {
        parent::boot();
        static::creating(function (Team $team) {
            $team->slug = Str::slug($team->name) . '-' . Str::random(5);
            $team->invite_code = Str::upper(Str::random(8));
        });
    }
    public function leader()
    {
        return $this->belongsTo(User::class, 'leader_id');
    }
    public function members()
    {
        return $this->belongsToMany(User::class, 'team_user')
                    ->withPivot('role', 'joined_at'); // ← withTimestamps() supprimé
    }
    public function competition()
    {
        return $this->belongsTo(Competition::class);
    }
    public function submissions()
    {
        return $this->hasMany(Submission::class);
    }

    public function competitionTeamResults(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(CompetitionTeamResult::class);
    }
    public function getMembersCountAttribute(): int
    {
        return $this->members()->count();
    }
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /** Compétition liée à l'équipe si elle est à venir ou en cours. */
    public function activeCompetition(): ?Competition
    {
        $c = $this->competition;

        if ($c && in_array($c->status, ['upcoming', 'active'], true)) {
            return $c;
        }

        return null;
    }
}
