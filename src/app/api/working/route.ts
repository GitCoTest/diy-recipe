// Force load environment variables
import { config } from 'dotenv';
config({ path: '.env.local' });

import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { supabase } from '@/lib/supabase';

// Debug: Check environment variables at the top of the file
console.log('=== API Route Environment Check ===');
console.log('OPENAI_API_KEY present:', !!process.env.OPENAI_API_KEY);
console.log('NEXT_PUBLIC_SUPABASE_URL present:', !!process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY present:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
console.log('NEXT_PUBLIC_SUPABASE_URL value:', process.env.NEXT_PUBLIC_SUPABASE_URL || 'UNDEFINED');
console.log('All SUPABASE env vars:', Object.keys(process.env).filter(key => key.includes('SUPABASE')));

// Create OpenAI client only if API key is available
let openai: OpenAI | null = null;
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
  console.log('✅ OpenAI client created successfully');
} else {
  console.error('❌ OpenAI API key not found');
}

// Type definitions
interface Recipe {
  id?: number;
  title: string;
  description: string;
  cookTime: string;
  difficulty: string;
  servings: number;
  ingredients: string[];
  instructions: string[];
  image?: string;
}

interface GenerateRecipeParams {
  baseIngredients: string[];
  mainIngredients: string[];
  mealType: string;
  dietary: string;
  customizations: Record<string, unknown>;
  surpriseMode: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("📡 BACKEND: /api/working received request:", JSON.stringify(body, null, 2));
    
    const { baseIngredients = [], mainIngredients = [], mealType = '', dietary = '', customizations = {}, surpriseMode = false, userId = null } = body;

    let recipes: Recipe[];
    let source = 'fallback';
    const success = true;
    
    try {
      console.log("🤖 BACKEND: Calling GPT with surprise mode:", surpriseMode);
      recipes = await generateRecipesWithGPT({ baseIngredients, mainIngredients, mealType, dietary, customizations, surpriseMode });
      source = 'gpt';
      console.log("✅ BACKEND: GPT recipes generated:", recipes.length);
    } catch (gptError) {
      console.error("❌ BACKEND: GPT failed, using fallback. Error:", gptError);
      if (process.env.OPENAI_API_KEY) {
        console.error("❌ BACKEND: OPENAI_API_KEY is set, but GPT call failed.");
      } else {
        console.error("❌ BACKEND: OPENAI_API_KEY is missing or invalid!");
      }
      recipes = generateFallbackRecipes({ baseIngredients, mainIngredients, mealType, dietary, customizations, surpriseMode });
      source = 'fallback';
      console.log("✅ BACKEND: Fallback recipes generated:", recipes.length);
    }

    // Save recipe generation history to database
    try {
      const { error } = await supabase
        .from('recipe_history')
        .insert({
          user_id: userId,
          base_ingredients: JSON.stringify(baseIngredients),
          main_ingredients: JSON.stringify(mainIngredients),
          meal_type: mealType || null,
          dietary: dietary || null,
          customizations: JSON.stringify(customizations),
          surprise_mode: surpriseMode,
          recipes_generated: recipes.length,
          source: source,
          success: success,
        });
      
      if (error) throw error;
      console.log("📊 BACKEND: Recipe history saved to Supabase");
    } catch (historyError) {
      console.error("⚠️ BACKEND: Failed to save history (non-critical):", historyError);
    }

    console.log("🎯 BACKEND: Final recipes being returned:", recipes);
    
    return NextResponse.json({
      success: true,
      recipes: recipes,
      message: surpriseMode ? 'Surprise recipes generated!' : 'Recipes generated successfully!',
      count: recipes.length
    });

  } catch (error) {
    console.error("💥 BACKEND: Fatal error in /api/working:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        recipes: []
      },
      { status: 500 }
    );
  }
}

