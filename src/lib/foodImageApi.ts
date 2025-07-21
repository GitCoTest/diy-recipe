// Advanced Food Image API Integration
// Combines multiple food databases for the best image matching

interface FoodImageResult {
  imageUrl: string;
  source: 'themealdb' | 'spoonacular' | 'unsplash' | 'fallback';
  confidence: number;
}

// TheMealDB API (Free)
const searchTheMealDB = async (query: string): Promise<string | null> => {
  try {
    const response = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(query)}`);
    const data = await response.json();
    
    if (data.meals && data.meals.length > 0) {
      return data.meals[0].strMealThumb;
    }
    return null;
  } catch (error) {
    console.error('TheMealDB API error:', error);
    return null;
  }
};

// Spoonacular API (Premium - requires API key)
const searchSpoonacular = async (query: string): Promise<string | null> => {
  const apiKey = process.env.NEXT_PUBLIC_SPOONACULAR_API_KEY;
  if (!apiKey) return null;

  try {
    const response = await fetch(
      `https://api.spoonacular.com/recipes/complexSearch?query=${encodeURIComponent(query)}&apiKey=${apiKey}&number=1&addRecipeInformation=true`
    );
    const data = await response.json();
    
    if (data.results && data.results.length > 0) {
      return data.results[0].image;
    }
    return null;
  } catch (error) {
    console.error('Spoonacular API error:', error);
    return null;
  }
};

// Smart food image search with multiple sources
export const getFoodImage = async (title: string, ingredients: string[]): Promise<FoodImageResult> => {
  const titleLower = title.toLowerCase();
  const ingredientsText = ingredients.join(' ').toLowerCase();
  
  // Clean up the recipe title for better API searching
  const cleanTitle = title
    .replace(/[^\w\s]/g, '') // Remove special characters
    .replace(/\b(recipe|easy|quick|simple|homemade|delicious)\b/gi, '') // Remove common recipe words
    .trim();

  console.log('🔍 Searching for food image:', cleanTitle);

  // Try TheMealDB first (free)
  let imageUrl = await searchTheMealDB(cleanTitle);
  if (imageUrl) {
    return {
      imageUrl,
      source: 'themealdb',
      confidence: 0.9
    };
  }

  // Try with main ingredient if title search failed
  const mainIngredients = ['chicken', 'beef', 'pasta', 'rice', 'fish', 'pork', 'shrimp', 'salmon'];
  for (const ingredient of mainIngredients) {
    if (ingredientsText.includes(ingredient)) {
      imageUrl = await searchTheMealDB(ingredient);
      if (imageUrl) {
        return {
          imageUrl,
          source: 'themealdb',
          confidence: 0.7
        };
      }
    }
  }

  // Try Spoonacular (premium) if available
  imageUrl = await searchSpoonacular(cleanTitle);
  if (imageUrl) {
    return {
      imageUrl,
      source: 'spoonacular',
      confidence: 0.95
    };
  }

  // Fallback to our existing Unsplash mapping (enhanced)
  const unsplashUrl = getUnsplashFoodImage(titleLower, ingredientsText);
  return {
    imageUrl: unsplashUrl,
    source: 'unsplash',
    confidence: 0.6
  };
};

// Enhanced Unsplash food image mapping (fallback)
const getUnsplashFoodImage = (titleLower: string, ingredientsText: string): string => {
  // More comprehensive mapping with food-specific Unsplash collections
  
  // Pasta dishes
  if (titleLower.includes('pasta') || titleLower.includes('spaghetti') || titleLower.includes('linguine')) {
    return 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=800&h=600&fit=crop&auto=format';
  }
  
  // Pizza
  if (titleLower.includes('pizza')) {
    return 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&h=600&fit=crop&auto=format';
  }
  
  // Burgers
  if (titleLower.includes('burger') || titleLower.includes('sandwich')) {
    return 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&h=600&fit=crop&auto=format';
  }
  
  // Chicken dishes
  if (ingredientsText.includes('chicken') || titleLower.includes('chicken')) {
    return 'https://images.unsplash.com/photo-1532636248429-677dc5f02446?w=800&h=600&fit=crop&auto=format';
  }
  
  // Rice dishes
  if (titleLower.includes('rice') || titleLower.includes('risotto')) {
    return 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=800&h=600&fit=crop&auto=format';
  }
  
  // Soups
  if (titleLower.includes('soup') || titleLower.includes('stew')) {
    return 'https://images.unsplash.com/photo-1547592180-85f173990554?w=800&h=600&fit=crop&auto=format';
  }
  
  // Salads
  if (titleLower.includes('salad')) {
    return 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&h=600&fit=crop&auto=format';
  }
  
  // Desserts and cakes
  if (titleLower.includes('cake') || titleLower.includes('dessert') || titleLower.includes('sweet')) {
    return 'https://images.unsplash.com/photo-1488477304112-4944851de03d?w=800&h=600&fit=crop&auto=format';
  }
  
  // Breakfast items
  if (titleLower.includes('pancake') || titleLower.includes('waffle') || titleLower.includes('breakfast')) {
    return 'https://images.unsplash.com/photo-1506084868230-bb9d95c24759?w=800&h=600&fit=crop&auto=format';
  }
  
  // Generic delicious food
  return 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=800&h=600&fit=crop&auto=format';
};

// Cache results to avoid repeated API calls
const imageCache = new Map<string, FoodImageResult>();

export const getCachedFoodImage = async (title: string, ingredients: string[]): Promise<FoodImageResult> => {
  const cacheKey = `${title}-${ingredients.join(',')}`;
  
  if (imageCache.has(cacheKey)) {
    return imageCache.get(cacheKey)!;
  }
  
  const result = await getFoodImage(title, ingredients);
  imageCache.set(cacheKey, result);
  
  return result;
};
