<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Support\Str;

class Category extends Model
{
    use HasFactory;

    protected $fillable = [
        'name', 'slug', 'icon', 'color', 'description',
    ];

    protected static function boot(): void
    {
        parent::boot();
        static::creating(function (Category $cat) {
            $cat->slug = Str::slug($cat->name);
        });
    }

    public function challenges()
    {
        return $this->hasMany(Challenge::class);
    }
}