<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Badge extends Model
{
    public const SLUG_GOLD = 'gold_winner';

    public const SLUG_SILVER = 'silver_winner';

    public const SLUG_BRONZE = 'bronze_winner';

    protected $fillable = [
        'slug',
        'name',
        'emoji',
        'description',
    ];

    public function userBadges(): HasMany
    {
        return $this->hasMany(UserBadge::class);
    }
}
