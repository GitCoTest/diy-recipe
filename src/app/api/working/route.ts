import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { supabase } from '@/lib/supabase';

// Create OpenAI client only if API key is available
let openai: OpenAI | null = null;
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
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
  
  // Create intelligent prompt with STRICT dietary rules or surprise mode
  const currentTime = Date.now();
  const randomSeed = Math.floor(Math.random() * 1000000);
  
  const prompt = surpriseMode ? 
    `Generate 4-5 completely random and creative recipes. Use this random seed for inspiration: ${randomSeed}. 
    
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
    `You are a friendly chef and close friend. Create 4-5 delicious recipes using these ingredients and preferences:

🥄 BASE INGREDIENTS: ${baseIngredients.length > 0 ? baseIngredients.join(', ') : 'Choose appropriate base ingredients'}
🥘 MAIN INGREDIENTS: ${mainIngredients.length > 0 ? mainIngredients.join(', ') : 'Choose appropriate main ingredients'}
🍽️ MEAL TYPE: ${mealType || 'Any meal'}
🌱 DIETARY: ${dietary || 'No restrictions'}

IMPORTANT: Write instructions as if you're a close friend teaching someone to cook. Be detailed, encouraging, and include helpful tips like "don't worry if it looks messy at first" or "this is where the magic happens". Make each step clear and conversational.

ALSO IMPORTANT: For each recipe, provide:
- A realistic cooking time (not too fast, not too slow)
- Proper serving sizes (2-6 people)
- Professional-sounding but approachable recipe names
- A brief, appetizing description that sounds like it's from a cooking magazine
- Include prep tips and cooking techniques

