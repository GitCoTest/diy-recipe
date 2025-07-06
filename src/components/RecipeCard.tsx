import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

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

  const handleSave = async () => {
    setSaving(true);
    setError('');
    // Get user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError('You must be signed in to save recipes!');
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

  // If onClose is not provided, render as a preview card
  if (!onClose) {
    return (
      <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-2 border-yellow-200 rounded-3xl shadow-xl overflow-hidden hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer">
        {/* Recipe Image */}
        {recipe.image && (
          <div className="relative h-48 overflow-hidden">
            <img 
              src={recipe.image} 
              alt={recipe.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            {/* Rating overlay */}
            {recipe.rating && (
              <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1">
                <span className="text-yellow-500 text-sm">⭐</span>
                <span className="text-xs font-bold text-gray-700">{recipe.rating.toFixed(1)}</span>
              </div>
            )}
          </div>
        )}
        
        <div className="p-6">
          <div className="text-center">
            {!recipe.image && <div className="text-4xl mb-3">🍽️</div>}
            <h3 className="text-xl font-pacifico text-yellow-700 mb-2">{recipe.title}</h3>
            {recipe.description && (
              <p className="text-yellow-600 text-sm mb-3 italic line-clamp-2">{recipe.description}</p>
            )}
            
            {/* Trust indicators */}
            <div className="flex justify-center gap-2 mb-3">
              {recipe.cookTime && (
                <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-bold border border-yellow-200">
                  ⏱️ {recipe.cookTime}
                </span>
              )}
              {recipe.difficulty && (
                <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-bold border border-yellow-200">
                  📊 {recipe.difficulty}
                </span>
              )}
              {recipe.cuisine && (
                <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-bold border border-yellow-200">
                  🌍 {recipe.cuisine}
                </span>
              )}
            </div>
            
            {/* Reviews indicator */}
            {recipe.reviews && (
              <div className="text-xs text-gray-500 mb-3">
                {recipe.reviews} reviews • Verified Recipe
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
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-custom-pale border-8 border-pink-200 rounded-3xl shadow-2xl max-w-4xl w-full max-h-[95vh] overflow-hidden font-quicksand" style={{backgroundColor: '#f8fbda'}}>
        
        {/* Header */}
        <div className="p-4 relative border-b-4 border-pink-200" style={{backgroundColor: '#f8fbda'}}>
          <button 
            onClick={onClose} 
            className="absolute top-2 right-2 bg-white hover:bg-gray-50 rounded-full p-2 transition-all duration-200 text-pink-300 border border-pink-150"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          <div className="text-center">
            {/* Recipe Image */}
            {recipe.image && (
              <div className="relative mb-4">
                <img 
                  src={recipe.image} 
                  alt={recipe.title}
                  className="w-full h-48 md:h-64 object-cover rounded-2xl shadow-lg"
                  loading="lazy"
                />
                {/* Trust indicators overlay */}
                <div className="absolute top-3 right-3 flex gap-2">
                  {recipe.rating && (
                    <div className="bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1">
                      <span className="text-yellow-500">⭐</span>
                      <span className="text-sm font-bold text-gray-700">{recipe.rating.toFixed(1)}</span>
                    </div>
                  )}
                  {recipe.reviews && (
                    <div className="bg-white/90 backdrop-blur-sm rounded-full px-3 py-1">
                      <span className="text-sm font-bold text-gray-700">{recipe.reviews} reviews</span>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {!recipe.image && <div className="text-4xl mb-2">🍽️</div>}
            <h2 className="text-4xl font-nunito font-black mb-2 text-green-800 uppercase tracking-wider">{recipe.title}</h2>
            
            {/* Professional metadata */}
            <div className="flex justify-center gap-3 mb-3 flex-wrap">
              {recipe.cuisine && (
                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-bold">
                  🌍 {recipe.cuisine}
                </span>
              )}
              {recipe.difficulty && (
                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-bold">
                  📊 {recipe.difficulty}
                </span>
              )}
              {recipe.cookTime && (
                <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm font-bold">
                  ⏱️ {recipe.cookTime}
                </span>
              )}
              {recipe.servings && (
                <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-bold">
                  👥 Serves {recipe.servings}
                </span>
              )}
            </div>
            {recipe.description && (
              <p className="text-gray-600 text-lg italic font-inter">{recipe.description}</p>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto max-h-[calc(95vh-200px)]" style={{backgroundColor: '#f8fbda'}}>
          
          {/* Recipe Info */}
          {(recipe.cookTime || recipe.difficulty || recipe.servings) && (
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              {recipe.cookTime && (
                <div className="border-4 border-pink-200 rounded-2xl px-4 py-3 text-center" style={{backgroundColor: '#f8fbda'}}>
                  <div className="text-2xl mb-1">⏱️</div>
                  <div className="text-gray-800 font-bold font-inter">{recipe.cookTime}</div>
                  <div className="text-gray-600 text-sm font-inter">Cook Time</div>
                </div>
              )}
              {recipe.difficulty && (
                <div className="border-4 border-pink-200 rounded-2xl px-4 py-3 text-center" style={{backgroundColor: '#f8fbda'}}>
                  <div className="text-2xl mb-1">⭐</div>
                  <div className="text-gray-800 font-bold font-inter">{recipe.difficulty}</div>
                  <div className="text-gray-600 text-sm font-inter">Difficulty</div>
                </div>
              )}
              {recipe.servings && (
                <div className="border-4 border-pink-200 rounded-2xl px-4 py-3 text-center" style={{backgroundColor: '#f8fbda'}}>
                  <div className="text-2xl mb-1">🍽️</div>
                  <div className="text-gray-800 font-bold font-inter">{recipe.servings}</div>
                  <div className="text-gray-600 text-sm font-inter">Servings</div>
                </div>
              )}
            </div>
          )}

          {/* Ingredients First */}
          <div className="mb-8">
            <div className="border-4 border-pink-200 rounded-2xl p-6" style={{backgroundColor: '#f8fbda'}}>
              <h3 className="text-3xl text-green-700 mb-4 text-center" style={{fontFamily: "'Dancing Script', 'Brush Script MT', cursive", fontWeight: 600}}>
                🛒 What You&apos;ll Need
              </h3>
              <ul className="space-y-3">
                {recipe.ingredients.map((ingredient, index) => (
                  <li key={index} className="flex items-start gap-3 text-gray-800 font-inter">
                    <span className="bg-pink-100 text-pink-700 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5 border-2 border-pink-200">
                      {index + 1}
                    </span>
                    <span className="font-medium">{ingredient}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Instructions Second */}
          <div className="mb-6">
            <div className="border-4 border-pink-200 rounded-2xl p-6" style={{backgroundColor: '#f8fbda'}}>
              <h3 className="text-3xl text-green-700 mb-4 text-center" style={{fontFamily: "'Dancing Script', 'Brush Script MT', cursive", fontWeight: 600}}>
                👩‍🍳 Let&apos;s Cook Together!
              </h3>
              <div className="space-y-6">
                {recipe.instructions.map((instruction, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <span className="bg-pink-100 text-pink-700 rounded-full w-8 h-8 flex items-center justify-center text-lg font-bold flex-shrink-0 mt-1 border-2 border-pink-200">
                      {index + 1}
                    </span>
                    <div className="flex-1">
                      <p className="text-gray-800 leading-relaxed font-medium font-inter">
                        {enhanceInstruction(instruction, index + 1)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-6 border-t-4 border-pink-200">
            <button
              className={`flex-1 py-4 px-6 rounded-2xl transition-all duration-300 font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 border-4 border-pink-200 font-inter relative ${
                isAlreadySaved 
                  ? 'bg-green-100 text-green-800 cursor-not-allowed' 
                  : 'text-gray-800 hover:bg-pink-50'
              }`}
              style={{backgroundColor: isAlreadySaved ? '#dcfce7' : '#f8fbda'}}
              onClick={handleSave}
              disabled={saving || isAlreadySaved || checkingSavedStatus}
            >
              {checkingSavedStatus ? (
                <>🔄 Checking...</>
              ) : isAlreadySaved ? (
                <>✅ Saved to Cookbook</>
              ) : (
                <>💛 Save to My Cookbook</>
              )}
              {saving && <span className="ml-2 animate-spin">⏳</span>}
            </button>
            <button className="flex-1 text-gray-800 py-4 px-6 rounded-2xl hover:bg-pink-50 transition-all duration-300 font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 border-4 border-pink-200 font-inter" style={{backgroundColor: '#f8fbda'}}>
              📤 Share with Friends
            </button>
          </div>
          {error && <div className="text-red-500 text-sm mt-2 text-center">{error}</div>}
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
        </div>
      </div>
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

<style jsx global>{`
        @keyframes burst-pop {
          0% { transform: scale(0.7); opacity: 0.7; }
          60% { transform: scale(1.2); opacity: 1; }
          100% { transform: scale(1); opacity: 0; }
        }
        .animate-burst-pop {
          animation: burst-pop 1.2s cubic-bezier(0.4,0,0.2,1);
        }
        @keyframes drop1 {
          0% { opacity: 0; transform: translateY(0) scale(0.5); }
          40% { opacity: 1; transform: translateY(-18px) scale(1.2); }
          100% { opacity: 0; transform: translateY(-30px) scale(0.7); }
        }
        .animate-drop1 { animation: drop1 1.2s; }
        @keyframes drop2 {
          0% { opacity: 0; transform: translateY(0) scale(0.5); }
          40% { opacity: 1; transform: translateY(18px) scale(1.2); }
          100% { opacity: 0; transform: translateY(30px) scale(0.7); }
        }
        .animate-drop2 { animation: drop2 1.2s; }
        @keyframes drop3 {
          0% { opacity: 0; transform: translateX(0) scale(0.5); }
          40% { opacity: 1; transform: translateX(-18px) scale(1.2); }
          100% { opacity: 0; transform: translateX(-30px) scale(0.7); }
        }
        .animate-drop3 { animation: drop3 1.2s; }
        @keyframes drop4 {
          0% { opacity: 0; transform: translateX(0) scale(0.5); }
          40% { opacity: 1; transform: translateX(18px) scale(1.2); }
          100% { opacity: 0; transform: translateX(30px) scale(0.7); }
        }
        .animate-drop4 { animation: drop4 1.2s; }
      `}</style>
