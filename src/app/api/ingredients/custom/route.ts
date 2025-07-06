import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Type definitions (commented out unused interface)
// interface CustomIngredient {
//   id: string;
//   name: string;
//   category: string;
//   validated: boolean;
//   userId: string;
//   createdAt: Date;
// }

// Save a custom ingredient
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, name, category } = body;

    console.log("🥕 BACKEND: Saving custom ingredient:", name);

    const { data: customIngredient, error } = await supabase
      .from('custom_ingredients')
      .insert({
        user_id: userId,
        name: name.toLowerCase().trim(),
        category: category || 'other',
        validated: true, // We'll mark as validated since we're using GPT validation
      })
      .select()
      .single();

    if (error) {
      console.error("❌ BACKEND: Error saving ingredient:", error);
      throw error;
    }

    console.log("✅ BACKEND: Custom ingredient saved:", customIngredient.id);

    return NextResponse.json({
      success: true,
      message: 'Custom ingredient saved!',
      ingredient: {
        id: customIngredient.id,
        name: customIngredient.name,
        category: customIngredient.category,
      }
    });

  } catch (error) {
    console.error("❌ BACKEND: Error saving custom ingredient:", error);
    
    // Handle unique constraint violation (duplicate ingredient)
    if (error instanceof Error && error.message.includes('Unique constraint failed')) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Ingredient already exists!' 
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to save ingredient' 
      },
      { status: 500 }
    );
  }
}

// Get all custom ingredients for a user
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

    console.log("📖 BACKEND: Fetching custom ingredients for user:", userId);

    const { data: customIngredients, error } = await supabase
      .from('custom_ingredients')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("❌ BACKEND: Error fetching ingredients:", error);
      throw error;
    }

    console.log("✅ BACKEND: Found", customIngredients.length, "custom ingredients");

    return NextResponse.json({
      success: true,
      ingredients: customIngredients.map((ing: { id: string; name: string; category: string; validated: boolean }) => ({
        id: ing.id,
        name: ing.name,
        category: ing.category,
        validated: ing.validated,
      })),
      count: customIngredients.length
    });

  } catch (error) {
    console.error("❌ BACKEND: Error fetching custom ingredients:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch ingredients' 
      },
      { status: 500 }
    );
  }
}
