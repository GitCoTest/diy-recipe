'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import IngredientSelector from '@/components/IngredientSelector';
import Preferences from '@/components/Preferences';
import RecipeCard from '@/components/RecipeCard';
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
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [mobileDiscoverOpen, setMobileDiscoverOpen] = useState(false);
  const [mobileGroceryOpen, setMobileGroceryOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  
  // Voice functionality states
  const [isListening, setIsListening] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [botMessage, setBotMessage] = useState("Hi! I'm your cooking assistant. Tell me what you'd like to cook!");
  const [recognition, setRecognition] = useState<any>(null);
  const [interimTranscript, setInterimTranscript] = useState('');
  
  // Mascot states
  const [selectedMascot, setSelectedMascot] = useState('strawberry');
  const [showMascotMessage, setShowMascotMessage] = useState(false);
  const [mascotAnimated, setMascotAnimated] = useState(false);

  // Initialize voice recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      setVoiceSupported(!!SpeechRecognition);
    }

    // Cleanup function
    return () => {
      if (recognition) {
        recognition.stop();
      }
    };
  }, [recognition]);

  // Close mobile dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('nav') && !target.closest('.mobile-dropdown')) {
        setMobileDiscoverOpen(false);
        setMobileGroceryOpen(false);
        setSettingsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Mascot animation effect on page load
  useEffect(() => {
    const timer = setTimeout(() => {
      setMascotAnimated(true);
      setTimeout(() => {
        setShowMascotMessage(true);
        // Remove the timeout that hides the message - keep it visible
      }, 800); // Show message after mascot animation
    }, 1000); // Start animation after 1 second

    return () => clearTimeout(timer);
  }, []);

  // Get mascot info
  const getMascotInfo = (mascot: string) => {
    const mascots = {
      strawberry: { name: 'Strawberry', emoji: '🍓' },
      boba: { name: 'Boba', emoji: '🧋' },
      egg: { name: 'Egg', emoji: '🥚' },
      mochi: { name: 'Mochi', emoji: '🍡' }
    };
    return mascots[mascot as keyof typeof mascots] || mascots.strawberry;
  };
  
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

    // Stop any existing recognition
    if (recognition) {
      recognition.stop();
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const newRecognition = new SpeechRecognition();
    
    newRecognition.continuous = true;
    newRecognition.interimResults = true;
    newRecognition.lang = 'en-US';
    newRecognition.maxAlternatives = 1;

    // Auto-stop after 10 seconds of listening (mobile-friendly)
    const timeout = setTimeout(() => {
      if (newRecognition) {
        newRecognition.stop();
      }
    }, 10000);

    newRecognition.onstart = () => {
      setIsListening(true);
      setVoiceTranscript('');
      setInterimTranscript('');
      setBotMessage("I'm listening... Tell me what you'd like to cook!");
    };

    newRecognition.onresult = (event: any) => {
      let finalTranscript = '';
      let interimText = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimText += transcript;
        }
      }

      // Update real-time transcript
      if (interimText) {
        setInterimTranscript(interimText);
        setVoiceTranscript(finalTranscript + interimText);
      }

      // If we have a final result, process it
      if (finalTranscript) {
        clearTimeout(timeout);
        setVoiceTranscript(finalTranscript);
        setInterimTranscript('');
        setIsListening(false);
        newRecognition.stop();
        processVoiceRequest(finalTranscript);
      }
    };

    newRecognition.onerror = (event: any) => {
      clearTimeout(timeout);
      setIsListening(false);
      setInterimTranscript('');
      console.error('Speech recognition error:', event.error);
      
      if (event.error === 'no-speech') {
        setBotMessage("I didn't hear anything. Try speaking louder or closer to your device!");
      } else if (event.error === 'audio-capture') {
        setBotMessage("Microphone access denied. Please allow microphone access and try again.");
      } else {
        setBotMessage("Sorry, I had trouble hearing you. Try again or use manual selection below!");
      }
    };

    newRecognition.onend = () => {
      clearTimeout(timeout);
      setIsListening(false);
      setInterimTranscript('');
    };

    setRecognition(newRecognition);
    newRecognition.start();
  };

  // Function to manually stop listening
  const stopVoiceRecognition = () => {
    if (recognition && isListening) {
      recognition.stop();
      setIsListening(false);
      setInterimTranscript('');
    }
  };

  const scrollToManualSelection = () => {
    setTimeout(() => {
      const manualSection = document.querySelector('[data-manual-selection]');
      if (manualSection) {
        manualSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
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
      
      // Load user's selected mascot (if logged in)
      if (data.user) {
        // This would typically come from user preferences/database
        // For now, we'll keep strawberry as default
        // TODO: Implement user mascot preference storage
        setSelectedMascot('strawberry');
      }
    };
    getUser();
    const { data: listener } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      setUser(session?.user ?? null);
    });
    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  return (
    <div className="min-h-screen bg-yellow-50">
      {/* Header Navigation */}
      <div className="w-full flex justify-center items-center pt-2 sm:pt-4 pb-2 z-40 relative">
        <div className="flex flex-row gap-2 sm:gap-4 w-auto px-2 sm:px-0">
          {/* Mobile Navigation - Emojis Only */}
          <nav className="sm:hidden floating-zoom flex flex-row gap-3 px-3 py-2 bg-white/90 backdrop-blur border border-pink-200 shadow-xl rounded-full items-center text-xl font-bold text-gray-800">
            <Link href="/" className="hover:text-pink-600 transition-colors p-1">
              🏠
            </Link>
            <button 
              onClick={() => {
                setMobileDiscoverOpen(!mobileDiscoverOpen);
                setMobileGroceryOpen(false);
                setSettingsOpen(false);
              }}
              className="hover:text-pink-600 transition-colors bg-transparent border-0 p-1 m-0 font-bold cursor-pointer relative"
            >
              🔎
              {mobileDiscoverOpen && (
                <div className="absolute top-full left-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 py-2 w-32 z-50">
                  <a href="#discover" className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-100 transition-colors text-sm">
                    <span>🔎</span><span>Discover</span>
                  </a>
                </div>
              )}
            </button>
            <button 
              type="button" 
              onClick={surpriseMe} 
              className="hover:text-pink-600 transition-colors bg-transparent border-0 p-1 m-0 font-bold cursor-pointer"
            >
              💡
            </button>
            <button 
              onClick={() => window.location.href = '/saved-recipes'} 
              className="hover:text-pink-600 transition-colors bg-transparent border-0 p-1 m-0 font-bold cursor-pointer"
            >
              📖
            </button>
            <button 
              onClick={() => {
                setMobileGroceryOpen(!mobileGroceryOpen);
                setMobileDiscoverOpen(false);
                setSettingsOpen(false);
              }}
              className="hover:text-pink-600 transition-colors bg-transparent border-0 p-1 m-0 font-bold cursor-pointer relative"
            >
              🛒
              {mobileGroceryOpen && (
                <div className="absolute top-full right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 py-2 w-32 z-50">
                  <a href="#grocery" className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-100 transition-colors text-sm">
                    <span>🛒</span><span>Grocery</span>
                  </a>
                </div>
              )}
            </button>
            {/* Settings in same line for mobile */}
            <button
              onClick={() => {
                setSettingsOpen(!settingsOpen);
                setMobileDiscoverOpen(false);
                setMobileGroceryOpen(false);
              }}
              className="hover:text-pink-600 transition-colors bg-transparent border-0 p-1 m-0 font-bold cursor-pointer relative"
            >
              ⚙️
              {settingsOpen && (
                <div className="absolute top-full right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 py-2 w-40 z-50">
                  {!user ? (
                    <>
                      <a href="/login" className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-100 transition-colors text-sm">
                        <span>🔑</span><span>Log In</span>
                      </a>
                      <a href="/signup" className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-100 transition-colors text-sm">
                        <span>📝</span><span>Sign Up</span>
                      </a>
                    </>
                  ) : (
                    <a href="/profile" className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-100 transition-colors text-sm">
                      <span>👤</span><span>Profile</span>
                    </a>
                  )}
                </div>
              )}
            </button>
          </nav>

          {/* Desktop Navigation - Full Names */}
          <nav className="hidden sm:flex floating-zoom flex-row gap-6 md:gap-10 px-6 py-2 bg-white/90 backdrop-blur border border-pink-200 shadow-xl rounded-full items-center text-base md:text-lg font-bold text-gray-800">
            <Link href="/" className="flex items-center gap-2 hover:text-pink-600 transition-colors whitespace-nowrap">
              <span className="text-xl md:text-2xl">🏠</span>
              <span className="tracking-wide">Home</span>
            </Link>
            <a href="#discover" className="flex items-center gap-2 hover:text-pink-600 transition-colors whitespace-nowrap">
              <span className="text-xl md:text-2xl">🔎</span>
              <span className="tracking-wide">Discover</span>
            </a>
            <button type="button" onClick={surpriseMe} className="flex items-center gap-2 hover:text-pink-600 transition-colors bg-transparent border-0 p-0 m-0 font-bold cursor-pointer whitespace-nowrap">
              <span className="text-xl md:text-2xl">💡</span>
              <span className="tracking-wide">Surprise Me!</span>
            </button>
            <button onClick={() => window.location.href = '/saved-recipes'} className="flex items-center gap-2 hover:text-pink-600 transition-colors bg-transparent border-0 p-0 m-0 font-bold cursor-pointer whitespace-nowrap">
              <span className="text-xl md:text-2xl">📖</span>
              <span className="tracking-wide">Saved</span>
            </button>
            <a href="#grocery" className="flex items-center gap-2 hover:text-pink-600 transition-colors whitespace-nowrap">
              <span className="text-xl md:text-2xl">🛒</span>
              <span className="tracking-wide">Grocery</span>
            </a>
          </nav>
          
          {/* Desktop Settings Button */}
          <div className="hidden sm:flex relative items-center justify-start">
            <button
              onClick={() => setSettingsOpen(!settingsOpen)}
              className="floating-zoom flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-200 text-base"
            >
              <span className="text-lg">⚙️</span>
              <span className="text-gray-700 font-medium">Settings</span>
              <span className={`transform transition-transform ${settingsOpen ? 'rotate-180' : ''}`}>▼</span>
            </button>
            {settingsOpen && (
              <div className="absolute right-0 top-full mt-2 bg-white rounded-lg shadow-xl border border-gray-200 py-2 w-48 z-50">
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

      {/* Customize Your Meal Image - Centered Below Header */}
      <div className="w-full flex justify-center pt-4 pb-2">
        <div className="relative">
          <Image 
            src="/customize-your-meal-heading.png" 
            alt="Customize Your Meal" 
            className="rounded-xl transition-transform duration-200 hover:scale-105"
            style={{ maxHeight: '240px' }}
            width={900}
            height={300}
          />
          <div className="absolute inset-0 pointer-events-none">
            <span className="tiny-sparkle ts-1">✦</span>
            <span className="tiny-sparkle ts-2">✦</span>
            <span className="tiny-sparkle ts-3">✦</span>
            <span className="tiny-sparkle ts-4">✦</span>
            <span className="tiny-sparkle ts-5">✦</span>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-2 sm:px-4 py-2 sm:py-4">
        {/* Voice Bot - Primary Interface */}
        <div className="mb-6">
          {/* Mascot Section */}
          <div className="flex justify-center items-center mb-4 relative">
            <div className="flex flex-row items-center gap-2 sm:gap-8">
              {/* Mascot Image */}
              <div className={`transition-all duration-800 ease-in-out ${
                mascotAnimated ? 'transform scale-105' : ''
              }`}>
                <Image
                  src={`/mascots/${selectedMascot}.png`}
                  alt={getMascotInfo(selectedMascot).name}
                  width={80}
                  height={80}
                  className="w-16 h-16 sm:w-24 sm:h-24 md:w-[120px] md:h-[120px] drop-shadow-lg hover:scale-110 transition-transform duration-300"
                  style={{ 
                    filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))',
                    objectFit: 'contain'
                  }}
                />
              </div>
              
              {/* Speech Bubble */}
              {showMascotMessage && (
                <div className="cloud-bubble animate-bounce-in z-10">
                  <div className="cloud-tail"></div>
                  <div className="cloud-puff-left"></div>
                  <div className="cloud-puff-right"></div>
                  <div className="cloud-puff-right-small"></div>
                  <div className="cloud-puff-top-1"></div>
                  <div className="cloud-puff-top-2"></div>
                  <div className="cloud-puff-top-3"></div>
                  <div className="cloud-puff-top-4"></div>
                  <div className="cloud-puff-top-5"></div>
                  <div className="cloud-puff-top-6"></div>
                  <div className="cloud-puff-bottom-1"></div>
                  <div className="cloud-puff-bottom-2"></div>
                  <div className="cloud-puff-bottom-3"></div>
                  <div className="cloud-puff-bottom-4"></div>
                  <div className="cloud-puff-bottom-5"></div>
                  <div className="cloud-content">
                    <div className="text-center">
                      <span className="font-bold text-pink-600 text-sm sm:text-base md:text-lg block" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                        Hey, I'm Berry!
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-4">
            <button
              onClick={isListening ? stopVoiceRecognition : startVoiceRecognition}
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
                  Stop Listening
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
          </div>

          {/* Voice Transcript Display - Real-time */}
          {(voiceTranscript || interimTranscript || isListening) && (
            <div className="flex justify-center mb-4">
              <div className="bg-purple-50 border border-purple-200 rounded-full px-4 py-2 max-w-md min-h-[2.5rem] flex items-center">
                {isListening && !voiceTranscript && !interimTranscript ? (
                  <p className="text-sm text-purple-500 text-center font-medium animate-pulse">
                    Listening...
                  </p>
                ) : (
                  <p className="text-sm text-purple-700 text-center font-medium">
                    {voiceTranscript || interimTranscript ? `"${voiceTranscript || interimTranscript}"` : ''}
                    {isListening && interimTranscript && (
                      <span className="animate-pulse text-purple-500">|</span>
                    )}
                  </p>
                )}
              </div>
            </div>
          )}

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
              onClick={scrollToManualSelection}
              className="text-lg font-semibold text-purple-700 hover:text-purple-900 transition-colors duration-200 bg-white px-6 py-3 rounded-full border-2 border-purple-300 hover:border-purple-500 shadow-md hover:shadow-lg transform hover:scale-105"
              style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
            >
              ✋ Choose Ingredients Manually
            </button>
          </div>
        </div>

        {/* Manual Selection - Always Visible */}
        <div className="mt-8" data-manual-selection>
          <div className="text-center mb-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-purple-800 mb-2" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
              Manual Selection
            </h2>
            <p className="text-purple-600 font-medium" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
              Choose your ingredients and preferences below
            </p>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-6 mb-6 sm:mb-8 px-1 sm:px-0">
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
              style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
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
              style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
            >
              <span className="hidden sm:inline">Further Customize</span>
              <span className="sm:hidden">Customize</span>
            </button>
          </div>
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
