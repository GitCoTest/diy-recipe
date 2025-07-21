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
    console.log('🌐 Calling TheMealDB API for:', query);
    const response = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(query)}`);
    console.log('📡 TheMealDB response status:', response.status);
    
    if (!response.ok) {
      console.error('❌ TheMealDB API failed with status:', response.status);
      return null;
    }
    
    const data = await response.json();
    console.log('📊 TheMealDB data:', data);
    
    if (data.meals && data.meals.length > 0) {
      console.log('✅ Found TheMealDB image:', data.meals[0].strMealThumb);
      return data.meals[0].strMealThumb;
    }
    console.log('⚠️ No meals found in TheMealDB for:', query);
    return null;
  } catch (error) {
    console.error('💥 TheMealDB API error:', error);
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
    .replace(/\b(recipe|easy|quick|simple|homemade|delicious|eggless)\b/gi, '') // Remove common recipe words
    .trim();

  console.log('🔍 Searching for food image:', { original: title, cleaned: cleanTitle, ingredients: ingredientsText });

  // Try multiple search strategies with TheMealDB
  let imageUrl: string | null = null;
  
  // Strategy 1: Try exact title match
  imageUrl = await searchTheMealDB(cleanTitle);
  if (imageUrl) {
    console.log('✅ Found TheMealDB image with exact title match');
    return { imageUrl, source: 'themealdb', confidence: 0.9 };
  }

  // Strategy 2: Try key ingredients one by one
  const keyIngredients = ['chicken', 'beef', 'pasta', 'rice', 'fish', 'pork', 'shrimp', 'salmon', 'noodle'];
  for (const ingredient of keyIngredients) {
    if (ingredientsText.includes(ingredient)) {
      imageUrl = await searchTheMealDB(ingredient);
      if (imageUrl) {
        console.log(`✅ Found TheMealDB image with ingredient: ${ingredient}`);
        return { imageUrl, source: 'themealdb', confidence: 0.75 };
      }
    }
  }

  // Strategy 3: Try simplified recipe type
  const recipeTypes = ['pasta', 'cake', 'soup', 'chicken', 'beef', 'fish', 'rice'];
  for (const type of recipeTypes) {
    if (titleLower.includes(type)) {
      imageUrl = await searchTheMealDB(type);
      if (imageUrl) {
        console.log(`✅ Found TheMealDB image with recipe type: ${type}`);
        return { imageUrl, source: 'themealdb', confidence: 0.65 };
      }
    }
  }

  // Strategy 4: Try Spoonacular (premium) if available
  imageUrl = await searchSpoonacular(cleanTitle);
  if (imageUrl) {
    console.log('✅ Found Spoonacular image');
    return { imageUrl, source: 'spoonacular', confidence: 0.95 };
  }

  // Strategy 5: Fallback to our enhanced Unsplash mapping
  console.log('⚠️ Using Unsplash fallback mapping');
  const unsplashUrl = getUnsplashFoodImage(titleLower, ingredientsText);
  return {
    imageUrl: unsplashUrl,
    source: 'unsplash',
    confidence: 0.6
  };
};

// Enhanced Unsplash food image mapping (fallback)
const getUnsplashFoodImage = (titleLower: string, ingredientsText: string): string => {
  console.log('🎨 Fallback image mapping for:', titleLower, 'with ingredients:', ingredientsText);
  
  // Pasta dishes (very specific matching first)
  if (titleLower.includes('aglio') && titleLower.includes('olio')) {
    return 'https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=800&h=600&fit=crop&auto=format';
  }
  if (titleLower.includes('carbonara')) {
    return 'https://images.unsplash.com/photo-1572441713132-51c75654db73?w=800&h=600&fit=crop&auto=format';
  }
  if (titleLower.includes('spaghetti') || titleLower.includes('linguine') || titleLower.includes('pasta')) {
    return 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=800&h=600&fit=crop&auto=format';
  }
  
  // Desserts and baked goods
  if (titleLower.includes('mug cake') || (titleLower.includes('microwave') && titleLower.includes('cake'))) {
    return 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&h=600&fit=crop&auto=format';
  }
  if (titleLower.includes('chocolate') && titleLower.includes('cake')) {
    return 'https://images.unsplash.com/photo-1488477304112-4944851de03d?w=800&h=600&fit=crop&auto=format';
  }
  if (titleLower.includes('peanut butter') && titleLower.includes('cake')) {
    return 'https://images.unsplash.com/photo-1586985289688-ca3cf47d3e6e?w=800&h=600&fit=crop&auto=format';
  }
  if (titleLower.includes('brownie')) {
    return 'https://images.unsplash.com/photo-1556906918-a05b6e2c94ad?w=800&h=600&fit=crop&auto=format';
  }
  if (titleLower.includes('cookie')) {
    return 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=800&h=600&fit=crop&auto=format';
  }
  if (titleLower.includes('pancake')) {
    return 'https://images.unsplash.com/photo-1506084868230-bb9d95c24759?w=800&h=600&fit=crop&auto=format';
  }
  if (titleLower.includes('waffle')) {
    return 'https://images.unsplash.com/photo-1562376552-0d160dc2f296?w=800&h=600&fit=crop&auto=format';
  }
  
  // Pizza
  if (titleLower.includes('pizza')) {
    return 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&h=600&fit=crop&auto=format';
  }
  
  // Burgers and sandwiches
  if (titleLower.includes('burger') || titleLower.includes('sandwich')) {
    return 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&h=600&fit=crop&auto=format';
  }
  
  // Chicken dishes
  if (ingredientsText.includes('chicken') || titleLower.includes('chicken')) {
    return 'https://images.unsplash.com/photo-1532636248429-677dc5f02446?w=800&h=600&fit=crop&auto=format';
  }
  
  // Beef dishes
  if (ingredientsText.includes('beef') || titleLower.includes('beef') || titleLower.includes('steak')) {
    return 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&h=600&fit=crop&auto=format';
  }
  
  // Fish and seafood
  if (ingredientsText.includes('fish') || ingredientsText.includes('salmon') || ingredientsText.includes('shrimp')) {
    return 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=800&h=600&fit=crop&auto=format';
  }
  
  // Rice dishes
  if (titleLower.includes('fried rice')) {
    return 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=800&h=600&fit=crop&auto=format';
  }
  if (titleLower.includes('risotto')) {
    return 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=800&h=600&fit=crop&auto=format';
  }
  if (titleLower.includes('rice') || ingredientsText.includes('rice')) {
    return 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=800&h=600&fit=crop&auto=format';
  }
  
  // Soups and stews
  if (titleLower.includes('soup') || titleLower.includes('stew') || titleLower.includes('chili')) {
    return 'https://images.unsplash.com/photo-1547592180-85f173990554?w=800&h=600&fit=crop&auto=format';
  }
  
  // Salads (only if explicitly salad)
  if (titleLower.includes('salad')) {
    return 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&h=600&fit=crop&auto=format';
  }
  
  // Breakfast items
  if (titleLower.includes('french toast') || titleLower.includes('toast')) {
    return 'https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=800&h=600&fit=crop&auto=format';
  }
  if (titleLower.includes('oatmeal') || titleLower.includes('porridge')) {
    return 'https://images.unsplash.com/photo-1517673132405-a56a62b18caf?w=800&h=600&fit=crop&auto=format';
  }
  if (titleLower.includes('eggs') || titleLower.includes('omelet')) {
    return 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=800&h=600&fit=crop&auto=format';
  }
  
  // Mexican food
  if (titleLower.includes('taco') || titleLower.includes('burrito') || titleLower.includes('quesadilla')) {
    return 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800&h=600&fit=crop&auto=format';
  }
  
  // Asian cuisine
  if (titleLower.includes('stir fry') || titleLower.includes('noodle')) {
    return 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&h=600&fit=crop&auto=format';
  }
  
  // Default to a beautiful, diverse food spread (NOT salad!)
  console.log('⚠️ Using generic delicious food fallback for:', titleLower);
  return 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=600&fit=crop&auto=format';
};

// Cache results to avoid repeated API calls (with debugging)
const imageCache = new Map<string, FoodImageResult>();

export const getCachedFoodImage = async (title: string, ingredients: string[]): Promise<FoodImageResult> => {
  const cacheKey = `${title}-${ingredients.join(',')}`;
  
  if (imageCache.has(cacheKey)) {
    const cached = imageCache.get(cacheKey)!;
    console.log('📋 Using cached image:', cached.source, cached.imageUrl);
    return cached;
  }
  
  const result = await getFoodImage(title, ingredients);
  imageCache.set(cacheKey, result);
  console.log('💾 Cached new image result:', result);
  
  return result;
};

// Clear cache function for debugging
export const clearImageCache = () => {
  imageCache.clear();
  console.log('🗑️ Image cache cleared');
};
