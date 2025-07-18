import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

interface RecipeRequest {
  baseIngredients: string[];
  mainIngredients: string[];
  mealType: string;
  dietary: string;
  surpriseMode?: boolean;
}

interface Recipe {
  id: number;
  title: string;
  image: string;
  description: string;
  cookTime: string;
  difficulty: string;
  ingredients: string[];
  instructions: string[];
  servings: number;
}

// Check if OpenAI is configured
const apiKey = process.env.OPENAI_API_KEY;
let openai: OpenAI | null = null;

if (!apiKey) {
  console.warn('⚠️ OpenAI API key not configured - recipe generation will return mock data');
} else {
  // Initialize OpenAI
  openai = new OpenAI({
    apiKey: apiKey,
  });
}

// OpenAI recipe generation with smart prompting
const generateRecipesWithOpenAI = async (params: RecipeRequest): Promise<Recipe[]> => {
  // If OpenAI is not configured, return mock recipes
  if (!openai) {
    console.log("⚠️ OpenAI not configured - returning mock recipes");
    return [
      {
        id: 1,
        title: "Mock Recipe (OpenAI not configured)",
        image: "🍽️",
        description: "This is a placeholder recipe since OpenAI API is not configured.",
        cookTime: "15 min",
        difficulty: "Easy",
        ingredients: ["Ingredient 1", "Ingredient 2", "Ingredient 3"],
        instructions: ["Step 1: Mock instruction", "Step 2: Mock instruction", "Step 3: Enjoy!"],
        servings: 2
      }
    ];
  }

  const { baseIngredients, mainIngredients, mealType, dietary } = params;
  
  // Create a smart prompt based on user input
  const allIngredients = [...baseIngredients, ...mainIngredients].join(', ');
  const dietaryNote = dietary ? `The recipe must be ${dietary.toLowerCase()}.` : '';
  const mealTypeNote = mealType ? `This should be a ${mealType.toLowerCase()} recipe.` : '';
  
  const prompt = `Create a recipe using these ingredients: ${allIngredients}.
${dietaryNote}
${mealTypeNote}

Generate exactly 1 recipe in this JSON format:
{
  "title": "Recipe name",
  "description": "Brief description",
  "cookTime": "time in minutes",
  "difficulty": "Easy/Medium/Hard",
  "servings": number,
  "ingredients": ["ingredient 1", "ingredient 2", etc],
  "instructions": ["step 1", "step 2", etc]
}

Important rules:
- Use ONLY the ingredients provided or very common pantry staples (salt, pepper, oil, water)
- Make the recipe realistic and achievable
- If asking for a protein shake/smoothie, create a shake/smoothie recipe
- If asking for pasta, create a pasta recipe
- Match the recipe type to what the user is asking for
- Keep ingredients list concise and practical
- Make instructions clear and step-by-step
- Ensure the recipe matches the dietary restrictions exactly`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a professional chef who creates practical, delicious recipes. Always respond with valid JSON only, no additional text."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const responseContent = completion.choices[0]?.message?.content;
    if (!responseContent) {
      throw new Error('No response from OpenAI');
    }

    // Parse the JSON response
    const recipeData = JSON.parse(responseContent);
    
    // Create the recipe object with proper structure
    const recipe: Recipe = {
      id: 1,
      title: recipeData.title,
      image: '🍽️', // Will be replaced by smart image selection in frontend
      description: recipeData.description,
      cookTime: recipeData.cookTime,
      difficulty: recipeData.difficulty,
      ingredients: recipeData.ingredients,
      instructions: recipeData.instructions,
      servings: recipeData.servings || 4
    };

    return [recipe];
    
  } catch (error) {
    console.error('OpenAI API Error:', error);
    
    // Fallback to a simple recipe based on ingredients
    return [{
      id: 1,
      title: `Quick ${allIngredients} Recipe`,
      image: '🍽️',
      description: `A simple recipe using ${allIngredients}`,
      cookTime: '20 mins',
      difficulty: 'Easy',
      servings: 2,
      ingredients: [
        ...baseIngredients.map(ing => `1 cup ${ing}`),
        ...mainIngredients.map(ing => `1/2 cup ${ing}`),
        'Salt and pepper to taste'
      ],
      instructions: [
        'Combine all ingredients in a bowl or blender',
        'Mix or blend until well combined',
        'Serve immediately and enjoy!'
      ]
    }];
  }
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("📥 Received request:", body);

    const { baseIngredients = [], mainIngredients = [], mealType = '', dietary = '' } = body;

    // Validate input
    if (!Array.isArray(baseIngredients) || !Array.isArray(mainIngredients)) {
      return NextResponse.json(
        { error: 'Invalid input: ingredients must be arrays' },
        { status: 400 }
      );
    }

    // Generate recipes using OpenAI
    const recipes = await generateRecipesWithOpenAI({
      baseIngredients,
      mainIngredients,
      mealType,
      dietary
    });

    console.log("✅ Generated recipes:", recipes.length);
    
    return NextResponse.json({ 
      recipes,
      message: `Generated ${recipes.length} ${dietary ? dietary.toLowerCase() + ' ' : ''}recipes for ${mealType || 'your meal'}`
    });

  } catch (error) {
    console.error("❌ API Error:", error);
    return NextResponse.json(
      { error: 'Failed to generate recipes' },
      { status: 500 }
    );
  }
}
