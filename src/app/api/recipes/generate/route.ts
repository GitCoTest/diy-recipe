import { NextRequest, NextResponse } from 'next/server';

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

// Simple recipe generation with STRICT dietary compliance
const generateRecipes = async (params: RecipeRequest): Promise<Recipe[]> => {
  const { baseIngredients, mainIngredients, mealType, dietary } = params;
  
  // STRICT dietary ingredient filtering
  const filterIngredientsByDiet = (ingredients: string[]): string[] => {
    return ingredients.filter(ingredient => {
      const lower = ingredient.toLowerCase();
      
      if (dietary === 'Vegetarian') {
        // STRICT VEGETARIAN: NO eggs, NO meat, NO fish, NO poultry
        if (lower.includes('egg') || lower.includes('meat') || lower.includes('beef') || 
            lower.includes('chicken') || lower.includes('pork') || lower.includes('fish') || 
            lower.includes('salmon') || lower.includes('tuna') || lower.includes('turkey') ||
            lower.includes('ham') || lower.includes('bacon') || lower.includes('sausage') ||
            lower.includes('gelatin') || lower.includes('lard')) {
          return false;
        }
      }
      
      if (dietary === 'Vegan') {
        // STRICT VEGAN: NO animal products at all
        if (lower.includes('egg') || lower.includes('meat') || lower.includes('beef') || 
            lower.includes('chicken') || lower.includes('pork') || lower.includes('fish') || 
            lower.includes('milk') || lower.includes('cheese') || lower.includes('butter') ||
            lower.includes('yogurt') || lower.includes('cream') || lower.includes('honey') ||
            lower.includes('gelatin') || lower.includes('lard')) {
          return false;
        }
      }
      
      if (dietary === 'Gluten-Free') {
        // STRICT GLUTEN-FREE: NO gluten-containing ingredients
        if (lower.includes('wheat') || lower.includes('flour') || lower.includes('bread') ||
            lower.includes('pasta') || lower.includes('barley') || lower.includes('rye')) {
          return false;
        }
      }
      
      return true;
    });
  };

  // Filter user-selected ingredients based on dietary restrictions
  const filteredBaseIngredients = filterIngredientsByDiet(baseIngredients);
  const filteredMainIngredients = filterIngredientsByDiet(mainIngredients);
  
  // Get appropriate substitutes based on dietary preferences
  const getDietaryAppropriateMilk = () => {
    if (dietary === 'Vegan') return 'Almond milk';
    if (dietary === 'Vegetarian') return 'Milk';
    return 'Milk';
  };

  const getDietaryAppropriateProtein = () => {
    if (dietary === 'Vegan') return 'Tofu or tempeh';
    if (dietary === 'Vegetarian') return 'Plant-based protein (NO EGGS)';
    return 'Protein of choice';
  };

  const getDietaryAppropriateFlour = () => {
    if (dietary === 'Gluten-Free') return 'Gluten-free flour blend';
    return 'All-purpose flour';
  };
  
  // Create smart dummy recipes based on user input
  const recipes: Recipe[] = [
    {
      id: 1,
      title: dietary === 'Vegetarian' ? '🌱 Veggie Delight (Egg-Free!)' : 
             dietary === 'Vegan' ? '🌿 Plant-Based Bowl' : 
             dietary === 'Gluten-Free' ? '🌾 Gluten-Free Special' :
             dietary === 'Keto' ? '🥑 Keto-Friendly Dish' :
             `${mealType || 'Special'} Recipe`,
      image: mealType === 'Breakfast' ? '🥞' : mealType === 'Lunch' ? '🥗' : mealType === 'Dinner' ? '🍽️' : mealType === 'Desserts' ? '�' : '�🍴',
      description: `A delicious ${dietary ? dietary.toLowerCase() + ' ' : ''}recipe perfect for ${mealType?.toLowerCase() || 'any time'}. ${dietary === 'Vegetarian' ? 'Completely egg-free and meat-free!' : ''}`,
      cookTime: '25 mins',
      difficulty: 'Easy',
      servings: 4,
      ingredients: [
        // Use filtered ingredients first
        ...(filteredBaseIngredients.length > 0 ? filteredBaseIngredients.map(ing => `1 cup ${ing}`) : [`1 cup ${getDietaryAppropriateFlour()}`]),
        ...(filteredMainIngredients.length > 0 ? filteredMainIngredients.map(ing => `2 cups ${ing}`) : ['2 cups vegetables']),
        getDietaryAppropriateMilk(),
        getDietaryAppropriateProtein(),
        'Salt and pepper to taste',
        dietary === 'Vegetarian' ? 'Nutritional yeast (for umami)' : 'Your favorite seasonings',
        ...(dietary === 'Gluten-Free' ? ['Xanthan gum (if needed)'] : [])
      ],
      instructions: [
        'Prepare all ingredients by washing and chopping as needed',
        dietary === 'Vegetarian' ? 'Note: This recipe is completely egg-free and meat-free!' : 'Heat a large pan or skillet over medium heat',
        'Add your base ingredients first and cook for 3-5 minutes',
        'Add main ingredients and cook until tender',
        'Season with salt, pepper, and your favorite spices',
        dietary === 'Vegetarian' ? 'Add nutritional yeast for extra flavor (vegetarian-friendly!)' : 'Cook for another 5-10 minutes until everything is well combined',
        'Taste and adjust seasoning as needed',
        'Serve hot and enjoy your delicious meal!'
      ]
    },
    {
      id: 2,
      title: `Quick ${dietary || ''} ${mealType || 'Tasty'} Treat`.trim(),
      image: '⚡',
      description: `A fast and flavorful ${dietary ? dietary.toLowerCase() + ' ' : ''}recipe when you need something quick`,
      cookTime: '15 mins',
      difficulty: 'Easy',
      servings: 2,
      ingredients: [
        ...(filteredMainIngredients.length > 0 ? filteredMainIngredients.slice(0, 2).map(ing => `1.5 cups ${ing}`) : ['1.5 cups vegetables']),
        ...(filteredBaseIngredients.length > 0 ? filteredBaseIngredients.slice(0, 1).map(ing => `1/2 cup ${ing}`) : [`1/2 cup ${getDietaryAppropriateFlour()}`]),
        dietary === 'Gluten-Free' ? 'Gluten-free seasonings' : 'Regular seasonings',
        dietary === 'Vegan' ? 'Plant-based oil' : dietary === 'Vegetarian' ? 'Vegetable oil (no animal products)' : 'Cooking oil',
        'Optional garnish of your choice'
      ],
      instructions: [
        'Heat your cooking surface to medium temperature',
        dietary === 'Vegetarian' ? 'Remember: This recipe uses NO eggs or meat!' : 'Quickly prepare and combine your main ingredients',
        'Add base ingredients and mix well',
        'Cook for 10-12 minutes, stirring occasionally',
        'Add seasonings and cook for 2-3 more minutes',
        'Garnish if desired and serve immediately'
      ]
    },
    {
      id: 3,
      title: `Hearty ${dietary || ''} ${mealType || 'Comfort'} Bowl`.trim(),
      image: mealType === 'Desserts' ? '🍮' : '🍲',
      description: `A satisfying and hearty ${dietary ? dietary.toLowerCase() + ' ' : ''}meal that will keep you full`,
      cookTime: '35 mins',
      difficulty: 'Medium',
      servings: 6,
      ingredients: [
        ...(filteredBaseIngredients.length > 1 ? filteredBaseIngredients.slice(0, 2).map(ing => `1.5 cups ${ing}`) : [`1.5 cups ${getDietaryAppropriateFlour()}`, 'Rice or quinoa']),
        ...(filteredMainIngredients.length > 2 ? filteredMainIngredients.slice(0, 3).map(ing => `1 cup ${ing}`) : ['Mixed vegetables', 'Protein of choice', 'Leafy greens']),
        dietary === 'Keto' ? 'Extra virgin olive oil' : getDietaryAppropriateMilk(),
        'Herbs and spices blend',
        dietary === 'Vegan' ? 'Coconut milk' : dietary === 'Vegetarian' ? 'Vegetable broth' : 'Broth',
        'Fresh herbs for garnish'
      ],
      instructions: [
        'Start by preparing all vegetables and ingredients',
        'Heat oil in a large pot over medium heat',
        'Add base ingredients and sauté for 5 minutes',
        'Add main ingredients in order of cooking time needed',
        'Pour in liquid ingredients and bring to a simmer',
        'Cover and cook for 20-25 minutes until tender',
        'Season to taste and adjust consistency if needed',
        'Garnish with fresh herbs and serve warm'
      ]
    },
    {
      id: 4,
      title: `Creative ${dietary || ''} ${mealType || 'Fusion'} Dish`.trim(),
      image: mealType === 'Desserts' ? '🧁' : '🎨',
      description: `An innovative ${dietary ? dietary.toLowerCase() + ' ' : ''}recipe with unique flavor combinations`,
      cookTime: '20 mins',
      difficulty: 'Medium',
      servings: 3,
      ingredients: [
        ...(filteredMainIngredients.length > 0 ? filteredMainIngredients.slice(-2).map(ing => `2 cups ${ing}`) : ['Seasonal vegetables']),
        ...(filteredBaseIngredients.length > 0 ? filteredBaseIngredients.slice(-1).map(ing => `1 cup ${ing}`) : [`1 cup ${getDietaryAppropriateFlour()}`]),
        dietary === 'Keto' ? 'Avocado oil' : 'Coconut oil',
        dietary === 'Gluten-Free' ? 'Gluten-free tamari' : 'Soy sauce',
        'Ginger and garlic',
        'Lime juice and zest',
        'Sesame seeds for topping'
      ],
      instructions: [
        'Prepare ingredients with creative cuts and presentations',
        'Heat oil in a wok or large skillet',
        'Add aromatics (ginger, garlic) and stir-fry for 30 seconds',
        'Add main ingredients and cook with high heat for 3-4 minutes',
        'Add base ingredients and toss everything together',
        'Season with sauce, lime juice, and spices',
        'Cook for another 2-3 minutes until perfectly tender',
        'Garnish with sesame seeds and serve immediately'
      ]
    },
    {
      id: 5,
      title: `Simple ${dietary || ''} ${mealType || 'Classic'} Favorite`.trim(),
      image: mealType === 'Desserts' ? '🍪' : '❤️',
      description: `A simple yet delicious ${dietary ? dietary.toLowerCase() + ' ' : ''}version of a beloved classic`,
      cookTime: '30 mins',
      difficulty: 'Easy',
      servings: 4,
      ingredients: [
        ...(filteredBaseIngredients.length > 0 ? filteredBaseIngredients.slice(0, 1).map(ing => `2 cups ${ing}`) : [`2 cups ${getDietaryAppropriateFlour()}`]),
        ...(filteredMainIngredients.length > 1 ? filteredMainIngredients.slice(1, 3).map(ing => `1.5 cups ${ing}`) : ['Your favorite vegetables']),
        getDietaryAppropriateProtein(),
        dietary === 'Keto' ? 'MCT oil or ghee' : getDietaryAppropriateMilk(),
        'Traditional spice blend',
        dietary === 'Vegan' ? 'Nutritional yeast' : dietary === 'Vegetarian' ? 'Cheese (optional)' : 'Preferred seasonings',
        'Fresh parsley or cilantro'
      ],
      instructions: [
        'Preheat your cooking vessel and gather ingredients',
        'Begin with base ingredients and cook until golden',
        'Add main ingredients gradually, stirring gently',
        'Pour in liquid ingredients slowly while mixing',
        'Season with spices and let flavors meld for 15 minutes',
        'Adjust consistency and seasoning as desired',
        'Finish with fresh herbs',
        'Let rest for 5 minutes before serving'
      ]
    }
  ];

  // ADDITIONAL SAFETY CHECK: Remove any accidentally included restricted ingredients
  return recipes.map(recipe => ({
    ...recipe,
    ingredients: recipe.ingredients.map(ingredient => {
      const lower = ingredient.toLowerCase();
      
      // Vegetarian: Replace eggs and meat with plant-based alternatives
      if (dietary === 'Vegetarian') {
        if (lower.includes('egg')) {
          return ingredient.replace(/egg/gi, 'flax egg or chia egg');
        }
        if (lower.includes('meat') || lower.includes('chicken') || lower.includes('beef')) {
          return ingredient.replace(/meat|chicken|beef/gi, 'plant protein (tofu/tempeh)');
        }
      }
      
      // Vegan: Replace all animal products
      if (dietary === 'Vegan') {
        if (lower.includes('milk')) {
          return ingredient.replace(/milk/gi, 'plant milk');
        }
        if (lower.includes('cheese')) {
          return ingredient.replace(/cheese/gi, 'nutritional yeast');
        }
        if (lower.includes('butter')) {
          return ingredient.replace(/butter/gi, 'vegan butter');
        }
        if (lower.includes('egg')) {
          return ingredient.replace(/egg/gi, 'flax egg');
        }
      }
      
      // Gluten-Free: Replace gluten-containing ingredients
      if (dietary === 'Gluten-Free') {
        if (lower.includes('flour')) {
          return ingredient.replace(/flour/gi, 'gluten-free flour');
        }
        if (lower.includes('bread')) {
          return ingredient.replace(/bread/gi, 'gluten-free bread');
        }
      }
      
      return ingredient;
    }),
    title: recipe.title + (dietary === 'Vegetarian' && !recipe.title.includes('Egg-Free') ? ' (Egg-Free!)' : ''),
    description: recipe.description + (dietary === 'Vegetarian' ? ' Strictly no eggs or meat used.' : '')
  }));
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

    // Generate recipes
    const recipes = await generateRecipes({
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
