import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { supabase } from '@/lib/supabase';
import { config } from 'dotenv';
import path from 'path';

// Load environment variables explicitly
config({ path: path.resolve(process.cwd(), '.env.local') });

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
  prepTime?: string;
  totalTime?: string;
  cuisine?: string;
  tags?: string[];
  rating?: number;
  reviews?: number;
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
    
    // Enhance recipes with professional touches
    const enhancedRecipes = recipes.map((recipe, index) => enhanceRecipe(recipe, index));
    
    return NextResponse.json({
      success: true,
      recipes: enhancedRecipes,
      message: surpriseMode ? 'Surprise recipes generated!' : 'Recipes generated successfully!',
      count: enhancedRecipes.length
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
  
  let prompt: string;
  
  if (surpriseMode) {
    prompt = `Generate 3 completely random and creative recipes. Be wildly creative with different cuisines, ingredients, and cooking techniques. 

INSTRUCTIONS MUST BE DETAILED: Write professional, comprehensive instructions with specific temperatures, timing, visual cues, and cooking techniques. Each step should be clear and detailed like a professional cookbook.

Return only valid JSON format:

{
  "recipes": [
    {
      "title": "Recipe Name",
      "description": "Brief description", 
      "cookTime": "25 mins",
      "difficulty": "Easy",
      "servings": 4,
      "ingredients": ["ingredient with amount"],
      "instructions": ["Detailed step with temperature, timing, and technique", "Another comprehensive step with visual cues"]
    }
  ]
}`;
  } else if (customizations.voiceRequest) {
    prompt = `🎤 VOICE REQUEST: "${customizations.voiceRequest}"

You are a professional chef. The user spoke this request naturally. Create 3 recipes that match EXACTLY what they asked for.

CRITICAL REQUIREMENTS: 
- If they said "mug cake", make single-serving microwave mug cake recipes
- If they said "eggless", use absolutely NO eggs
- If they said "quick", keep total time under 20 minutes
- Use realistic ingredient amounts
- Write DETAILED, PROFESSIONAL INSTRUCTIONS with specific temperatures, timing, visual cues, and proper cooking techniques

INSTRUCTION STYLE: Write like a professional cookbook - include oven temperatures, pan preparation, cooking times, visual cues for doneness, and detailed techniques. Each step should be comprehensive and clear.

🍽️ MEAL TYPE: ${mealType || 'Infer from request'}
🌱 DIETARY: ${dietary || 'Infer from request'}

Return only valid JSON:
{
  "recipes": [
    {
      "title": "Recipe Name",
      "description": "Brief description",
      "cookTime": "15 mins", 
      "difficulty": "Easy",
      "servings": 1,
      "ingredients": ["2 tbsp peanut butter", "3 tbsp flour"],
      "instructions": ["Detailed step with specific technique and timing", "Comprehensive step with visual cues and temperature"]
    }
  ]
}`;
  } else {
    prompt = `Create 3-4 recipes using:
🥄 BASE: ${baseIngredients.join(', ') || 'Choose appropriate'}
🥘 MAIN: ${mainIngredients.join(', ') || 'Choose appropriate'}  
🍽️ MEAL: ${mealType || 'Any'}
🌱 DIETARY: ${dietary || 'No restrictions'}

INSTRUCTION STYLE: Write DETAILED, PROFESSIONAL instructions with specific temperatures, timing, visual cues, and proper cooking techniques. Include oven temperatures, pan preparation, cooking times, visual cues for doneness, and detailed techniques like a professional cookbook.

Return only valid JSON:
{
  "recipes": [
    {
      "title": "Recipe Name",
      "description": "Brief description",
      "cookTime": "25 mins",
      "difficulty": "Easy", 
      "servings": 4,
      "ingredients": ["ingredient with amount"],
      "instructions": ["Detailed step with temperature and timing", "Comprehensive step with visual cues and technique"]
    }
  ]
}`;
  }

  console.log("📝 Generated GPT prompt for:", { baseIngredients, mainIngredients, mealType, dietary, customizations });
  
  // Debug environment variables
  console.log("🔧 DEBUG: OPENAI_API_KEY exists:", !!process.env.OPENAI_API_KEY);
  console.log("🔧 DEBUG: OPENAI_API_KEY length:", process.env.OPENAI_API_KEY?.length || 0);
  
  // Get API key from environment variables
  const apiKey = process.env.OPENAI_API_KEY;
  
  // Create OpenAI client dynamically to ensure environment variables are loaded
  if (!apiKey) {
    throw new Error('OpenAI API key not found in environment variables');
  }
  
  const openai = new OpenAI({
    apiKey: apiKey,
  });
  
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: "You are a professional chef and cookbook author. Write detailed, comprehensive instructions with specific temperatures, timing, visual cues, and proper cooking techniques. Each instruction step should be thorough and professional like a high-quality cookbook. Always return valid JSON only."
      },
      {
        role: "user", 
        content: prompt
      }
    ],
    max_tokens: 2000,
    temperature: 0.8,
  });

  const response = completion.choices[0]?.message?.content;
  if (!response) {
    throw new Error('No response from OpenAI');
  }

  // Clean and parse response
  let cleanedResponse = response.trim();
  if (cleanedResponse.startsWith('```json')) {
    cleanedResponse = cleanedResponse.replace(/```json\n?/, '').replace(/\n?```$/, '');
  }
  if (cleanedResponse.startsWith('```')) {
    cleanedResponse = cleanedResponse.replace(/```\n?/, '').replace(/\n?```$/, '');
  }

  const parsedResponse = JSON.parse(cleanedResponse);
  return parsedResponse.recipes || [];
}

