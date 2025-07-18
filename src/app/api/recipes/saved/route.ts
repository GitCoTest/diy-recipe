import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Use environment variables for service role key (for server-side auth)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl!, supabaseServiceRoleKey!);

// Save a recipe to the database
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, recipe } = body;

    // Log for debugging
    console.log('BODY:', body);
    console.log('userId received:', userId);

    // Optionally, verify userId matches JWT (for extra security)
    // (If you want to enforce this, you can decode the JWT from the Authorization header)

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
      console.error('❌ BACKEND: Error saving recipe:', error);
      throw error;
    }

    console.log('✅ BACKEND: Recipe saved successfully:', savedRecipe.id);

    return NextResponse.json({
      success: true,
      message: 'Recipe saved successfully!',
      recipeId: savedRecipe.id,
    });
  } catch (error) {
    console.error('❌ BACKEND: Error saving recipe:', error);
    if (error instanceof Error && error.message.includes('Unique constraint failed')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Recipe already saved!',
        },
        { status: 409 }
      );
    }
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to save recipe',
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
    const recipes = savedRecipes.map((recipe: {
      id: string;
      title: string;
      description: string;
      cook_time: string;
      difficulty: string;
      servings: number;
      image: string;
      ingredients: string;
      instructions: string;
      source?: string;
      mealType?: string;
      dietary?: string;
      favorite?: boolean;
      created_at: string;
    }) => ({
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
      mealType: recipe.mealType,
      dietary: recipe.dietary,
      favorite: recipe.favorite || false,
      createdAt: recipe.created_at,
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

// Delete a saved recipe
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const recipeId = searchParams.get('recipeId');
    const userId = searchParams.get('userId');

    if (!recipeId || !userId) {
      return NextResponse.json(
        { success: false, error: 'Recipe ID and User ID required' },
        { status: 400 }
      );
    }

    console.log("🗑️ BACKEND: Deleting recipe:", recipeId, "for user:", userId);

    const { error } = await supabase
      .from('saved_recipes')
      .delete()
      .eq('id', recipeId)
      .eq('user_id', userId);

    if (error) {
      console.error("❌ BACKEND: Error deleting recipe:", error);
      throw error;
    }

    console.log("✅ BACKEND: Recipe deleted successfully");

    return NextResponse.json({
      success: true,
      message: 'Recipe deleted successfully!',
    });
  } catch (error) {
    console.error("❌ BACKEND: Error deleting recipe:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete recipe',
      },
      { status: 500 }
    );
  }
}

// Update a saved recipe (e.g., toggle favorite)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { recipeId, userId, favorite } = body;

    if (!recipeId || !userId) {
      return NextResponse.json(
        { success: false, error: 'Recipe ID and User ID required' },
        { status: 400 }
      );
    }

    console.log("⭐ BACKEND: Updating recipe:", recipeId, "favorite:", favorite);

    const updateData: { favorite?: boolean } = {};
    if (typeof favorite === 'boolean') {
      updateData.favorite = favorite;
    }

    const { data: updatedRecipe, error } = await supabase
      .from('saved_recipes')
      .update(updateData)
      .eq('id', recipeId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error("❌ BACKEND: Error updating recipe:", error);
      throw error;
    }

    console.log("✅ BACKEND: Recipe updated successfully");

    return NextResponse.json({
      success: true,
      message: 'Recipe updated successfully!',
      recipe: updatedRecipe,
    });
  } catch (error) {
    console.error("❌ BACKEND: Error updating recipe:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update recipe',
      },
      { status: 500 }
    );
  }
}