async function generateRecipesWithGPT(params: GenerateRecipeParams): Promise<Recipe[]> {
  const { baseIngredients, mainIngredients, mealType, dietary, customizations, surpriseMode = false } = params;
  
  // Create intelligent prompt with STRICT dietary rules or surprise mode
  const currentTime = Date.now();
  const randomSeed = Math.floor(Math.random() * 1000000);
  
  const prompt = surpriseMode ? 
    `Generate 2 completely random and creative recipes. Use this random seed for inspiration: ${randomSeed}. 
    
    Be wildly creative! Consider:
    - Fusion cuisines (Korean-Mexican, Italian-Thai, etc.)
    - Unusual ingredient combinations
    - Different cooking techniques
    - Various meal types (breakfast, lunch, dinner, snacks, desserts)
    - International cuisines from around the world
    - Seasonal ingredients
    - Creative presentations
    
    Make each recipe unique and exciting. Current timestamp: ${currentTime}
    
    IMPORTANT: Write instructions as if you're a close friend teaching someone to cook. Be detailed, encouraging, and include helpful tips. Each step should be clear and conversational.

Return only this JSON format:
{
  "recipes": [
    {
      "title": "Creative Recipe Name",
      "description": "Exciting description", 
      "cookTime": "X mins",
      "difficulty": "Easy/Medium/Hard",
      "servings": 4,
      "ingredients": ["ingredient 1", "ingredient 2"],
      "instructions": ["step 1", "step 2"]
    }
  ]
}` :
    `You are a friendly chef and close friend. Create 2-3 delicious recipes using these ingredients and preferences:

🥄 BASE INGREDIENTS: ${baseIngredients.length > 0 ? baseIngredients.join(', ') : 'Choose appropriate base ingredients'}
🥘 MAIN INGREDIENTS: ${mainIngredients.length > 0 ? mainIngredients.join(', ') : 'Choose appropriate main ingredients'}
🍽️ MEAL TYPE: ${mealType || 'Any meal'}
🌱 DIETARY: ${dietary || 'No restrictions'}

IMPORTANT: Write instructions as if you're a close friend teaching someone to cook. Be detailed, encouraging, and include helpful tips like "don't worry if it looks messy at first" or "this is where the magic happens". Make each step clear and conversational.

Return exactly this JSON format:
{
  "recipes": [
    {
      "title": "Recipe Name",
      "description": "Brief description",
      "cookTime": "25 mins",
      "difficulty": "Easy",
      "servings": 4,
      "ingredients": ["ingredient 1", "ingredient 2"],
      "instructions": ["step 1", "step 2"]
    }
  ]
}`;

  console.log("📝 Generated GPT prompt for:", { baseIngredients, mainIngredients, mealType, dietary, customizations });
  
  if (!openai) {
    throw new Error('OpenAI client not initialized - API key missing');
  }
  
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: "You are a world-class chef who creates perfect recipes. Always respond with valid JSON only."
      },
      {
        role: "user",
        content: prompt
      }
    ],
    temperature: 0.7,
    max_tokens: 2000,
  });

  const response = completion.choices[0]?.message?.content;
  if (!response) {
    throw new Error("No response from GPT");
  }

  console.log("🎯 Raw GPT response:", response);
  
  // Clean the response (remove any markdown formatting)
  let cleanedResponse = response.trim();
  if (cleanedResponse.startsWith('```json')) {
    cleanedResponse = cleanedResponse.replace(/```json\n?/, '').replace(/\n?```$/, '');
  }
  if (cleanedResponse.startsWith('```')) {
    cleanedResponse = cleanedResponse.replace(/```\n?/, '').replace(/\n?```$/, '');
  }
  
  const parsedResponse = JSON.parse(cleanedResponse);
  
  if (!parsedResponse.recipes || !Array.isArray(parsedResponse.recipes)) {
    throw new Error("Invalid response format from GPT");
  }

  // Add IDs and clean up recipes
  const cleanedRecipes = parsedResponse.recipes.map((recipe: Record<string, unknown>, index: number) => ({
    id: index + 1,
    title: recipe.title || `Recipe ${index + 1}`,
    image: recipe.image || '🍽️',
    description: recipe.description || 'A delicious recipe',
    cookTime: recipe.cookTime || '25 mins',
    difficulty: recipe.difficulty || 'Medium',
    servings: recipe.servings || 4,
    ingredients: Array.isArray(recipe.ingredients) ? recipe.ingredients : ['Ingredients not available'],
    instructions: Array.isArray(recipe.instructions) ? recipe.instructions : ['Instructions not available']
  }));

  return cleanedRecipes;
}

function generateFallbackRecipes(params: GenerateRecipeParams): Recipe[] {
  const { baseIngredients, mainIngredients, mealType, dietary, surpriseMode = false } = params;
  
  // Note: customizations parameter is available but not used in fallback generation
  console.log('Fallback recipes generated for ingredients:', { baseIngredients, mainIngredients });
  
  if (surpriseMode) {
    return [
      {
        id: 1,
        title: "🍰 Surprise Chocolate Mug Cake",
        image: "🍰",
        description: "A quick surprise dessert ready in minutes!",
        cookTime: "5 mins",
        difficulty: "Easy",
        servings: 1,
        ingredients: [
          "4 tbsp flour",
          "4 tbsp sugar", 
          "2 tbsp cocoa powder",
          "3 tbsp milk",
          "3 tbsp oil",
          "Small splash vanilla"
        ],
        instructions: [
          "Mix dry ingredients in a mug",
          "Add wet ingredients and stir",
          "Microwave for 90 seconds",
          "Enjoy your surprise treat!"
        ]
      },
      {
        id: 2,
        title: "🥗 Random Greek Salad",
        image: "🥗", 
        description: "A fresh surprise salad with Mediterranean flavors!",
        cookTime: "10 mins",
        difficulty: "Easy",
        servings: 4,
        ingredients: [
          "2 tomatoes, chopped",
          "1 cucumber, diced",
          "1/2 red onion, sliced", 
          "1/2 cup feta cheese",
          "2 tbsp olive oil",
          "1 tbsp lemon juice",
          "Oregano to taste"
        ],
        instructions: [
          "Chop all vegetables",
          "Mix in a large bowl",
          "Add feta cheese",
          "Drizzle with oil and lemon",
          "Season with oregano and serve"
        ]
      }
    ];
  }
  
  return [
    {
      id: 1,
      title: `${mealType || 'Special'} Recipe`,
      image: '🍴',
      description: `A delicious ${dietary ? dietary.toLowerCase() + ' ' : ''}recipe perfect for ${mealType?.toLowerCase() || 'any time'}.`,
      cookTime: '25 mins',
      difficulty: 'Medium',
      servings: 4,
      ingredients: [
        ...(baseIngredients.length > 0 ? baseIngredients.map((ing: string) => `1 cup ${ing}`) : ['1 cup flour']),
        ...(mainIngredients.length > 0 ? mainIngredients.map((ing: string) => `2 cups ${ing}`) : ['2 cups vegetables']),
        'Salt and pepper to taste',
        'Your favorite seasonings'
      ],
      instructions: [
        'Prepare all ingredients by washing and chopping as needed',
        'Heat a large pan or skillet over medium heat',
        'Add your ingredients and cook for 5-10 minutes',
        'Season with salt, pepper, and spices',
        'Cook until everything is well combined',
        'Serve hot and enjoy!'
      ]
    }
  ];
}
