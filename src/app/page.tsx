'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import IngredientSelector from '@/components/IngredientSelector';
import Preferences from '@/components/Preferences';
import RecipeCard from '@/components/RecipeCard';
import Mascot from '@/components/Mascot';
import { supabase } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';

interface Recipe {
  title: string;
  ingredients: string[];
  instructions: string[];
  prepTime?: string;
  difficulty?: string;
  cookTime?: string;
  description?: string;
  servings?: number;
  image?: string;
  totalTime?: string;
  cuisine?: string;
  tags?: string[];
  rating?: number;
  reviews?: number;
}

export default function Home() {
  const [selectedIngredients, setSelectedIngredients] = useState<{ base: string[], main: string[] }>({ base: [], main: [] });
  const [selectedPreferences, setSelectedPreferences] = useState<{ mealType: string, dietary: string }>({ mealType: '', dietary: '' });
  const [generatedRecipes, setGeneratedRecipes] = useState<Recipe[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [showRecipeModal, setShowRecipeModal] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  
  const handleIngredientsChange = (ingredients: { base: string[], main: string[] }) => {
    setSelectedIngredients(ingredients);
  };

  const handlePreferencesChange = (preferences: { mealType: string, dietary: string }) => {
    setSelectedPreferences(preferences);
  };

  const generateRecipes = async () => {
    if (selectedIngredients.base.length === 0 && selectedIngredients.main.length === 0) {
      alert('Please select at least one ingredient!');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch('/api/working', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          baseIngredients: selectedIngredients.base,
          mainIngredients: selectedIngredients.main,
          mealType: selectedPreferences.mealType,
          dietary: selectedPreferences.dietary,
          customizations: {},
          surpriseMode: false,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate recipes');
      }

      const data = await response.json();
      setGeneratedRecipes(data.recipes);
      
      // Auto-scroll to recipes section after generation
      setTimeout(() => {
        const recipesSection = document.querySelector('[data-recipes-section]');
        if (recipesSection) {
          recipesSection.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
          });
        }
      }, 100);
    } catch (error) {
      console.error('Error generating recipes:', error);
      alert('Failed to generate recipes. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Generate a random recipe regardless of ingredients or preferences
  const surpriseMe = async () => {
    setIsGenerating(true);
    console.log('Surprise Me! button clicked');
    try {
      const response = await fetch('/api/working', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          baseIngredients: [],
          mainIngredients: [],
          mealType: '',
          dietary: '',
          customizations: {},
          surpriseMode: true,
        }),
      });
      if (!response.ok) {
        throw new Error('Failed to generate recipe');
      }
      const data = await response.json();
      console.log('Surprise API response:', data);
      if (data.recipes && data.recipes.length > 0) {
        setSelectedRecipe(data.recipes[0]);
        setShowRecipeModal(true);
      } else {
        alert('No recipe generated. Please try again.');
      }
    } catch (error) {
      console.error('Error generating surprise recipe:', error);
      alert('Failed to generate a surprise recipe. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const openRecipeModal = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setShowRecipeModal(true);
  };

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };
    getUser();
    // Listen for auth changes
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  return (
    <div className="min-h-screen bg-yellow-50">
      {/* Floating, rounded header navigation and settings button */}
      <div className="w-full flex justify-center items-start pt-4 pb-2 z-40 relative">
        <div className="flex flex-row gap-4 w-auto">
          <nav className="floating-zoom flex flex-row gap-6 md:gap-10 px-6 py-2 bg-white/90 backdrop-blur border border-pink-200 shadow-xl rounded-full items-center text-base md:text-lg font-bold text-gray-800">
            <Link href="/" className="flex items-center gap-2 hover:text-pink-600 transition-colors">
              <span className="text-xl md:text-2xl">🏠</span>
              <span className="tracking-wide">Home</span>
            </Link>
            <a href="#discover" className="flex items-center gap-2 hover:text-pink-600 transition-colors">
              <span className="text-xl md:text-2xl">🔎</span>
              <span className="tracking-wide">Discover</span>
            </a>
            <button type="button" onClick={surpriseMe} className="flex items-center gap-2 hover:text-pink-600 transition-colors bg-transparent border-0 p-0 m-0 font-bold cursor-pointer">
              <span className="text-xl md:text-2xl">💡</span>
              <span className="tracking-wide">Surprise Me!</span>
            </button>
            <button onClick={() => window.location.href = '/saved-recipes'} className="flex items-center gap-2 hover:text-pink-600 transition-colors bg-transparent border-0 p-0 m-0 font-bold cursor-pointer">
              <span className="text-xl md:text-2xl">📖</span>
              <span className="tracking-wide">Saved</span>
            </button>
            <a href="#grocery" className="flex items-center gap-2 hover:text-pink-600 transition-colors">
              <span className="text-xl md:text-2xl">🛒</span>
              <span className="tracking-wide">Grocery</span>
            </a>
          </nav>
          {/* Floating Settings Button */}
          <div className="relative flex items-center">
            <button
              onClick={() => setSettingsOpen(!settingsOpen)}
              className="floating-zoom flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-200 ml-2"
            >
              <span className="text-lg">⚙️</span>
              <span className="text-gray-700 font-medium">Settings</span>
              <span className={`transform transition-transform ${settingsOpen ? 'rotate-180' : ''}`}>
                ▼
              </span>
            </button>
            {settingsOpen && (
              <div className="absolute right-0 top-full mt-2 bg-white rounded-lg shadow-xl border border-gray-200 py-2 w-48 z-10">
                {!user ? (
                  <>
                    <a
                      href="/login"
                      className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <span>🔑</span>
                      <span>Log In</span>
                    </a>
                    <a
                      href="/signup"
                      className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <span>📝</span>
                      <span>Sign Up</span>
                    </a>
                  </>
                ) : (
                  <a
                    href="/profile"
                    className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <span>👤</span>
                    <span>Profile Settings</span>
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8">
        {/* Settings Dropdown */}
        

        {/* Heading Image with Simple Sparkle Animation */}
        <div className="text-center mt-0 mb-0 relative">
          <div className="relative inline-block">
            <Image 
              src="/customize-your-meal-heading.png" 
              alt="Customize Your Meal" 
              className="mx-auto max-w-full h-auto rounded-2xl transition-transform duration-200"
              style={{ maxHeight: '200px' }}
              width={600}
              height={200}
            />
            {/* More tiny star sparkles */}
            <div className="absolute inset-0 pointer-events-none">
              <span className="tiny-sparkle ts-1">✦</span>
              <span className="tiny-sparkle ts-2">✦</span>
              <span className="tiny-sparkle ts-3">✦</span>
              <span className="tiny-sparkle ts-4">✦</span>
              <span className="tiny-sparkle ts-5">✦</span>
              <span className="tiny-sparkle ts-6">✦</span>
              <span className="tiny-sparkle ts-7">✦</span>
              <span className="tiny-sparkle ts-8">✦</span>
              <span className="tiny-sparkle ts-9">✦</span>
              <span className="tiny-sparkle ts-10">✦</span>
            </div>
          </div>
        </div>

        {/* Ingredient Selection and Preferences */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8 mt-8">
          <IngredientSelector onIngredientsChange={handleIngredientsChange} />
          <Preferences onPreferencesChange={handlePreferencesChange} />
        </div>

        {/* Search and Further Customize Buttons */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-12">
          <button
            onClick={generateRecipes}
            disabled={isGenerating}
            className={`
              px-8 py-4 rounded-full text-white font-bold text-lg shadow-lg
              transform transition-all duration-200
              ${isGenerating 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 hover:scale-105'
              }
            `}
          >
            {isGenerating ? (
              <span className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Searching Recipes...
              </span>
            ) : (
              'Search Recipes'
            )}
          </button>
          <button
            type="button"
            className="px-8 py-4 rounded-full border-2 border-pink-400 text-pink-600 font-bold text-lg bg-white shadow-md hover:bg-pink-50 transition-all duration-200"
            onClick={() => alert('Further customization coming soon!')}
          >
            Further Customize
          </button>
        </div>

        {/* Generated Recipes */}
        {generatedRecipes.length > 0 && (
          <div className="mb-12" data-recipes-section>
            <h2 className="text-3xl font-bold text-center text-purple-800 mb-8">
              Your Personalized Recipes ✨
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {generatedRecipes.map((recipe, index) => (
                <div key={index} onClick={() => openRecipeModal(recipe)} className="cursor-pointer">
                  <RecipeCard recipe={recipe} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Mascot */}
      <Mascot 
        isThinking={isGenerating}
        message={isGenerating ? "Cooking up something special... 👨‍🍳" : undefined}
      />

      {/* Recipe Modal */}
      {showRecipeModal && selectedRecipe && (
        <RecipeCard 
          recipe={selectedRecipe} 
          onClose={() => setShowRecipeModal(false)} 
        />
      )}
    </div>
  );
}
