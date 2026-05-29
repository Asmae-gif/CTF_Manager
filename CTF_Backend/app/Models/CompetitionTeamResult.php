<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CompetitionTeamResult extends Model
{
    protected $fillable = [
        'competition_id',
        'team_id',
        'rank',
        'score',
        'last_solve_at',
    ];

    protected function casts(): array
    {
        return [
            'rank' => 'integer',
            'score' => 'integer',
            'last_solve_at' => 'datetime',
        ];
    }

    public function competition(): BelongsTo
    {
        return $this->belongsTo(Competition::class);
    }

    public function team(): BelongsTo
    {
        return $this->belongsTo(Team::class);
    }
}
