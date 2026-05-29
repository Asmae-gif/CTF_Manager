<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    /** Liste toutes les catégories (public) */
    public function index()
    {
        return response()->json(Category::withCount('challenges')->get());
    }

    /** Voir une catégorie avec ses challenges */
    public function show(Category $category)
    {
        return response()->json(
            $category->load('challenges:id,title,difficulty,points,category_id')
        );
    }

    /** Créer une catégorie (admin) */
    public function store(Request $request)
    {
        $data = $request->validate([
            'name'        => 'required|string|max:50|unique:categories',
            'icon'        => 'nullable|string|max:10',
            'color'       => 'nullable|string|max:7',
            'description' => 'nullable|string',
        ]);

        $category = Category::create($data);
        return response()->json($category, 201);
    }

    /** Modifier une catégorie (admin) */
    public function update(Request $request, Category $category)
    {
        $data = $request->validate([
            'name'        => 'sometimes|string|max:50',
            'icon'        => 'nullable|string|max:10',
            'color'       => 'nullable|string|max:7',
            'description' => 'nullable|string',
        ]);

        $category->update($data);
        return response()->json($category);
    }

    /** Supprimer une catégorie (admin) */
    public function destroy(Category $category)
    {
        $category->delete();
        return response()->json(['message' => 'Catégorie supprimée.']);
    }
}