Return exactly this JSON format:
{
  "recipes": [
    {
      "title": "Recipe Name",
      "description": "Brief, appetizing description that sounds professional",
      "cookTime": "25 mins",
      "difficulty": "Easy",
      "servings": 4,
      "ingredients": ["ingredient 1", "ingredient 2"],
      "instructions": ["step 1", "step 2"],
      "prepTime": "10 mins",
      "totalTime": "35 mins",
      "cuisine": "American",
      "tags": ["comfort food", "family-friendly"]
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
      },
      {
        id: 3,
        title: "🌮 Surprise Fusion Tacos",
        image: "🌮",
        description: "Creative fusion tacos with unexpected flavors!",
        cookTime: "20 mins",
        difficulty: "Medium",
        servings: 3,
        ingredients: [
          "6 corn tortillas",
          "1 cup cooked rice",
          "1 cup black beans",
          "1/2 cup kimchi",
          "2 tbsp sriracha mayo",
          "Cilantro and lime"
        ],
        instructions: [
          "Warm tortillas in a dry pan",
          "Heat rice and beans separately",
          "Mix sriracha with mayo",
          "Fill tortillas with rice and beans",
          "Top with kimchi and sauce",
          "Garnish with cilantro and lime"
        ]
      },
      {
        id: 4,
        title: "🍜 Random Ramen Bowl",
        image: "🍜",
        description: "A creative take on instant ramen!",
        cookTime: "15 mins",
        difficulty: "Easy",
        servings: 2,
        ingredients: [
          "2 packs instant ramen",
          "2 eggs",
          "1 cup frozen vegetables",
          "2 tbsp soy sauce",
          "1 tsp sesame oil",
          "Green onions for garnish"
        ],
        instructions: [
          "Boil water and cook ramen noodles",
          "Soft boil eggs for 6-7 minutes",
          "Add frozen vegetables to ramen",
          "Season with soy sauce and sesame oil",
          "Top with halved eggs",
          "Garnish with chopped green onions"
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
    },
    {
      id: 2,
      title: `Quick ${mealType || 'Easy'} ${dietary || 'Recipe'}`.trim(),
      image: '⚡',
      description: `A fast and simple ${dietary ? dietary.toLowerCase() + ' ' : ''}recipe when you're short on time.`,
      cookTime: '15 mins',
      difficulty: 'Easy',
      servings: 2,
      ingredients: [
        ...(mainIngredients.length > 0 ? mainIngredients.slice(0, 2).map((ing: string) => `1.5 cups ${ing}`) : ['1.5 cups vegetables']),
        ...(baseIngredients.length > 0 ? baseIngredients.slice(0, 1).map((ing: string) => `1/2 cup ${ing}`) : ['1/2 cup rice']),
        'Olive oil',
        'Garlic powder',
        'Fresh herbs (optional)'
      ],
      instructions: [
        'Heat olive oil in a pan over medium heat',
        'Add your main ingredients and cook for 8-10 minutes',
        'Add base ingredients and mix well',
        'Season with garlic powder and herbs',
        'Cook until heated through',
        'Serve immediately'
      ]
    },
    {
      id: 3,
      title: `Hearty ${mealType || 'Comfort'} ${dietary || 'Bowl'}`.trim(),
      image: '🍲',
      description: `A satisfying and filling ${dietary ? dietary.toLowerCase() + ' ' : ''}meal that will keep you satisfied.`,
      cookTime: '35 mins',
      difficulty: 'Medium',
      servings: 6,
      ingredients: [
        ...(baseIngredients.length > 1 ? baseIngredients.slice(0, 2).map((ing: string) => `1.5 cups ${ing}`) : ['1.5 cups grains', '1 cup legumes']),
        ...(mainIngredients.length > 1 ? mainIngredients.slice(0, 2).map((ing: string) => `1 cup ${ing}`) : ['1 cup mixed vegetables']),
        'Vegetable or chicken broth',
        'Onion and garlic',
        'Bay leaves',
        'Salt and pepper'
      ],
      instructions: [
        'Sauté onion and garlic until fragrant',
        'Add base ingredients and toast briefly',
        'Pour in broth and add bay leaves',
        'Bring to a boil, then reduce heat and simmer',
        'Add main ingredients and cook for 20-25 minutes',
        'Season with salt and pepper',
        'Remove bay leaves before serving'
      ]
    },
    {
      id: 4,
      title: `Creative ${mealType || 'Fusion'} ${dietary || 'Dish'}`.trim(),
      image: '🎨',
      description: `An innovative ${dietary ? dietary.toLowerCase() + ' ' : ''}recipe with unique flavor combinations.`,
      cookTime: '20 mins',
      difficulty: 'Medium',
      servings: 3,
      ingredients: [
        ...(mainIngredients.length > 0 ? mainIngredients.slice(-1).map((ing: string) => `2 cups ${ing}`) : ['2 cups seasonal vegetables']),
        ...(baseIngredients.length > 0 ? baseIngredients.slice(-1).map((ing: string) => `1 cup ${ing}`) : ['1 cup quinoa']),
        'Coconut oil',
        'Ginger and lime',
        'Soy sauce or tamari',
        'Sesame seeds'
      ],
      instructions: [
        'Cook base ingredients according to package directions',
        'Heat coconut oil in a large skillet',
        'Add ginger and cook for 30 seconds',
        'Add main ingredients and stir-fry for 5-7 minutes',
        'Mix in cooked base ingredients',
        'Season with soy sauce and lime juice',
        'Garnish with sesame seeds and serve'
      ]
    },
    {
      id: 5,
      title: `Simple ${mealType || 'Classic'} ${dietary || 'Favorite'}`.trim(),
      image: '❤️',
      description: `A simple yet delicious ${dietary ? dietary.toLowerCase() + ' ' : ''}version of a beloved classic.`,
      cookTime: '30 mins',
      difficulty: 'Easy',
      servings: 4,
      ingredients: [
        ...(baseIngredients.length > 0 ? baseIngredients.slice(0, 1).map((ing: string) => `2 cups ${ing}`) : ['2 cups pasta or rice']),
        ...(mainIngredients.length > 0 ? mainIngredients.slice(0, 2).map((ing: string) => `1.5 cups ${ing}`) : ['1.5 cups protein', '1.5 cups vegetables']),
        'Olive oil',
        'Italian seasoning',
        'Fresh basil',
        'Parmesan cheese (optional)'
      ],
      instructions: [
        'Cook base ingredients according to package directions',
        'Heat olive oil in a large pan',
        'Add main ingredients and cook until tender',
        'Combine with cooked base ingredients',
        'Season with Italian seasoning and fresh basil',
        'Top with Parmesan if desired',
        'Let flavors meld for 5 minutes before serving'
      ]
    }
  ];
}

// Function to generate recipe image URL
function generateRecipeImageUrl(recipe: Recipe): string {
  // Using a high-quality food image service
  const foodImages = [
    'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=300&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=300&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400&h=300&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400&h=300&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&h=300&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f?w=400&h=300&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1559181567-c3190ca9959b?w=400&h=300&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=400&h=300&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1563379091339-03246963d071?w=400&h=300&fit=crop&crop=center'
  ];
  
  // Use recipe title to consistently select the same image for the same recipe
  const hash = recipe.title.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
  return foodImages[hash % foodImages.length];
}

// Function to add professional touches to recipe
function enhanceRecipe(recipe: Recipe, index: number): Recipe {
  const enhancedRecipe = {
    ...recipe,
    id: index + 1,
    image: generateRecipeImageUrl(recipe),
    // Add professional touches
    prepTime: recipe.prepTime || '10 mins',
    totalTime: recipe.totalTime || recipe.cookTime,
    cuisine: recipe.cuisine || 'International',
    tags: recipe.tags || ['homemade', 'delicious'],
    rating: Math.floor(Math.random() * 1.5) + 4.5, // Random rating between 4.5-5.0
    reviews: Math.floor(Math.random() * 200) + 50, // Random reviews between 50-250
  };
  
  return enhancedRecipe;
}
