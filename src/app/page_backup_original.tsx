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
      {/* Floating, rounded header navigation and settings button - responsive */}
      <div className="w-full flex justify-center items-start pt-2 sm:pt-4 pb-2 z-40 relative">
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 w-auto px-2 sm:px-0">
          <nav className="floating-zoom flex flex-row gap-3 sm:gap-6 md:gap-10 px-3 sm:px-6 py-2 bg-white/90 backdrop-blur border border-pink-200 shadow-xl rounded-full items-center text-sm sm:text-base md:text-lg font-bold text-gray-800 overflow-x-auto">
            <Link href="/" className="flex items-center gap-1 sm:gap-2 hover:text-pink-600 transition-colors whitespace-nowrap">
              <span className="text-base sm:text-xl md:text-2xl">🏠</span>
              <span className="tracking-wide">Home</span>
            </Link>
            <a href="#discover" className="flex items-center gap-1 sm:gap-2 hover:text-pink-600 transition-colors whitespace-nowrap">
              <span className="text-base sm:text-xl md:text-2xl">🔎</span>
              <span className="tracking-wide hidden sm:inline">Discover</span>
            </a>
            <button type="button" onClick={surpriseMe} className="flex items-center gap-1 sm:gap-2 hover:text-pink-600 transition-colors bg-transparent border-0 p-0 m-0 font-bold cursor-pointer whitespace-nowrap">
              <span className="text-base sm:text-xl md:text-2xl">💡</span>
              <span className="tracking-wide">Surprise<span className="hidden sm:inline"> Me!</span></span>
            </button>
            <button onClick={() => window.location.href = '/saved-recipes'} className="flex items-center gap-1 sm:gap-2 hover:text-pink-600 transition-colors bg-transparent border-0 p-0 m-0 font-bold cursor-pointer whitespace-nowrap">
              <span className="text-base sm:text-xl md:text-2xl">📖</span>
              <span className="tracking-wide">Saved</span>
            </button>
            <a href="#grocery" className="flex items-center gap-1 sm:gap-2 hover:text-pink-600 transition-colors whitespace-nowrap">
              <span className="text-base sm:text-xl md:text-2xl">🛒</span>
              <span className="tracking-wide hidden sm:inline">Grocery</span>
            </a>
          </nav>
          {/* Floating Settings Button - responsive */}
          <div className="relative flex items-center justify-center sm:justify-start">
            <button
              onClick={() => setSettingsOpen(!settingsOpen)}
              className="floating-zoom flex items-center gap-2 bg-white rounded-full px-3 sm:px-4 py-2 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-200 text-sm sm:text-base"
            >
              <span className="text-base sm:text-lg">⚙️</span>
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
      
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
        {/* Settings Dropdown */}
        

        {/* Heading Image with Simple Sparkle Animation - responsive */}
        <div className="text-center mt-0 mb-0 relative">
          <div className="relative inline-block">
            <Image 
              src="/customize-your-meal-heading.png" 
              alt="Customize Your Meal" 
              className="mx-auto max-w-full h-auto rounded-xl sm:rounded-2xl transition-transform duration-200"
              style={{ maxHeight: '120px' }}
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

        {/* Ingredient Selection and Preferences - compact mobile boxes */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8 mt-6 sm:mt-8">
          <IngredientSelector onIngredientsChange={handleIngredientsChange} />
          <Preferences onPreferencesChange={handlePreferencesChange} />
        </div>

        {/* Search and Further Customize Buttons - responsive */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-4 mb-8 sm:mb-12">
          <button
            onClick={generateRecipes}
            disabled={isGenerating}
            className={`
              w-full sm:w-auto
              px-6 sm:px-8 py-3 sm:py-4 rounded-full text-white font-bold text-base sm:text-lg shadow-lg
              transform transition-all duration-200
              ${isGenerating 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 hover:scale-105'
              }
            `}
          >
            {isGenerating ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span className="hidden sm:inline">Searching Recipes...</span>
                <span className="sm:hidden">Searching...</span>
              </span>
            ) : (
              'Search Recipes'
            )}
          </button>
          <button
            type="button"
            className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 rounded-full border-2 border-pink-400 text-pink-600 font-bold text-base sm:text-lg bg-white shadow-md hover:bg-pink-50 transition-all duration-200"
            onClick={() => alert('Further customization coming soon!')}
          >
            <span className="hidden sm:inline">Further Customize</span>
            <span className="sm:hidden">Customize</span>
          </button>
        </div>

        {/* Generated Recipes */}
        {generatedRecipes.length > 0 && (
          <div className="mb-8 sm:mb-12" data-recipes-section>
            <h2 className="text-2xl sm:text-3xl font-bold text-center text-purple-800 mb-6 sm:mb-8">
              Your Personalized Recipes ✨
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
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

      {/* Voice Bot Component */}
      <VoiceBot 
        onVoiceRequest={async (request) => {
          // Parse the voice request to extract ingredients and preferences
          const { ingredients, mealType, dietary, constraints, originalRequest } = parseVoiceRequest(request);
          
          // Update the state with parsed ingredients
          setSelectedIngredients({ base: ingredients.filter(ing => !ing.includes(' ')), main: ingredients.filter(ing => ing.includes(' ')) });
          
          // Update the state with parsed preferences
          setSelectedPreferences({ mealType, dietary });
          
          // Generate recipes based on parsed data
          await generateRecipes();
        }}
        isProcessing={isGenerating}
      />
    </div>
  );
}

// Voice Bot Component (inline to avoid type issues)
interface VoiceBotProps {
  onVoiceRequest: (request: string) => void;
  isProcessing: boolean;
}

function VoiceBot({ onVoiceRequest, isProcessing }: VoiceBotProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(false);
  const [botMessage, setBotMessage] = useState("Hi! I'm your cooking assistant. Tell me what you'd like to cook!");
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        setIsSupported(true);
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = 'en-US';

        recognitionRef.current.onstart = () => {
          setIsListening(true);
          setBotMessage("I'm listening... Tell me what you'd like to cook!");
        };

        recognitionRef.current.onresult = (event: any) => {
          const result = event.results[0][0].transcript;
          setTranscript(result);
          setIsListening(false);
          setBotMessage("Got it! Let me find some recipes for you...");
          onVoiceRequest(result);
        };

        recognitionRef.current.onerror = () => {
          setIsListening(false);
          setBotMessage("Sorry, I didn't catch that. Try again!");
        };

        recognitionRef.current.onend = () => setIsListening(false);
      }
    }
  }, [onVoiceRequest]);

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setTranscript('');
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  };

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      speechSynthesis.speak(utterance);
    }
  };

  if (!isSupported) {
    return (
      <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl p-6 mb-6 text-center">
        <div className="text-4xl mb-3">🤖</div>
        <p className="text-gray-600">Voice feature not supported. Use manual selection below.</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl p-6 mb-6 shadow-lg">
      <div className="text-center mb-6">
        <div className="text-6xl mb-3 animate-bounce">
          {isListening ? '🎤' : isProcessing ? '👨‍🍳' : '🤖'}
        </div>
        <div className="bg-white rounded-lg p-4 shadow-md max-w-md mx-auto">
          <p className="text-gray-800 font-medium">{botMessage}</p>
          {transcript && (
            <div className="mt-2 p-2 bg-gray-50 rounded text-sm text-gray-600">
              You said: "{transcript}"
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
        <button
          onClick={isListening ? stopListening : startListening}
          disabled={isProcessing}
          className={`px-8 py-4 rounded-full font-bold text-lg shadow-lg transform transition-all duration-200 ${
            isListening 
              ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse' 
              : isProcessing
              ? 'bg-gray-400 cursor-not-allowed text-white'
              : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white hover:scale-105'
          }`}
        >
          {isListening ? (
            <span className="flex items-center gap-2">
              <div className="w-3 h-3 bg-white rounded-full animate-ping"></div>
              Listening...
            </span>
          ) : isProcessing ? (
            <span className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Processing...
            </span>
          ) : (
            <span className="flex items-center gap-2">🎤 Start Talking</span>
          )}
        </button>

        <button
          onClick={() => speak(botMessage)}
          className="px-6 py-3 rounded-full bg-white border-2 border-purple-300 text-purple-600 font-medium hover:bg-purple-50 transition-all duration-200"
        >
          🔊 Repeat
        </button>
      </div>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600 mb-2">Try saying something like:</p>
        <div className="flex flex-wrap justify-center gap-2">
          {[
            "Peanut butter chocolate mug cake, eggless",
            "Quick pasta with whatever I have", 
            "Healthy breakfast under 10 minutes",
            "Vegetarian dinner for two"
          ].map((example, index) => (
            <button
              key={index}
              onClick={() => {
                setTranscript(example);
                onVoiceRequest(example);
              }}
              className="text-xs bg-white px-3 py-1 rounded-full text-purple-600 hover:bg-purple-50 transition-colors"
            >
              "{example}"
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// Natural Language Processing for voice requests
function parseVoiceRequest(request: string) {
  const normalizedRequest = request.toLowerCase();
  
  // Extract ingredients
  const ingredientMatches = [];
  const commonIngredients = [
    'peanut butter', 'chocolate', 'egg', 'flour', 'butter', 'sugar', 'milk', 'pasta', 
    'tomato', 'onion', 'garlic', 'cheese', 'chicken', 'beef', 'rice', 'bread'
  ];
  
  for (const ingredient of commonIngredients) {
    if (normalizedRequest.includes(ingredient)) {
      ingredientMatches.push(ingredient);
    }
  }
  
  // Extract meal type
  let mealType = '';
  if (normalizedRequest.includes('breakfast')) mealType = 'breakfast';
  else if (normalizedRequest.includes('lunch')) mealType = 'lunch';
  else if (normalizedRequest.includes('dinner')) mealType = 'dinner';
  else if (normalizedRequest.includes('snack')) mealType = 'snack';
  else if (normalizedRequest.includes('dessert') || normalizedRequest.includes('cake')) mealType = 'dessert';
  
  // Extract dietary preferences
  let dietary = '';
  if (normalizedRequest.includes('vegetarian')) dietary = 'vegetarian';
  else if (normalizedRequest.includes('vegan')) dietary = 'vegan';
  else if (normalizedRequest.includes('eggless')) dietary = 'vegetarian';
  else if (normalizedRequest.includes('gluten free')) dietary = 'gluten-free';
  
  // Extract cooking constraints
  const timeConstraints = [];
  if (normalizedRequest.includes('quick') || normalizedRequest.includes('fast') || normalizedRequest.includes('under') || normalizedRequest.includes('minutes')) {
    timeConstraints.push('quick');
  }
  if (normalizedRequest.includes('mug cake') || normalizedRequest.includes('microwave')) {
    timeConstraints.push('microwave');
  }
  
  return {
    ingredients: ingredientMatches,
    mealType,
    dietary,
    constraints: timeConstraints,
    originalRequest: request
  };
}