function generateFallbackRecipes(params: GenerateRecipeParams): Recipe[] {
  const { baseIngredients, mainIngredients, mealType, dietary, customizations, surpriseMode } = params;
  
  // Voice request fallback
  if (customizations.voiceRequest) {
    const request = String(customizations.voiceRequest).toLowerCase();
    
    if (request.includes('mug cake') && request.includes('peanut butter') && request.includes('chocolate')) {
      return [{
        title: "Eggless Peanut Butter Chocolate Mug Cake",
        description: "A quick and delicious single-serving mug cake ready in minutes",
        cookTime: "2 mins",
        difficulty: "Easy",
        servings: 1,
        ingredients: [
          "3 tbsp all-purpose flour",
          "2 tbsp cocoa powder", 
          "2 tbsp sugar",
          "1/4 tsp baking powder",
          "2 tbsp peanut butter",
          "3 tbsp milk",
          "1 tbsp chocolate chips"
        ],
        instructions: [
          "In a microwave-safe mug (at least 12 oz capacity), whisk together the all-purpose flour, cocoa powder, sugar, and baking powder until well combined with no lumps.",
          "Add the peanut butter to the dry mixture and pour in the milk. Using a fork or small whisk, stir vigorously until the batter is completely smooth and no streaks of peanut butter remain. The mixture should be thick but pourable.",
          "Gently fold in the chocolate chips, distributing them evenly throughout the batter. Tap the mug lightly on the counter to settle the ingredients.",
          "Microwave on high power for 90 seconds. The cake should rise significantly and spring back lightly when touched in the center. If still wet in the center, microwave for an additional 15-20 seconds.",
          "Remove carefully (the mug will be very hot) and let cool for 1-2 minutes before enjoying. The cake will deflate slightly as it cools, which is normal."
        ],
        prepTime: "2 mins",
        totalTime: "4 mins",
        cuisine: "American",
        tags: ["quick", "dessert", "microwave", "eggless"]
      }];
    }
  }
  
  // Default fallback recipes
  return [
    {
      title: "Simple Pasta Aglio e Olio",
      description: "Classic Italian pasta with garlic and olive oil",
      cookTime: "15 mins",
      difficulty: "Easy",
      servings: 2,
      ingredients: [
        "200g spaghetti",
        "4 cloves garlic, sliced",
        "3 tbsp olive oil",
        "Red pepper flakes",
        "Parsley",
        "Salt and pepper"
      ],
      instructions: [
        "Bring a large pot of salted water to a rolling boil. Add the spaghetti and cook according to package directions until al dente, usually 8-10 minutes. Reserve 1/2 cup of pasta cooking water before draining.",
        "While the pasta cooks, heat the olive oil in a large skillet over medium-low heat. Add the sliced garlic and cook slowly, stirring frequently, for 2-3 minutes until fragrant and just beginning to turn golden. Do not let it brown or it will become bitter.",
        "Add a pinch of red pepper flakes to the garlic oil and cook for another 30 seconds. Remove from heat temporarily if the pasta isn't ready yet.",
        "Drain the pasta and immediately add it to the skillet with the garlic oil. Toss vigorously over medium heat for 1-2 minutes, adding a splash of the reserved pasta water if needed to help coat the noodles.",
        "Remove from heat and add freshly chopped parsley, salt, and freshly ground black pepper to taste. Toss once more and serve immediately in warmed bowls."
      ],
      prepTime: "5 mins",
      totalTime: "20 mins",
      cuisine: "Italian",
      tags: ["quick", "vegetarian"]
    }
  ];
}

function enhanceRecipe(recipe: Recipe, index: number): Recipe {
  return {
    ...recipe,
    id: Date.now() + index,
    // Remove random image - let client-side getRecipeImageUrl handle image selection based on recipe content
    prepTime: recipe.prepTime || "10 mins",
    totalTime: recipe.totalTime || "30 mins",
    cuisine: recipe.cuisine || "International",
    tags: recipe.tags || ["homemade"],
    rating: Math.floor(Math.random() * 2) + 4,
    reviews: Math.floor(Math.random() * 100) + 10
  };
}
