import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { getCachedFoodImage } from '@/lib/foodImageApi';

interface Recipe {
  title: string;
  ingredients: string[];
  instructions: string[];
  prepTime?: string;
  cookTime?: string;
  difficulty?: string;
  description?: string;
  servings?: number;
  image?: string;
  totalTime?: string;
  cuisine?: string;
  tags?: string[];
  rating?: number;
  reviews?: number;
}

interface RecipeCardProps {
  recipe: Recipe;
  onClose?: () => void;
}

export default function RecipeCard({ recipe, onClose }: RecipeCardProps) {
  const [showSavedPopup, setShowSavedPopup] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [isAlreadySaved, setIsAlreadySaved] = useState(false);
  const [checkingSavedStatus, setCheckingSavedStatus] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [dynamicImageUrl, setDynamicImageUrl] = useState<string>('');

  // Check if recipe is already saved when component mounts
  useEffect(() => {
    const checkSavedStatus = async () => {
      if (!onClose) return; // Only check for modal version
      
      setCheckingSavedStatus(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const res = await fetch(`/api/recipes/check?userId=${user.id}&title=${encodeURIComponent(recipe.title)}`);
        const result = await res.json();
        if (result.success) {
          setIsAlreadySaved(result.isSaved);
        }
      } catch (error) {
        console.error('Error checking saved status:', error);
      } finally {
        setCheckingSavedStatus(false);
      }
    };

    checkSavedStatus();
  }, [recipe.title, onClose]);

  // Load dynamic food image
  useEffect(() => {
    const loadFoodImage = async () => {
      if (!recipe.image) { // Only fetch if no image is provided
        try {
          // First try our enhanced local mapping for immediate results
          const localImage = getLocalFoodImage(recipe.title, recipe.ingredients);
          if (localImage) {
            setDynamicImageUrl(localImage);
            console.log('🎯 Using enhanced local food image mapping');
            return;
          }
          
          // Fallback to API if local mapping doesn't find anything
          const imageResult = await getCachedFoodImage(recipe.title, recipe.ingredients);
          setDynamicImageUrl(imageResult.imageUrl);
          console.log(`🖼️ Loaded ${imageResult.source} image with ${Math.round(imageResult.confidence * 100)}% confidence`);
        } catch (error) {
          console.error('Error loading food image:', error);
          // Final fallback to existing logic
          setDynamicImageUrl(getRecipeImageUrl(recipe.title, recipe.ingredients));
        }
      }
    };

    loadFoodImage();
  }, [recipe.title, recipe.ingredients, recipe.image]);

  const handleSave = async () => {
    setSaving(true);
    setError('');
    
    // Get user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      // Show custom login prompt modal
      setShowLoginPrompt(true);
      setSaving(false);
      return;
    }
    
    try {
      const res = await fetch('/api/recipes/saved', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, recipe }),
      });
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const result = await res.json();
        if (result.success) {
          setShowSavedPopup(true);
          setTimeout(() => setShowSavedPopup(false), 1200);
          setIsAlreadySaved(true); // Update the saved status
        } else {
          setError(result.message || result.error || 'Failed to save recipe.');
        }
      } else {
        const text = await res.text();
        setError('Server error: ' + text.substring(0, 200));
        console.error('Non-JSON response:', text);
      }
    } catch (e: unknown) {
      const error = e as Error;
      setError(error.message || 'Failed to save recipe.');
    }
    setSaving(false);
  };

  // Enhanced local food image mapping (immediate, no API calls)
  const getLocalFoodImage = (title: string, ingredients: string[]) => {
    const titleLower = title.toLowerCase();
    const ingredientsText = ingredients.join(' ').toLowerCase();
    
    console.log('🎯 Local image mapping for:', titleLower);
    
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
    
    // Beef dishes
    if (ingredientsText.includes('beef') || titleLower.includes('beef')) {
      return 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&h=600&fit=crop&auto=format';
    }
    
    // Rice dishes
    if (titleLower.includes('fried rice')) {
      return 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=800&h=600&fit=crop&auto=format';
    }
    if (titleLower.includes('rice') || ingredientsText.includes('rice')) {
      return 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=800&h=600&fit=crop&auto=format';
    }
    
    // Soups
    if (titleLower.includes('soup') || titleLower.includes('stew')) {
      return 'https://images.unsplash.com/photo-1547592180-85f173990554?w=800&h=600&fit=crop&auto=format';
    }
    
    // Fish
    if (ingredientsText.includes('fish') || ingredientsText.includes('salmon')) {
      return 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=800&h=600&fit=crop&auto=format';
    }
    
    // Only return salad for actual salads
    if (titleLower.includes('salad')) {
      return 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&h=600&fit=crop&auto=format';
    }
    
    // Return null if no specific match (let API handle it)
    return null;
  };

  // Function to get recipe-specific image URL
  const getRecipeImageUrl = (title: string, ingredients: string[]) => {
    const titleLower = title.toLowerCase();
    const ingredientsText = ingredients.join(' ').toLowerCase();
    
    // Recipe-specific image mapping - prioritize specific dishes first
    
    // Baked goods and desserts (most specific first)
    if (titleLower.includes('protein') && (titleLower.includes('shake') || titleLower.includes('smoothie'))) {
      return 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=800&h=600&fit=crop';
    }
    if (titleLower.includes('brownie') || (titleLower.includes('chocolate') && titleLower.includes('square'))) {
      return 'https://images.unsplash.com/photo-1556906918-a05b6e2c94ad?w=800&h=600&fit=crop';
    }
    if (titleLower.includes('mug cake') || (titleLower.includes('microwave') && titleLower.includes('cake'))) {
      return 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&h=600&fit=crop';
    }
    if (titleLower.includes('chocolate chip') && titleLower.includes('cookie')) {
      return 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=800&h=600&fit=crop';
    }
    if (titleLower.includes('pancake') || titleLower.includes('hotcake')) {
      return 'https://images.unsplash.com/photo-1506084868230-bb9d95c24759?w=800&h=600&fit=crop';
    }
    if (titleLower.includes('waffle')) {
      return 'https://images.unsplash.com/photo-1562376552-0d160dc2f296?w=800&h=600&fit=crop';
    }
    if (titleLower.includes('french toast')) {
      return 'https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=800&h=600&fit=crop';
    }
    if (titleLower.includes('oatmeal') || titleLower.includes('porridge') || titleLower.includes('overnight oats')) {
      return 'https://images.unsplash.com/photo-1517673132405-a56a62b18caf?w=800&h=600&fit=crop';
    }
    
    // Pasta dishes (very specific matching)
    if (titleLower.includes('spaghetti') && (ingredientsText.includes('tomato') || titleLower.includes('marinara') || titleLower.includes('sauce'))) {
      return 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=800&h=600&fit=crop';
    }
    if (titleLower.includes('pasta') && (ingredientsText.includes('tomato') || titleLower.includes('marinara'))) {
      return 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=800&h=600&fit=crop';
    }
    if (titleLower.includes('pasta') && (titleLower.includes('aglio') || titleLower.includes('garlic'))) {
      return 'https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=800&h=600&fit=crop';
    }
    if (titleLower.includes('pasta') && (titleLower.includes('cream') || ingredientsText.includes('cream'))) {
      return 'https://images.unsplash.com/photo-1572441713132-51c75654db73?w=800&h=600&fit=crop';
    }
    if (titleLower.includes('spaghetti') || titleLower.includes('linguine') || titleLower.includes('fettuccine')) {
      return 'https://images.unsplash.com/photo-1598866594230-a7c12756260f?w=800&h=600&fit=crop';
    }
    if ((titleLower.includes('mac') && titleLower.includes('cheese')) || titleLower.includes('macaroni')) {
      return 'https://images.unsplash.com/photo-1471282334269-facbaf40b3b7?w=800&h=600&fit=crop';
    }
    if (titleLower.includes('pasta') || titleLower.includes('penne') || titleLower.includes('rigatoni')) {
      return 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=800&h=600&fit=crop';
    }
    
    // Rice dishes
    if (titleLower.includes('fried rice') || (titleLower.includes('rice') && (ingredientsText.includes('soy') || ingredientsText.includes('egg')))) {
      return 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=800&h=600&fit=crop';
    }
    if (titleLower.includes('risotto')) {
      return 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=800&h=600&fit=crop';
    }
    if (titleLower.includes('rice') && (titleLower.includes('bowl') || titleLower.includes('pilaf'))) {
      return 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=800&h=600&fit=crop';
    }
    
    // Soups and liquid dishes
    if (titleLower.includes('soup') || titleLower.includes('bisque') || titleLower.includes('chowder')) {
      return 'https://images.unsplash.com/photo-1547592180-85f173990554?w=800&h=600&fit=crop';
    }
    if (titleLower.includes('ramen') || titleLower.includes('noodle soup')) {
      return 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&h=600&fit=crop';
    }
    
    // Salads and fresh dishes
    if (titleLower.includes('salad') && !titleLower.includes('fruit')) {
      return 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&h=600&fit=crop';
    }
    if (titleLower.includes('fruit salad')) {
      return 'https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=800&h=600&fit=crop';
    }
    
    // Baked goods
    if (titleLower.includes('cookie') && !titleLower.includes('dough')) {
      return 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=800&h=600&fit=crop';
    }
    if (titleLower.includes('cake') && !titleLower.includes('mug') && !titleLower.includes('cup')) {
      return 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=800&h=600&fit=crop';
    }
    if (titleLower.includes('cupcake')) {
      return 'https://images.unsplash.com/photo-1420730614543-e39f93df1ed6?w=800&h=600&fit=crop';
    }
    if (titleLower.includes('muffin')) {
      return 'https://images.unsplash.com/photo-1607958996333-41aef7caefaa?w=800&h=600&fit=crop';
    }
    if (titleLower.includes('bread') && !titleLower.includes('crumb')) {
      return 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&h=600&fit=crop';
    }
    if (titleLower.includes('donut') || titleLower.includes('doughnut')) {
      return 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=800&h=600&fit=crop';
    }
    
    // Main dishes
    if (titleLower.includes('pizza')) {
      return 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&h=600&fit=crop';
    }
    if (titleLower.includes('burger') || titleLower.includes('sandwich')) {
      return 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&h=600&fit=crop';
    }
    if (titleLower.includes('taco') || titleLower.includes('burrito')) {
      return 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800&h=600&fit=crop';
    }
    if (titleLower.includes('stir fry') || titleLower.includes('stir-fry')) {
      return 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=800&h=600&fit=crop';
    }
    if (titleLower.includes('curry') || titleLower.includes('dal')) {
      return 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&h=600&fit=crop';
    }
    if (titleLower.includes('fried rice') || (titleLower.includes('rice') && ingredientsText.includes('soy'))) {
      return 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=800&h=600&fit=crop';
    }
    if (titleLower.includes('risotto')) {
      return 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=800&h=600&fit=crop';
    }
    if (titleLower.includes('quinoa')) {
      return 'https://images.unsplash.com/photo-1505253213348-cd54c92b37ed?w=800&h=600&fit=crop';
    }
    
    // Chicken dishes
    if (titleLower.includes('chicken') && titleLower.includes('wing')) {
      return 'https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=800&h=600&fit=crop';
    }
    if (titleLower.includes('chicken') && !titleLower.includes('wing')) {
      return 'https://images.unsplash.com/photo-1532636248429-677dc5f02446?w=800&h=600&fit=crop';
    }
    
    // Beverages and smoothies
    if (titleLower.includes('smoothie') || titleLower.includes('shake')) {
      return 'https://images.unsplash.com/photo-1505252585461-04db1eb84625?w=800&h=600&fit=crop';
    }
    if (titleLower.includes('juice') || titleLower.includes('drink')) {
      return 'https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=800&h=600&fit=crop';
    }
    if (titleLower.includes('coffee') || titleLower.includes('latte')) {
      return 'https://images.unsplash.com/photo-1497636577773-f1231844b336?w=800&h=600&fit=crop';
    }
    
    // Default fallback based on meal type or ingredients
    if (titleLower.includes('breakfast')) {
      return 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=800&h=600&fit=crop';
    }
    if (titleLower.includes('dessert') || titleLower.includes('sweet')) {
      return 'https://images.unsplash.com/photo-1488477304112-4944851de03d?w=800&h=600&fit=crop';
    }
    if (titleLower.includes('snack')) {
      return 'https://images.unsplash.com/photo-1559054663-e433dc16b6e9?w=800&h=600&fit=crop';
    }
    
    // Check for specific ingredients in fallback
    if (ingredientsText.includes('chicken')) {
      return 'https://images.unsplash.com/photo-1532636248429-677dc5f02446?w=800&h=600&fit=crop';
    }
    if (ingredientsText.includes('beef') || ingredientsText.includes('steak')) {
      return 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&h=600&fit=crop';
    }
    if (ingredientsText.includes('fish') || ingredientsText.includes('salmon')) {
      return 'https://images.unsplash.com/photo-1544943910-4c1dc44aab44?w=800&h=600&fit=crop';
    }
    
    // Generic food image as final fallback
    return 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=800&h=600&fit=crop';
  };

  // Function to generate smart notes based on recipe content
  const generateSmartNotes = (title: string, ingredients: string[], instructions: string[]) => {
    const notes: string[] = [];
    const titleLower = title.toLowerCase();
    const ingredientsText = ingredients.join(' ').toLowerCase();
    const instructionsText = instructions.join(' ').toLowerCase();
    
    // Allergy warnings - only show if allergens are present
    const allergens = [];
    if (ingredientsText.includes('peanut') || ingredientsText.includes('nut')) allergens.push('nuts');
    if (ingredientsText.includes('milk') || ingredientsText.includes('cream') || ingredientsText.includes('cheese') || ingredientsText.includes('butter')) allergens.push('dairy');
    if (ingredientsText.includes('egg')) allergens.push('eggs');
    if (ingredientsText.includes('wheat') || ingredientsText.includes('flour')) allergens.push('gluten');
    if (ingredientsText.includes('soy')) allergens.push('soy');
    if (ingredientsText.includes('shellfish') || ingredientsText.includes('shrimp') || ingredientsText.includes('crab')) allergens.push('shellfish');
    
    if (allergens.length > 0) {
      notes.push(`⚠️ **Allergy Warning:** Contains ${allergens.join(', ')}.`);
    }
    
    // Substitution suggestions - context-aware
    if (ingredientsText.includes('butter') && !titleLower.includes('brownie') && !titleLower.includes('pastry')) {
      notes.push(`🔄 **Substitute:** Replace butter with coconut oil or vegan butter for dairy-free option.`);
    }
    if (ingredientsText.includes('milk') && !ingredientsText.includes('coconut')) {
      notes.push(`🔄 **Substitute:** Use almond, oat, or soy milk for dairy-free version.`);
    }
    if (ingredientsText.includes('egg') && !titleLower.includes('protein') && !titleLower.includes('meringue')) {
      notes.push(`🔄 **Substitute:** Replace eggs with flax eggs (1 tbsp ground flaxseed + 3 tbsp water per egg) for vegan option.`);
    }
    if (ingredientsText.includes('honey') && !titleLower.includes('marinade')) {
      notes.push(`🔄 **Substitute:** Use maple syrup or agave nectar for vegan option.`);
    }
    if (ingredientsText.includes('heavy cream')) {
      notes.push(`🔄 **Substitute:** Use coconut cream or cashew cream for dairy-free richness.`);
    }
    
    // Serving suggestions - only for appropriate dishes
    if (titleLower.includes('soup') || titleLower.includes('bisque') || titleLower.includes('chowder')) {
      notes.push(`🍞 **Serving Suggestion:** Pairs wonderfully with crusty bread, crackers, or grilled cheese sandwich.`);
    }
    if (titleLower.includes('pasta') && !titleLower.includes('salad')) {
      notes.push(`🧄 **Serving Suggestion:** Serve with garlic bread and a fresh green salad.`);
    }
    if (titleLower.includes('curry') || titleLower.includes('dal')) {
      notes.push(`🍚 **Serving Suggestion:** Best served over steamed rice, quinoa, or with naan bread.`);
    }
    if (titleLower.includes('stir fry') || titleLower.includes('stir-fry')) {
      notes.push(`🍚 **Serving Suggestion:** Serve over jasmine rice, brown rice, or noodles.`);
    }
    if (titleLower.includes('salad') && !titleLower.includes('fruit')) {
      notes.push(`🥗 **Serving Suggestion:** Add protein like grilled chicken, chickpeas, or tofu for a complete meal.`);
    }
    if (titleLower.includes('smoothie') || titleLower.includes('shake')) {
      notes.push(`🥤 **Serving Suggestion:** Perfect post-workout drink or healthy breakfast on-the-go.`);
    }
    if (titleLower.includes('risotto')) {
      notes.push(`🍷 **Serving Suggestion:** Pairs beautifully with a crisp white wine and fresh herbs.`);
    }
    if (titleLower.includes('taco') || titleLower.includes('burrito')) {
      notes.push(`🌶️ **Serving Suggestion:** Serve with fresh salsa, guacamole, and lime wedges.`);
    }
    
    // Storage tips - practical and specific
    if (titleLower.includes('cookie') || titleLower.includes('brownie') || titleLower.includes('bar')) {
      notes.push(`📦 **Storage:** Store in airtight container at room temperature for up to 5 days.`);
    }
    if (titleLower.includes('soup') || titleLower.includes('curry') || titleLower.includes('stew')) {
      notes.push(`❄️ **Storage:** Refrigerate for up to 4 days or freeze for up to 3 months.`);
    }
    if (titleLower.includes('smoothie') || titleLower.includes('shake') || titleLower.includes('juice')) {
      notes.push(`🧊 **Storage:** Best consumed immediately. Can be stored in fridge for up to 24 hours.`);
    }
    if (titleLower.includes('mug cake') || titleLower.includes('microwave')) {
      notes.push(`⏰ **Storage:** Best enjoyed fresh and warm. Can be stored covered for 1 day.`);
    }
    if (titleLower.includes('salad') && !instructionsText.includes('cook')) {
      notes.push(`🥬 **Storage:** Best consumed fresh. Dressing should be added just before serving.`);
    }
    if (titleLower.includes('bread') || titleLower.includes('muffin')) {
      notes.push(`🍞 **Storage:** Store covered at room temperature for 2-3 days, or freeze for up to 3 months.`);
    }
    
    // Cooking tips - technique-specific
    if (instructionsText.includes('microwave')) {
      notes.push(`⚡ **Tip:** Microwave power varies - start with less time and add more as needed.`);
    }
    if (instructionsText.includes('freeze') || ingredientsText.includes('frozen')) {
      notes.push(`🧊 **Tip:** For best texture, use frozen ingredients directly from freezer.`);
    }
    if (titleLower.includes('protein') && ingredientsText.includes('powder')) {
      notes.push(`💪 **Tip:** Feel free to use your favorite protein powder flavor.`);
    }
    if (instructionsText.includes('fold') || titleLower.includes('cake')) {
      notes.push(`🥄 **Tip:** Fold gently to maintain airiness - overmixing can make it dense.`);
    }
    if (titleLower.includes('pasta') && instructionsText.includes('water')) {
      notes.push(`🧂 **Tip:** Salt your pasta water generously - it should taste like the sea!`);
    }
    if (titleLower.includes('rice') && !titleLower.includes('fried')) {
      notes.push(`🍚 **Tip:** Rinse rice until water runs clear for fluffier results.`);
    }
    if (ingredientsText.includes('garlic') && instructionsText.includes('cook')) {
      notes.push(`🧄 **Tip:** Don't let garlic brown too much or it will become bitter.`);
    }
    if (ingredientsText.includes('onion') && instructionsText.includes('sauté')) {
      notes.push(`🧅 **Tip:** Cook onions low and slow for the best caramelized flavor.`);
    }
    
    // Preparation tips
    if (titleLower.includes('cake') || titleLower.includes('muffin') || titleLower.includes('bread')) {
      notes.push(`🌡️ **Tip:** Bring ingredients to room temperature for better mixing and texture.`);
    }
    if (ingredientsText.includes('meat') || titleLower.includes('chicken') || titleLower.includes('beef')) {
      notes.push(`🌡️ **Safety:** Use a meat thermometer to ensure proper internal temperature.`);
    }
    
    return notes;
  };
  const shareRecipe = (platform: string) => {
    const recipeText = `Check out this amazing recipe: ${recipe.title}!\n\n${recipe.description || ''}\n\nIngredients:\n${recipe.ingredients.slice(0, 3).join('\n')}${recipe.ingredients.length > 3 ? '\n...and more!' : ''}\n\nGenerated by DIY Recipe Generator 🍽️`;
    const encodedText = encodeURIComponent(recipeText);
    const currentUrl = window.location.href;
    
    switch (platform) {
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodedText}`, '_blank');
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodedText}`, '_blank');
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodedText}`, '_blank');
        break;
      case 'instagram':
        // Instagram doesn't have direct sharing API, so we'll copy to clipboard
        navigator.clipboard.writeText(recipeText);
        alert('Recipe copied to clipboard! You can now paste it on Instagram.');
        break;
      case 'telegram':
        window.open(`https://t.me/share/url?url=${currentUrl}&text=${encodedText}`, '_blank');
        break;
      case 'email':
        window.open(`mailto:?subject=${encodeURIComponent('Check out this recipe!')}&body=${encodedText}`, '_blank');
        break;
      case 'copy':
        navigator.clipboard.writeText(recipeText);
        alert('Recipe copied to clipboard!');
        break;
      default:
        // Native sharing if available
        if (navigator.share) {
          navigator.share({
            title: recipe.title,
            text: recipeText,
            url: currentUrl
          });
        }
    }
    setShowShareModal(false);
  };

  // If onClose is not provided, render as a preview card
  if (!onClose) {
    return (
      <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-2 border-yellow-200 rounded-3xl shadow-xl overflow-hidden hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer">
        
        {/* Preview Image */}
        <div className="relative h-48 bg-gradient-to-br from-amber-100 to-orange-200 overflow-hidden">
          <img 
            src={recipe.image || getRecipeImageUrl(recipe.title, recipe.ingredients)} 
            alt={recipe.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              // Fallback to emoji if image fails to load
              (e.target as HTMLImageElement).style.display = 'none';
              const fallback = (e.target as HTMLImageElement).nextElementSibling as HTMLElement;
              if (fallback) fallback.style.display = 'flex';
            }}
          />
          <div className="w-full h-full hidden items-center justify-center absolute inset-0 bg-yellow-100">
            <div className="text-6xl opacity-60">🍽️</div>
          </div>
          {/* Recipe title overlay on image */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
            <h3 className="text-lg font-bold text-white mb-1" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
              {recipe.title}
            </h3>
          </div>
        </div>
        
        <div className="p-4">
          <div className="text-center">
            {recipe.description && (
              <p className="text-yellow-600 text-sm mb-3 italic line-clamp-2">{recipe.description}</p>
            )}
            
            {/* Trust indicators */}
            <div className="flex justify-center gap-2 mb-3 flex-wrap">
              {recipe.cookTime && (
                <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-xs font-bold border border-yellow-200">
                  ⏱️ {recipe.cookTime}
                </span>
              )}
              {recipe.difficulty && (
                <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-xs font-bold border border-yellow-200">
                  📊 {recipe.difficulty}
                </span>
              )}
              {recipe.cuisine && (
                <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-xs font-bold border border-yellow-200">
                  🌍 {recipe.cuisine}
                </span>
              )}
            </div>
            
            {/* Trust badge */}
            <div className="flex justify-center mb-3">
              <div className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-bold border border-green-200 flex items-center gap-1">
                <span>✅</span> Recipe Verified
              </div>
            </div>
            
            {/* Reviews indicator */}
            {recipe.reviews && (
              <div className="text-xs text-gray-500 mb-3">
                {recipe.reviews} reviews • Community Approved
              </div>
            )}
            
            <div className="bg-yellow-200 text-yellow-800 px-4 py-2 rounded-full text-sm font-semibold inline-block border border-yellow-300">
              Click to view full recipe! 👀
            </div>
          </div>
        </div>
      </div>
    );
  }
  // Full modal version
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[95vh] relative flex flex-col" style={{ backgroundColor: '#f8f4f0' }}>
        
        {/* Close button */}
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 z-10 bg-white hover:bg-gray-50 rounded-full p-2 transition-all duration-200 text-amber-800 border border-amber-200 shadow-md"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Scrollable content area */}
        <div className="overflow-y-auto flex-1">
          
          {/* Hero Image */}
          <div className="relative h-80 bg-gradient-to-br from-amber-100 to-orange-200 rounded-t-2xl overflow-hidden">
            <img 
              src={recipe.image || dynamicImageUrl || getRecipeImageUrl(recipe.title, recipe.ingredients)} 
              alt={recipe.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback to emoji if image fails to load
                (e.target as HTMLImageElement).style.display = 'none';
                const fallback = (e.target as HTMLImageElement).nextElementSibling as HTMLElement;
                if (fallback) fallback.style.display = 'flex';
              }}
            />
            <div className="w-full h-full hidden items-center justify-center absolute inset-0">
              <div className="text-8xl opacity-60">🍽️</div>
            </div>
            {/* Recipe title overlay */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2" style={{ fontFamily: 'Dancing Script, cursive' }}>
                {recipe.title}
              </h1>
              {recipe.description && (
                <p className="text-white/90 text-base md:text-lg line-clamp-2">{recipe.description}</p>
              )}
            </div>
          </div>

          {/* Recipe Info Bar */}
          <div className="bg-white border-b border-amber-100 px-6 md:px-8 py-6">
            <div className="flex flex-wrap items-center gap-4 md:gap-8 text-amber-800 justify-center md:justify-start">
              {recipe.servings && (
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"/>
                  </svg>
                  <span className="font-medium">{recipe.servings} servings</span>
                </div>
              )}
              {recipe.cookTime && (
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/>
                  </svg>
                  <span className="font-medium">{recipe.cookTime}</span>
                </div>
              )}
              {recipe.difficulty && (
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                  <span className="font-medium">{recipe.difficulty}</span>
                </div>
              )}
            </div>
          </div>

          {/* Two-column layout for content */}
          <div className="grid md:grid-cols-2 gap-8 p-8">
            
            {/* Left Column - Ingredients */}
            <div>
              <h2 className="text-2xl font-bold text-amber-900 mb-6 uppercase tracking-wide" style={{ fontFamily: 'serif' }}>
                INGREDIENTS
              </h2>
              <div className="space-y-3">
                {recipe.ingredients.map((ingredient, index) => (
                  <div key={index} className="text-amber-800 leading-relaxed">
                    {ingredient}
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column - Directions */}
            <div>
              <h2 className="text-2xl font-bold text-amber-900 mb-6 uppercase tracking-wide" style={{ fontFamily: 'serif' }}>
                DIRECTIONS
              </h2>
              <div className="space-y-4">
                {recipe.instructions.map((instruction, index) => (
                  <div key={index} className="flex gap-4">
                    <span className="text-amber-900 font-bold text-lg flex-shrink-0">
                      {index + 1}.
                    </span>
                    <p className="text-amber-800 leading-relaxed">
                      {instruction}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Smart Notes section - only show if we have relevant notes */}
          {(() => {
            const smartNotes = generateSmartNotes(recipe.title, recipe.ingredients, recipe.instructions);
            if (smartNotes.length === 0) return null;
            
            return (
              <div className="px-8 pb-8">
                <div className="border border-amber-300 rounded-lg p-6" style={{ backgroundColor: '#f5f1ed' }}>
                  <h3 className="text-lg font-bold text-amber-900 mb-4 uppercase tracking-wide" style={{ fontFamily: 'serif' }}>
                    CHEF'S NOTES
                  </h3>
                  <div className="space-y-3">
                    {smartNotes.map((note, index) => (
                      <div key={index} className="text-amber-800 leading-relaxed text-sm">
                        {note}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })()}

          {error && <div className="text-red-600 text-sm mt-4 text-center bg-red-50 p-3 rounded-lg mx-8">{error}</div>}
        </div>

        {/* Action buttons at bottom */}
        <div className="bg-white border-t border-amber-100 p-6 rounded-b-2xl">
          <div className="flex gap-4 justify-center">
            <button
              className={`px-6 py-3 rounded-lg transition-all duration-300 font-medium ${
                isAlreadySaved 
                  ? 'bg-green-100 text-green-800 border border-green-300 cursor-not-allowed' 
                  : 'bg-amber-100 text-amber-800 border border-amber-300 hover:bg-amber-200'
              }`}
              onClick={handleSave}
              disabled={saving || isAlreadySaved || checkingSavedStatus}
            >
              {checkingSavedStatus ? (
                '🔄 Checking...'
              ) : isAlreadySaved ? (
                '✅ Saved to Cookbook'
              ) : (
                '💛 Save to My Cookbook'
              )}
              {saving && <span className="ml-2 animate-spin">⏳</span>}
            </button>
            <button 
              onClick={() => setShowShareModal(true)}
              className="px-6 py-3 rounded-lg transition-all duration-300 font-medium bg-amber-200 text-amber-900 border border-amber-400 hover:bg-amber-300"
            >
              📤 Share Recipe
            </button>
          </div>
        </div>
      </div>

      {/* Saved popup animation */}
      {showSavedPopup && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50">
          <div className="relative flex items-center justify-center">
            <div className="animate-burst-pop bg-pink-400 text-white font-bold px-8 py-4 rounded-full shadow-lg text-xl flex items-center gap-2">
              <span role="img" aria-label="sparkle">✨</span> Saved!
            </div>
            {/* Drops */}
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 w-3 h-3 bg-pink-300 rounded-full animate-drop1"></span>
            <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-3 h-3 bg-pink-300 rounded-full animate-drop2"></span>
            <span className="absolute top-1/2 -left-3 -translate-y-1/2 w-3 h-3 bg-pink-300 rounded-full animate-drop3"></span>
            <span className="absolute top-1/2 -right-3 -translate-y-1/2 w-3 h-3 bg-pink-300 rounded-full animate-drop4"></span>
          </div>
        </div>
      )}

      {/* Share Modal - responsive */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-[60] p-2 sm:p-4">
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-8 max-w-xs sm:max-w-md w-full border-2 sm:border-4 border-pink-200">
            <div className="text-center mb-4 sm:mb-6">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">Share Recipe</h3>
              <p className="text-gray-600 text-sm sm:text-base">Share "{recipe.title}" with your friends!</p>
            </div>
            
            <div className="grid grid-cols-2 gap-2 sm:gap-4 mb-4 sm:mb-6">
              <button
                onClick={() => shareRecipe('whatsapp')}
                className="flex flex-col items-center gap-1 sm:gap-2 p-2 sm:p-4 rounded-xl hover:bg-green-50 transition-all duration-200 border-2 border-transparent hover:border-green-200"
              >
                <div className="w-8 h-8 sm:w-12 sm:h-12 bg-green-500 rounded-full flex items-center justify-center text-white text-sm sm:text-xl">
                  📱
                </div>
                <span className="text-xs sm:text-sm font-medium text-gray-700">WhatsApp</span>
              </button>
              
              <button
                onClick={() => shareRecipe('facebook')}
                className="flex flex-col items-center gap-1 sm:gap-2 p-2 sm:p-4 rounded-xl hover:bg-blue-50 transition-all duration-200 border-2 border-transparent hover:border-blue-200"
              >
                <div className="w-8 h-8 sm:w-12 sm:h-12 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm sm:text-xl">
                  📘
                </div>
                <span className="text-xs sm:text-sm font-medium text-gray-700">Facebook</span>
              </button>
              
              <button
                onClick={() => shareRecipe('twitter')}
                className="flex flex-col items-center gap-1 sm:gap-2 p-2 sm:p-4 rounded-xl hover:bg-blue-50 transition-all duration-200 border-2 border-transparent hover:border-blue-200"
              >
                <div className="w-8 h-8 sm:w-12 sm:h-12 bg-blue-400 rounded-full flex items-center justify-center text-white text-sm sm:text-xl">
                  🐦
                </div>
                <span className="text-xs sm:text-sm font-medium text-gray-700">Twitter</span>
              </button>
              
              <button
                onClick={() => shareRecipe('instagram')}
                className="flex flex-col items-center gap-1 sm:gap-2 p-2 sm:p-4 rounded-xl hover:bg-pink-50 transition-all duration-200 border-2 border-transparent hover:border-pink-200"
              >
                <div className="w-8 h-8 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-sm sm:text-xl">
                  📷
                </div>
                <span className="text-xs sm:text-sm font-medium text-gray-700">Instagram</span>
              </button>
              
              <button
                onClick={() => shareRecipe('telegram')}
                className="flex flex-col items-center gap-1 sm:gap-2 p-2 sm:p-4 rounded-xl hover:bg-blue-50 transition-all duration-200 border-2 border-transparent hover:border-blue-200"
              >
                <div className="w-8 h-8 sm:w-12 sm:h-12 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm sm:text-xl">
                  ✈️
                </div>
                <span className="text-xs sm:text-sm font-medium text-gray-700">Telegram</span>
              </button>
              
              <button
                onClick={() => shareRecipe('email')}
                className="flex flex-col items-center gap-1 sm:gap-2 p-2 sm:p-4 rounded-xl hover:bg-gray-50 transition-all duration-200 border-2 border-transparent hover:border-gray-200"
              >
                <div className="w-8 h-8 sm:w-12 sm:h-12 bg-gray-600 rounded-full flex items-center justify-center text-white text-sm sm:text-xl">
                  📧
                </div>
                <span className="text-xs sm:text-sm font-medium text-gray-700">Email</span>
              </button>
            </div>
            
            <div className="flex gap-2 sm:gap-3">
              <button
                onClick={() => shareRecipe('copy')}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 sm:py-3 px-3 sm:px-4 rounded-xl transition-all duration-200 font-medium text-sm sm:text-base"
              >
                📋 Copy Recipe
              </button>
              <button
                onClick={() => setShowShareModal(false)}
                className="flex-1 bg-pink-500 hover:bg-pink-600 text-white py-2 sm:py-3 px-3 sm:px-4 rounded-xl transition-all duration-200 font-medium text-sm sm:text-base"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Login Prompt Modal */}
      {showLoginPrompt && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-[60]">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6">
            <div className="text-center">
              <div className="text-4xl mb-4">🔐</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Login Required</h3>
              <p className="text-gray-600 mb-6">
                You need to be logged in to save recipes. Join our community to save and organize your favorite recipes!
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowLoginPrompt(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowLoginPrompt(false);
                    window.location.href = '/login';
                  }}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 font-medium shadow-md"
                >
                  Login
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper function to make instructions more friendly and detailed
function enhanceInstruction(instruction: string, stepNumber: number): string {
  const friendlyPhrases = [
    "Alright, let's start! ",
    "Now here comes the fun part - ",
    "Next up, we're going to ",
    "Time for step " + stepNumber + "! ",
    "Here's where it gets exciting - ",
    "Don\\'t worry, this part is easy! ",
    "You\\'ve got this! Now ",
    "Almost there! Next, ",
    "This is my favorite part - ",
    "Trust the process and "
  ];
  
  const encouragements = [
    " (You're doing great!)",
    " (Don\\'t rush this part - take your time!)",
    " (This is where the magic happens!)",
    " (Your kitchen probably smells amazing right now!)",
    " (Pro tip: taste as you go!)",
    " (Looking good so far!)",
    " (You're almost a chef!)",
    " (This is the secret to making it perfect!)"
  ];
  
  // Add friendly intro occasionally
  let enhanced = instruction;
  if (Math.random() > 0.7) {
    const randomPhrase = friendlyPhrases[Math.floor(Math.random() * friendlyPhrases.length)];
    enhanced = randomPhrase + instruction.toLowerCase();
  }
  
  // Add encouragement occasionally
  if (Math.random() > 0.6) {
    const randomEncouragement = encouragements[Math.floor(Math.random() * encouragements.length)];
    enhanced += randomEncouragement;
  }
  
  return enhanced;
}
