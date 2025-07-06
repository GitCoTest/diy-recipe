import { NextRequest, NextResponse } from 'next/server';

// Common ingredients list for offline validation
const COMMON_INGREDIENTS = [
  // Vegetables
  'tomato', 'onion', 'garlic', 'ginger', 'potato', 'carrot', 'bell pepper', 'spinach', 
  'lettuce', 'cucumber', 'broccoli', 'cauliflower', 'cabbage', 'celery', 'zucchini',
  'eggplant', 'mushroom', 'corn', 'peas', 'beans', 'lentils', 'chickpeas', 'okra',
  'bottle gourd', 'bitter gourd', 'ridge gourd', 'snake gourd', 'pumpkin', 'squash',
  'radish', 'turnip', 'beetroot', 'sweet potato', 'asparagus', 'artichoke',
  
  // Fruits
  'apple', 'banana', 'orange', 'lemon', 'lime', 'mango', 'pineapple', 'grapes',
  'strawberry', 'blueberry', 'raspberry', 'blackberry', 'cherry', 'peach', 'pear',
  'plum', 'kiwi', 'papaya', 'watermelon', 'cantaloupe', 'avocado', 'coconut',
  
  // Proteins
  'chicken', 'beef', 'pork', 'lamb', 'fish', 'salmon', 'tuna', 'shrimp', 'crab',
  'lobster', 'eggs', 'tofu', 'paneer', 'cottage cheese', 
  
  // Grains & Starches
  'rice', 'wheat', 'flour', 'bread', 'pasta', 'noodles', 'oats', 'quinoa', 'barley',
  'millet', 'buckwheat', 'corn flour', 'semolina', 'couscous',
  
  // Dairy
  'milk', 'cheese', 'butter', 'cream', 'yogurt', 'sour cream', 'mozzarella', 'cheddar',
  'parmesan', 'feta', 'ricotta', 'cream cheese',
  
  // Spices & Herbs
  'salt', 'pepper', 'cumin', 'coriander', 'turmeric', 'paprika', 'cinnamon', 'cardamom',
  'cloves', 'nutmeg', 'bay leaves', 'thyme', 'rosemary', 'basil', 'oregano', 'parsley',
  'cilantro', 'mint', 'dill', 'sage', 'garam masala', 'curry powder',
  
  // Oils & Fats
  'olive oil', 'vegetable oil', 'coconut oil', 'butter', 'ghee', 'sesame oil',
  
  // Nuts & Seeds
  'almonds', 'walnuts', 'cashews', 'pistachios', 'peanuts', 'sesame seeds', 
  'sunflower seeds', 'pumpkin seeds', 'chia seeds', 'flax seeds',
  
  // Others
  'honey', 'sugar', 'brown sugar', 'maple syrup', 'vanilla', 'chocolate', 'cocoa',
  'vinegar', 'soy sauce', 'tomato sauce', 'coconut milk', 'stock', 'broth'
];

function validateIngredientOffline(ingredient: string) {
  const normalizedIngredient = ingredient.toLowerCase().trim();
  
  // Check if it looks like a nonsense ingredient (just repeating characters or random text)
  if (normalizedIngredient.length < 2) {
    return {
      valid: false,
      name: ingredient,
      category: 'unknown',
      emoji: '❌',
      reason: 'Ingredient name too short'
    };
  }
  
  // Check for obvious nonsense patterns
  const isNonsense = /^(.)\1{3,}$/.test(normalizedIngredient) || // aaaa, bbbb, etc.
                    /^[^a-z\s]+$/.test(normalizedIngredient) || // Only numbers/symbols
                    normalizedIngredient.includes('xxx') ||
                    normalizedIngredient.includes('zzz');
  
  if (isNonsense) {
    return {
      valid: false,
      name: ingredient,
      category: 'unknown',
      emoji: '❌',
      reason: 'Not a valid ingredient name'
    };
  }
  
  // Check if it's in our common ingredients list
  const isCommon = COMMON_INGREDIENTS.some(common => 
    normalizedIngredient.includes(common) || common.includes(normalizedIngredient)
  );
  
  if (isCommon) {
    return {
      valid: true,
      name: ingredient.charAt(0).toUpperCase() + ingredient.slice(1).toLowerCase(),
      category: getCategoryFromIngredient(normalizedIngredient),
      emoji: getEmojiFromIngredient(normalizedIngredient),
      reason: 'Validated from common ingredients database'
    };
  }
  
  // For unknown but reasonable-looking ingredients, we'll still validate them
  // but mark them as unverified
  if (normalizedIngredient.length >= 3 && /^[a-z\s]+$/.test(normalizedIngredient)) {
    return {
      valid: true,
      name: ingredient.charAt(0).toUpperCase() + ingredient.slice(1).toLowerCase(),
      category: 'main', // Default to main
      emoji: '🥄',
      reason: 'Added as custom ingredient (offline validation)'
    };
  }
  
  // Reject anything else as invalid
  return {
    valid: false,
    name: ingredient,
    category: 'unknown',
    emoji: '❌',
    reason: 'Not a valid cooking ingredient'
  };
}

function getCategoryFromIngredient(ingredient: string): string {
  const baseIngredients = ['rice', 'flour', 'wheat', 'bread', 'pasta', 'noodles', 'oats', 'quinoa', 'barley', 'millet', 'buckwheat', 'couscous', 'semolina'];
  
  if (baseIngredients.some(base => ingredient.includes(base) || base.includes(ingredient))) {
    return 'base';
  }
  return 'main';
}

function getEmojiFromIngredient(ingredient: string): string {
  const emojiMap: { [key: string]: string } = {
    'tomato': '🍅', 'onion': '🧅', 'garlic': '🧄', 'potato': '🥔', 'carrot': '🥕',
    'bell pepper': '🫑', 'spinach': '🥬', 'lettuce': '🥬', 'cucumber': '🥒',
    'broccoli': '🥦', 'corn': '🌽', 'eggplant': '🍆', 'mushroom': '🍄',
    'bottle gourd': '🥒', 'bitter gourd': '🥒', 'pumpkin': '🎃',
    'apple': '🍎', 'banana': '🍌', 'orange': '🍊', 'lemon': '🍋', 'mango': '🥭',
    'grapes': '🍇', 'strawberry': '🍓', 'watermelon': '🍉', 'avocado': '🥑',
    'chicken': '🍗', 'beef': '🥩', 'fish': '🐟', 'shrimp': '🍤', 'eggs': '🥚',
    'milk': '🥛', 'cheese': '🧀', 'butter': '🧈', 'bread': '🍞', 'rice': '🍚',
    'pasta': '🍝', 'flour': '🌾', 'honey': '🍯', 'chocolate': '🍫'
  };
  
  for (const [key, emoji] of Object.entries(emojiMap)) {
    if (ingredient.includes(key) || key.includes(ingredient)) {
      return emoji;
    }
  }
  
  return '🥄'; // Default emoji
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ingredient } = body;

    if (!ingredient || typeof ingredient !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Ingredient name is required' },
        { status: 400 }
      );
    }

    console.log("🔍 BACKEND: Validating ingredient:", ingredient);

    // Try offline validation first (this will work for common ingredients)
    const offlineValidation = validateIngredientOffline(ingredient);
    console.log("✅ BACKEND: Offline validation result:", offlineValidation);
    
    return NextResponse.json({
      success: true,
      validation: offlineValidation
    });

  } catch (error) {
    console.error("❌ BACKEND: Error validating ingredient:", error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to validate ingredient'
      },
      { status: 500 }
    );
  }
}
