<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Hint extends Model
{
    use HasFactory;

    protected $fillable = [
        'challenge_id', 'content', 'cost', 'order',
    ];

    protected function casts(): array
    {
        return ['cost' => 'integer'];
    }

    public function challenge()
    {
        return $this->belongsTo(Challenge::class);
    }

    /** Les équipes qui ont utilisé ce hint */
    public function teams()
    {
        return $this->belongsToMany(Team::class, 'hint_team')
                    ->withPivot('used_at');
    }
}