import React from 'react';

interface Recipe {
  title: string;
  ingredients: string[];
  instructions: string[];
  prepTime?: string;
  cookTime?: string;
  difficulty?: string;
  description?: string;
  servings?: number;
}

interface RecipeCardProps {
  recipe: Recipe;
  onClose?: () => void;
}

export default function RecipeCard({ recipe, onClose }: RecipeCardProps) {
  // If onClose is not provided, render as a preview card
  if (!onClose) {
    return (
      <div className="bg-gradient-to-br from-white/98 to-yellow-25/30 backdrop-blur-sm border border-yellow-50 rounded-3xl shadow-xl p-6 hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer">
        <div className="text-center">
          <div className="text-4xl mb-3">🍽️</div>
          <h3 className="text-xl font-pacifico text-yellow-600 mb-2">{recipe.title}</h3>
          {recipe.description && (
            <p className="text-yellow-500 text-sm mb-3 italic line-clamp-2">{recipe.description}</p>
          )}
          
          <div className="flex justify-center gap-2 mb-4">
            {recipe.cookTime && (
              <span className="bg-yellow-25/50 text-yellow-600 px-3 py-1 rounded-full text-xs font-bold border border-yellow-50">
                ⏱️ {recipe.cookTime}
              </span>
            )}
            {recipe.difficulty && (
              <span className="bg-yellow-25/50 text-yellow-600 px-3 py-1 rounded-full text-xs font-bold border border-yellow-50">
                ⭐ {recipe.difficulty}
              </span>
            )}
          </div>
          
          <div className="bg-yellow-50/80 text-yellow-700 px-4 py-2 rounded-full text-sm font-semibold inline-block border border-yellow-100">
            Click to view full recipe! 👀
          </div>
        </div>
      </div>
    );
  }

  // Full modal version
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-gradient-to-br from-white to-yellow-25/20 border border-yellow-50 rounded-3xl shadow-2xl max-w-4xl w-full max-h-[95vh] overflow-hidden">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-yellow-25/30 to-yellow-25/50 p-6 relative border-b border-yellow-50">
          <button 
            onClick={onClose} 
            className="absolute top-4 right-4 bg-white/95 hover:bg-white rounded-full p-2 transition-all duration-200 text-yellow-500 border border-yellow-50"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          <div className="text-center">
            <div className="text-5xl mb-2">🍽️</div>
            <h2 className="text-3xl font-pacifico mb-2 text-yellow-600">{recipe.title}</h2>
            {recipe.description && (
              <p className="text-yellow-500 text-lg italic">{recipe.description}</p>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto max-h-[calc(95vh-200px)] bg-gradient-to-br from-white to-yellow-25/15">
          
          {/* Recipe Info */}
          {(recipe.cookTime || recipe.difficulty || recipe.servings) && (
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              {recipe.cookTime && (
                <div className="bg-yellow-25/40 border border-yellow-50 rounded-2xl px-4 py-3 text-center">
                  <div className="text-2xl mb-1">⏱️</div>
                  <div className="text-yellow-600 font-bold">{recipe.cookTime}</div>
                  <div className="text-yellow-500 text-sm">Cook Time</div>
                </div>
              )}
              {recipe.difficulty && (
                <div className="bg-yellow-25/40 border border-yellow-50 rounded-2xl px-4 py-3 text-center">
                  <div className="text-2xl mb-1">⭐</div>
                  <div className="text-yellow-600 font-bold">{recipe.difficulty}</div>
                  <div className="text-yellow-500 text-sm">Difficulty</div>
                </div>
              )}
              {recipe.servings && (
                <div className="bg-yellow-25/40 border border-yellow-50 rounded-2xl px-4 py-3 text-center">
                  <div className="text-2xl mb-1">🍽️</div>
                  <div className="text-yellow-600 font-bold">{recipe.servings}</div>
                  <div className="text-yellow-500 text-sm">Servings</div>
                </div>
              )}
            </div>
          )}

          {/* Ingredients First */}
          <div className="mb-8">
            <div className="bg-gradient-to-br from-yellow-25/30 to-yellow-50/40 border border-yellow-50 rounded-2xl p-6">
              <h3 className="text-2xl font-pacifico text-yellow-600 mb-4 text-center">
                🛒 What You'll Need
              </h3>
              <ul className="space-y-3">
                {recipe.ingredients.map((ingredient, index) => (
                  <li key={index} className="flex items-start gap-3 text-yellow-700">
                    <span className="bg-yellow-50/80 text-yellow-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5 border border-yellow-100">
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
            <div className="bg-gradient-to-br from-yellow-50/40 to-yellow-25/30 border border-yellow-50 rounded-2xl p-6">
              <h3 className="text-2xl font-pacifico text-yellow-600 mb-4 text-center">
                👩‍🍳 Let's Cook Together!
              </h3>
              <div className="space-y-6">
                {recipe.instructions.map((instruction, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <span className="bg-yellow-50/80 text-yellow-600 rounded-full w-8 h-8 flex items-center justify-center text-lg font-bold flex-shrink-0 mt-1 border border-yellow-100">
                      {index + 1}
                    </span>
                    <div className="flex-1">
                      <p className="text-yellow-700 leading-relaxed font-medium">
                        {enhanceInstruction(instruction, index + 1)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-6 border-t border-yellow-50">
            <button className="flex-1 bg-gradient-to-r from-yellow-50/60 to-yellow-25/50 text-yellow-700 py-4 px-6 rounded-2xl hover:from-yellow-75/80 hover:to-yellow-50/70 transition-all duration-300 font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 border border-yellow-100">
              💛 Save to My Cookbook
            </button>
            <button className="flex-1 bg-gradient-to-r from-yellow-25/50 to-yellow-50/60 text-yellow-700 py-4 px-6 rounded-2xl hover:from-yellow-50/70 hover:to-yellow-75/80 transition-all duration-300 font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 border border-yellow-100">
              📤 Share with Friends
            </button>
          </div>
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
