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
  
  // Voice functionality states
  const [isListening, setIsListening] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [showManualSelection, setShowManualSelection] = useState(false);
  const [botMessage, setBotMessage] = useState("Hi! I'm your cooking assistant. Tell me what you'd like to cook!");

  // Initialize voice recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      setVoiceSupported(!!SpeechRecognition);
    }
  }, []);

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.8;
      utterance.pitch = 1;
      speechSynthesis.speak(utterance);
    }
  };

  const handleIngredientsChange = (ingredients: { base: string[], main: string[] }) => {
    setSelectedIngredients(ingredients);
  };

  const handlePreferencesChange = (preferences: { mealType: string, dietary: string }) => {
    setSelectedPreferences(preferences);
  };

  const processVoiceRequest = async (voiceRequest: string) => {
    setIsGenerating(true);
    setBotMessage("Let me find some recipes for you...");
    
    try {
      const response = await fetch('/api/working', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          baseIngredients: [],
          mainIngredients: [],
          mealType: selectedPreferences.mealType || '',
          dietary: selectedPreferences.dietary || '',
          customizations: {
            voiceRequest: voiceRequest,
            isVoiceGenerated: true
          },
          surpriseMode: false,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate recipes');
      }

      const data = await response.json();
      setGeneratedRecipes(data.recipes);
      setBotMessage(`Great! I found ${data.recipes.length} recipes for you! 🍳`);
      
      // Auto-scroll to recipes
      setTimeout(() => {
        const recipesSection = document.querySelector('[data-recipes-section]');
        if (recipesSection) {
          recipesSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    } catch (error) {
      console.error('Error generating recipes:', error);
      setBotMessage('Sorry, I had trouble finding recipes. Try again or use manual selection below.');
    } finally {
      setIsGenerating(false);
    }
  };

  const startVoiceRecognition = () => {
    if (!voiceSupported) return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      setBotMessage("I'm listening... Tell me what you'd like to cook!");
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setVoiceTranscript(transcript);
      setBotMessage(`I heard: "${transcript}". Let me find recipes for you!`);
      processVoiceRequest(transcript);
    };

    recognition.onerror = (event: any) => {
      setIsListening(false);
      setBotMessage("Sorry, I didn't catch that. Please try again!");
      console.error('Speech recognition error:', event.error);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const generateRecipes = async () => {
    const { base, main } = selectedIngredients;
    const { mealType, dietary } = selectedPreferences;
    
    setIsGenerating(true);
    try {
      const response = await fetch('/api/working', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          baseIngredients: base,
          mainIngredients: main,
          mealType: mealType,
          dietary: dietary,
          customizations: {},
          surpriseMode: false,
        }),
      });
      if (!response.ok) {
        throw new Error('Failed to generate recipes');
      }

      const data = await response.json();
      setGeneratedRecipes(data.recipes);
      
      setTimeout(() => {
        const recipesSection = document.querySelector('[data-recipes-section]');
        if (recipesSection) {
          recipesSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    } catch (error) {
      console.error('Error generating recipes:', error);
      alert('Failed to generate recipes. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const surpriseMe = async () => {
    setIsGenerating(true);
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
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f7f3f0' }}>
      {/* Header - Clean and minimal */}
      <div className="bg-white shadow-sm border-b border-amber-100">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-amber-900" style={{ fontFamily: 'Dancing Script, cursive' }}>
                Recipe Collection
              </h1>
            </div>
            
            {/* Navigation */}
            <nav className="hidden md:flex space-x-8">
              <a href="#" className="text-amber-800 hover:text-amber-900 font-medium transition-colors">Recipes</a>
              <button 
                onClick={surpriseMe}
                className="text-amber-700 hover:text-amber-900 transition-colors font-medium bg-transparent border-0 p-0 cursor-pointer"
              >
                Surprise Me
              </button>
              <a href="/saved-recipes" className="text-amber-700 hover:text-amber-900 transition-colors">Saved</a>
            </nav>
            
            {/* Settings */}
            <div className="relative">
              <button
                onClick={() => setSettingsOpen(!settingsOpen)}
                className="flex items-center gap-2 text-amber-800 hover:text-amber-900 transition-colors"
              >
                <span className="text-lg">⚙️</span>
                <span className="hidden sm:inline font-medium">Settings</span>
              </button>
              {settingsOpen && (
                <div className="absolute right-0 top-full mt-2 bg-white rounded-lg shadow-lg border border-amber-100 py-2 w-48 z-10">
                  {!user ? (
                    <>
                      <a href="/login" className="flex items-center gap-3 px-4 py-2 text-amber-800 hover:bg-amber-50 transition-colors">
                        <span>🔑</span><span>Log In</span>
                      </a>
                      <a href="/signup" className="flex items-center gap-3 px-4 py-2 text-amber-800 hover:bg-amber-50 transition-colors">
                        <span>📝</span><span>Sign Up</span>
                      </a>
                    </>
                  ) : (
                    <a href="/profile" className="flex items-center gap-3 px-4 py-2 text-amber-800 hover:bg-amber-50 transition-colors">
                      <span>👤</span><span>Profile Settings</span>
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Voice Interface */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="bg-white rounded-lg shadow-sm border border-amber-100 p-6">
            <div className="text-center mb-6">
              <div className="text-4xl mb-3">
                {isListening ? '🎤' : isGenerating ? '👨‍🍳' : '🍽️'}
              </div>
              <h2 className="text-xl font-semibold text-amber-900 mb-2" style={{ fontFamily: 'Dancing Script, cursive' }}>
                What would you like to cook today?
              </h2>
              <p className="text-amber-700">{botMessage}</p>
              {voiceTranscript && (
                <div className="mt-3 p-3 bg-amber-50 rounded text-sm text-amber-800 border border-amber-200">
                  You said: "{voiceTranscript}"
                </div>
              )}
            </div>

            {/* Voice Controls */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
              {voiceSupported ? (
                <button
                  onClick={startVoiceRecognition}
                  disabled={isListening || isGenerating}
                  className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 disabled:bg-amber-400 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  {isListening ? (
                    <>
                      <span className="animate-pulse">🎤</span>
                      <span>Listening...</span>
                    </>
                  ) : (
                    <>
                      <span>🎤</span>
                      <span>Tell me what to cook</span>
                    </>
                  )}
                </button>
              ) : (
                <p className="text-amber-600 text-sm">Voice recognition not supported in this browser</p>
              )}
              
              {isGenerating && (
                <div className="flex items-center gap-2 text-amber-700">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-amber-600 border-t-transparent"></div>
                  <span>Finding recipes...</span>
                </div>
              )}
            </div>

            {/* Example Requests */}
            <div className="text-center">
              <p className="text-sm text-amber-600 mb-3">Try saying:</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {['chocolate chip cookies', 'healthy smoothie', 'quick pasta dinner', 'protein milkshake'].map((example) => (
                  <button
                    key={example}
                    onClick={() => {
                      setVoiceTranscript(example);
                      processVoiceRequest(example);
                    }}
                    className="text-xs bg-amber-100 hover:bg-amber-200 px-3 py-1 rounded-full text-amber-800 transition-colors border border-amber-200"
                  >
                    "{example}"
                  </button>
                ))}
              </div>
            </div>

            {/* Toggle Manual Selection */}
            <div className="text-center mt-6">
              <button
                onClick={() => setShowManualSelection(!showManualSelection)}
                className="text-amber-600 hover:text-amber-800 font-medium underline"
              >
                {showManualSelection ? 'Hide Manual Selection' : 'Or choose ingredients manually'}
              </button>
            </div>
          </div>
        </div>

        {/* Manual Selection (Collapsible) */}
        {showManualSelection && (
          <div className="max-w-4xl mx-auto mb-12">
            <div className="bg-white rounded-lg shadow-sm border border-amber-100 p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <IngredientSelector onIngredientsChange={handleIngredientsChange} />
                <Preferences onPreferencesChange={handlePreferencesChange} />
              </div>
              <div className="text-center">
                <button
                  onClick={generateRecipes}
                  disabled={isGenerating}
                  className={`px-8 py-3 rounded-lg text-white font-medium transition-colors ${
                    isGenerating 
                      ? 'bg-amber-400 cursor-not-allowed' 
                      : 'bg-amber-600 hover:bg-amber-700'
                  }`}
                >
                  {isGenerating ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Searching Recipes...
                    </span>
                  ) : (
                    'Search Recipes'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Generated Recipes - Recipe Card Layout */}
        {generatedRecipes.length > 0 && (
          <div className="mb-8" data-recipes-section>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {generatedRecipes.map((recipe, index) => (
                <RecipeCardLayout key={index} recipe={recipe} onClick={() => openRecipeModal(recipe)} />
              ))}
            </div>
          </div>
        )}
      </div>

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

// New Recipe Card Component matching Image 1 design
function RecipeCardLayout({ recipe, onClick }: { recipe: Recipe; onClick: () => void }) {
  return (
    <div 
      className="bg-white rounded-lg shadow-sm border border-amber-100 overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
      onClick={onClick}
    >
      {/* Hero Image */}
      <div className="relative h-64 bg-gradient-to-br from-amber-100 to-orange-200">
        {recipe.image ? (
          <Image 
            src={recipe.image} 
            alt={recipe.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <span className="text-6xl opacity-50">🍽️</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6" style={{ backgroundColor: '#faf8f5' }}>
        {/* Recipe Title */}
        <h3 
          className="text-2xl font-bold text-amber-900 mb-4 text-center border-b border-amber-200 pb-3"
          style={{ fontFamily: 'Dancing Script, cursive' }}
        >
          {recipe.title}
        </h3>

        {/* Recipe Info */}
        <div className="flex items-center justify-center gap-6 mb-6 text-amber-700">
          <div className="flex items-center gap-2">
            <span className="text-lg">🍽️</span>
            <span className="font-medium">{recipe.servings || 4} servings</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg">⏱️</span>
            <span className="font-medium">{recipe.totalTime || recipe.cookTime || '30 mins'}</span>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Ingredients */}
          <div>
            <h4 className="text-lg font-bold text-amber-900 mb-3 uppercase tracking-wide">
              Ingredients
            </h4>
            <div className="space-y-2">
              {recipe.ingredients.slice(0, 6).map((ingredient, idx) => (
                <div key={idx} className="text-amber-800 text-sm">
                  {ingredient}
                </div>
              ))}
              {recipe.ingredients.length > 6 && (
                <div className="text-amber-600 text-xs italic">
                  +{recipe.ingredients.length - 6} more ingredients...
                </div>
              )}
            </div>
          </div>

          {/* Directions Preview */}
          <div>
            <h4 className="text-lg font-bold text-amber-900 mb-3 uppercase tracking-wide">
              Directions
            </h4>
            <div className="space-y-2">
              {recipe.instructions.slice(0, 3).map((instruction, idx) => (
                <div key={idx} className="text-amber-800 text-sm">
                  <span className="font-medium text-amber-900">{idx + 1}.</span> {instruction.slice(0, 80)}
                  {instruction.length > 80 && '...'}
                </div>
              ))}
              {recipe.instructions.length > 3 && (
                <div className="text-amber-600 text-xs italic">
                  +{recipe.instructions.length - 3} more steps...
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Notes Section */}
        {recipe.description && (
          <div className="mt-6 p-4 border border-amber-200 rounded bg-amber-50">
            <h5 className="font-bold text-amber-900 mb-2 uppercase tracking-wide text-sm">
              Notes
            </h5>
            <p className="text-amber-800 text-sm">
              {recipe.description}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
