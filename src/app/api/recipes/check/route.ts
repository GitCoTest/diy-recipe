import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Check if Supabase is properly configured
if (!supabaseUrl || !supabaseServiceRoleKey || supabaseUrl.includes('your-project-id')) {
  console.warn('⚠️ Supabase not configured - recipe check API will return mock data');
}

const supabase = supabaseUrl && supabaseServiceRoleKey && !supabaseUrl.includes('your-project-id') 
  ? createClient(supabaseUrl, supabaseServiceRoleKey)
  : null;

// Check if a recipe is already saved by the user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const title = searchParams.get('title');

    if (!userId || !title) {
      return NextResponse.json(
        { success: false, error: 'User ID and recipe title required' },
        { status: 400 }
      );
    }

    console.log("🔍 BACKEND: Checking if recipe is saved:", title, "for user:", userId);

    // If Supabase is not configured, return mock data
    if (!supabase) {
      console.log("⚠️ Supabase not configured - returning mock data");
      return NextResponse.json({
        success: true,
        isSaved: false,
        recipeId: null,
      });
    }

    const { data: existingRecipe, error } = await supabase
      .from('saved_recipes')
      .select('id')
      .eq('user_id', userId)
      .eq('title', title)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      console.error("❌ BACKEND: Error checking recipe:", error);
      throw error;
    }

    const isSaved = !!existingRecipe;
    console.log("✅ BACKEND: Recipe saved status:", isSaved);

    return NextResponse.json({
      success: true,
      isSaved: isSaved,
      recipeId: existingRecipe?.id || null,
    });

  } catch (error) {
    console.error("❌ BACKEND: Error checking recipe:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to check recipe status' 
      },
      { status: 500 }
    );
  }
}
