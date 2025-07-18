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
  
  const handleIngredientsChange = (ingredients: { base: string[], main: string[] }) => {
    setSelectedIngredients(ingredients);
  };

  const handlePreferencesChange = (preferences: { mealType: string, dietary: string }) => {
    setSelectedPreferences(preferences);
  };

  // Process voice input and extract cooking parameters
  const processVoiceRequest = async (transcript: string) => {
    setBotMessage("Got it! Let me find some recipes for you...");
    
    // Instead of trying to parse everything, let GPT handle the natural language
    // Just extract some basic hints and pass the full request to GPT
    const request = transcript.toLowerCase();
    
    // Extract basic meal type
    let mealType = '';
    if (request.includes('breakfast')) mealType = 'breakfast';
    else if (request.includes('lunch')) mealType = 'lunch';
    else if (request.includes('dinner')) mealType = 'dinner';
    else if (request.includes('snack')) mealType = 'snack';
    else if (request.includes('dessert') || request.includes('cake')) mealType = 'dessert';

    // Extract basic dietary preferences  
    let dietary = '';
    if (request.includes('vegetarian') || request.includes('eggless')) dietary = 'vegetarian';
    else if (request.includes('vegan')) dietary = 'vegan';
    else if (request.includes('gluten free')) dietary = 'gluten-free';

    // Call recipe generation with the full voice request
    await generateRecipesFromVoice(transcript, mealType, dietary);
  };

  const generateRecipesFromVoice = async (voiceRequest: string, mealType: string, dietary: string) => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/working', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          baseIngredients: [], // Let GPT extract from voice request
          mainIngredients: [], // Let GPT extract from voice request  
          mealType: mealType,
          dietary: dietary,
          customizations: {
            voiceRequest: voiceRequest, // Pass the full voice request to GPT
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
      setIsListening(false);
      processVoiceRequest(transcript);
    };

    recognition.onerror = () => {
      setIsListening(false);
      setBotMessage("Sorry, I didn't catch that. Try again or use manual selection below!");
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      speechSynthesis.speak(utterance);
    }
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
    <div className="min-h-screen bg-yellow-50">
      {/* Header Navigation */}
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
          
          {/* Settings Button */}
          <div className="relative flex items-center justify-center sm:justify-start">
            <button
              onClick={() => setSettingsOpen(!settingsOpen)}
              className="floating-zoom flex items-center gap-2 bg-white rounded-full px-3 sm:px-4 py-2 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-200 text-sm sm:text-base"
            >
              <span className="text-base sm:text-lg">⚙️</span>
              <span className="text-gray-700 font-medium">Settings</span>
              <span className={`transform transition-transform ${settingsOpen ? 'rotate-180' : ''}`}>▼</span>
            </button>
            {settingsOpen && (
              <div className="absolute right-0 top-full mt-2 bg-white rounded-lg shadow-xl border border-gray-200 py-2 w-48 z-10">
                {!user ? (
                  <>
                    <a href="/login" className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors">
                      <span>🔑</span><span>Log In</span>
                    </a>
                    <a href="/signup" className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors">
                      <span>📝</span><span>Sign Up</span>
                    </a>
                  </>
                ) : (
                  <a href="/profile" className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors">
                    <span>👤</span><span>Profile Settings</span>
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
        {/* Voice Bot - Primary Interface */}
        <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl p-6 mb-6 shadow-lg">
          <div className="text-center mb-6">
            <div className="text-6xl mb-3 animate-bounce">
              {isListening ? '🎤' : isGenerating ? '👨‍🍳' : '🤖'}
            </div>
            <div className="bg-white rounded-lg p-4 shadow-md max-w-md mx-auto">
              <p className="text-gray-800 font-medium">{botMessage}</p>
              {voiceTranscript && (
                <div className="mt-2 p-2 bg-gray-50 rounded text-sm text-gray-600">
                  You said: "{voiceTranscript}"
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-6">
            <button
              onClick={startVoiceRecognition}
              disabled={!voiceSupported || isGenerating}
              className={`px-8 py-4 rounded-full font-bold text-lg shadow-lg transform transition-all duration-200 ${
                isListening 
                  ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse' 
                  : !voiceSupported || isGenerating
                  ? 'bg-gray-400 cursor-not-allowed text-white'
                  : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white hover:scale-105'
              }`}
            >
              {isListening ? (
                <span className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-white rounded-full animate-ping"></div>
                  Listening...
                </span>
              ) : !voiceSupported ? (
                'Voice Not Supported'
              ) : isGenerating ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Processing...
                </span>
              ) : (
                <span className="flex items-center gap-2">🎤 Tell Me What To Cook</span>
              )}
            </button>

            <button
              onClick={() => speak(botMessage)}
              className="px-6 py-3 rounded-full bg-white border-2 border-purple-300 text-purple-600 font-medium hover:bg-purple-50 transition-all duration-200"
            >
              🔊 Repeat
            </button>
          </div>

          {/* Example Voice Commands */}
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-3">Try saying something like:</p>
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
                    setVoiceTranscript(example);
                    processVoiceRequest(example);
                  }}
                  className="text-xs bg-white px-3 py-1 rounded-full text-purple-600 hover:bg-purple-50 transition-colors border border-purple-200"
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
              className="text-purple-600 hover:text-purple-800 font-medium underline"
            >
              {showManualSelection ? 'Hide Manual Selection' : 'Or choose ingredients manually'}
            </button>
          </div>
        </div>

        {/* Heading Image */}
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

        {/* Manual Selection (Collapsible) */}
        {showManualSelection && (
          <div className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
              <IngredientSelector onIngredientsChange={handleIngredientsChange} />
              <Preferences onPreferencesChange={handlePreferencesChange} />
            </div>

            <div className="flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-4 mb-8 sm:mb-12">
              <button
                onClick={generateRecipes}
                disabled={isGenerating}
                className={`w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 rounded-full text-white font-bold text-base sm:text-lg shadow-lg transform transition-all duration-200 ${
                  isGenerating 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 hover:scale-105'
                }`}
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
          </div>
        )}

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
    </div>
  );
}
