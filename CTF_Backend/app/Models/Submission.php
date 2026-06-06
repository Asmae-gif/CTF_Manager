<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Submission extends Model
{
    use HasFactory;

    protected $fillable = [
        'challenge_id', 'team_id',
        'user_id', 'flag_submitted', 'is_correct', 'points', 'ip_address',
    ];

    protected function casts(): array
    {
        return ['is_correct' => 'boolean'];
    }

    public function challenge()
    {
        return $this->belongsTo(Challenge::class);
    }

    public function team()
    {
        return $this->belongsTo(Team::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}