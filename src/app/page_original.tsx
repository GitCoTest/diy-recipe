'use client';

import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import Header from '@/components/Header';
import IngredientSelector from '@/components/IngredientSelector';
import Preferences from '@/components/Preferences';
import RecipeCard from '@/components/RecipeCard';
import Mascot from '@/components/Mascot';
import CustomizeModal from '@/components/CustomizeModal';
import RecipeModal from '@/components/RecipeModal';
import Image from 'next/image';

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

export default function Home() {
  const [user] = useState<User | null>(null);
  const [selectedIngredients, setSelectedIngredients] = useState<{ base: string[], main: string[] }>({ base: [], main: [] });
  const [selectedPreferences, setSelectedPreferences] = useState<{ mealType: string, dietary: string }>({ mealType: '', dietary: '' });
  const [generatedRecipes, setGeneratedRecipes] = useState<Recipe[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showCustomizeModal, setShowCustomizeModal] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [showRecipeModal, setShowRecipeModal] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    // Removed getCurrentUser usage since it does not exist
  }, []);

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
      const response = await fetch('/api/recipes/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ingredients: selectedIngredients,
          preferences: selectedPreferences,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate recipes');
      }

      const data = await response.json();
      setGeneratedRecipes(data.recipes);
    } catch (error) {
      console.error('Error generating recipes:', error);
      alert('Failed to generate recipes. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const openRecipeModal = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setShowRecipeModal(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-4 mb-6">
            <Image 
              src="/customize-your-meal-heading.png" 
              alt="Customize Your Meal" 
              className="h-16 md:h-20 object-contain"
              width={400}
              height={80}
              priority
            />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-purple-800 mb-4">
            DIY Recipe Generator
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Turn your available ingredients into delicious recipes with the help of AI! 
            Just select what you have, and we&apos;ll create personalized recipes for you.
          </p>
        </div>

        {/* Settings Dropdown */}
        <div className="relative mb-8 flex justify-end">
          <button
            onClick={() => setSettingsOpen(!settingsOpen)}
            className="flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-200"
          >
            <span className="text-lg">⚙️</span>
            <span className="text-gray-700 font-medium">Settings</span>
            <span className={`transform transition-transform ${settingsOpen ? 'rotate-180' : ''}`}>
              ▼
            </span>
          </button>
          
          {settingsOpen && (
            <div className="absolute right-0 top-full mt-2 bg-white rounded-lg shadow-xl border border-gray-200 py-2 w-48 z-10">
              {user && (
                <a
                  href="/profile"
                  className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <span>👤</span>
                  <span>Profile Settings</span>
                </a>
              )}
              <button
                onClick={() => setShowCustomizeModal(true)}
                className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors w-full text-left"
              >
                <span>🎨</span>
                <span>Customize Ingredients</span>
              </button>
            </div>
          )}
        </div>

        {/* Ingredient Selection */}
        <div className="mb-8">
          <IngredientSelector onIngredientsChange={handleIngredientsChange} />
        </div>

        {/* Preferences */}
        <div className="mb-8">
          <Preferences onPreferencesChange={handlePreferencesChange} />
        </div>

        {/* Generate Button */}
        <div className="text-center mb-12">
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
                Generating Recipes...
              </span>
            ) : (
              'Generate Recipes 🍳'
            )}
          </button>
        </div>

        {/* Generated Recipes */}
        {generatedRecipes.length > 0 && (
          <div className="mb-12">
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

      {/* Modals */}
      {showCustomizeModal && (
        <CustomizeModal 
          isOpen={showCustomizeModal}
          onClose={() => setShowCustomizeModal(false)}
          onGenerateRecipe={() => {}}
        />
      )}
      {showRecipeModal && selectedRecipe && (
        <RecipeModal 
          isOpen={showRecipeModal}
          onClose={() => setShowRecipeModal(false)}
          recipes={[selectedRecipe]}
          isLoading={isGenerating}
        />
      )}
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img
            aria-hidden
            src="/file.svg"
            alt="File icon"
            width={16}
            height={16}
          />
          Learn
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img
            aria-hidden
            src="/window.svg"
            alt="Window icon"
            width={16}
            height={16}
          />
          Examples
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img
            aria-hidden
            src="/globe.svg"
            alt="Globe icon"
            width={16}
            height={16}
          />
          Go to nextjs.org →
        </a>
      </footer>
    </div>
  );
}
