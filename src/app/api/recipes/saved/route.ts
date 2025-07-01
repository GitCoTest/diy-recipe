import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Type definitions
interface SavedRecipe {
  id: string;
  userId: string;
  title: string;
  description: string;
  cookTime: string;
  difficulty: string;
  servings: number;
  image: string;
  ingredients: string; // JSON string
  instructions: string; // JSON string
  source?: string;
  mealType?: string;
  dietary?: string;
  createdAt: Date;
}

// Save a recipe to the database
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, recipe } = body;

    console.log("💾 BACKEND: Saving recipe:", recipe.title);

    const { data: savedRecipe, error } = await supabase
      .from('saved_recipes')
      .insert({
        user_id: userId,
        title: recipe.title,
        description: recipe.description,
        cook_time: recipe.cookTime,
        difficulty: recipe.difficulty,
        servings: recipe.servings,
        image: recipe.image || '🍽️',
        ingredients: JSON.stringify(recipe.ingredients),
        instructions: JSON.stringify(recipe.instructions),
        source: recipe.source || 'user_saved',
        meal_type: recipe.mealType,
        dietary: recipe.dietary,
      })
      .select()
      .single();

    if (error) {
      console.error("❌ BACKEND: Error saving recipe:", error);
      throw error;
    }

    console.log("✅ BACKEND: Recipe saved successfully:", savedRecipe.id);

    return NextResponse.json({
      success: true,
      message: 'Recipe saved successfully!',
      recipeId: savedRecipe.id
    });

  } catch (error) {
    console.error("❌ BACKEND: Error saving recipe:", error);
    
    // Handle unique constraint violation (duplicate recipe)
    if (error instanceof Error && error.message.includes('Unique constraint failed')) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Recipe already saved!' 
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to save recipe' 
      },
      { status: 500 }
    );
  }
}

// Get all saved recipes for a user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID required' },
        { status: 400 }
      );
    }

    console.log("📖 BACKEND: Fetching saved recipes for user:", userId);

    const { data: savedRecipes, error } = await supabase
      .from('saved_recipes')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("❌ BACKEND: Error fetching recipes:", error);
      throw error;
    }

    // Parse JSON fields back to objects
    const recipes = savedRecipes.map((recipe: any) => ({
      id: recipe.id,
      title: recipe.title,
      description: recipe.description,
      cookTime: recipe.cook_time,
      difficulty: recipe.difficulty,
      servings: recipe.servings,
      image: recipe.image,
      ingredients: JSON.parse(recipe.ingredients),
      instructions: JSON.parse(recipe.instructions),
      source: recipe.source,
      mealType: recipe.meal_type,
      dietary: recipe.dietary,
      createdAt: recipe.createdAt,
    }));

    console.log("✅ BACKEND: Found", recipes.length, "saved recipes");

    return NextResponse.json({
      success: true,
      recipes: recipes,
      count: recipes.length
    });

  } catch (error) {
    console.error("❌ BACKEND: Error fetching recipes:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch recipes' 
      },
      { status: 500 }
    );
  }
}
