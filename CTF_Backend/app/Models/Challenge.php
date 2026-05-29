<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Support\Facades\Hash;

class Challenge extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'competition_id', 'title', 'description',
        'flag','category_id', 'difficulty', 'points',
        'file_path', 'is_active',
    ];

    protected $hidden = ['flag'];
    public function category()
{
    return $this->belongsTo(Category::class);
}
    protected function casts(): array
    {
        return [
             'flag'      => 'hashed',
            'is_active' => 'boolean',
            'points'    => 'integer',
        ];
    }

    public function competition()
    {
        return $this->belongsTo(Competition::class);
    }

    public function hints()
    {
        return $this->hasMany(Hint::class)->orderBy('order');
    }

    public function submissions()
    {
        return $this->hasMany(Submission::class);
    }

    /** Vérifier si le flag soumis est correct */
    public function checkFlag(string $submitted): bool
    {
        return Hash::check($submitted, $this->flag);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
