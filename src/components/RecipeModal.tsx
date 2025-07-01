import React from 'react';

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

interface RecipeModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipes: Recipe[];
  isLoading: boolean;
}

const RecipeModal: React.FC<RecipeModalProps> = ({ isOpen, onClose, recipes, isLoading }) => {
  const [currentRecipeIndex, setCurrentRecipeIndex] = React.useState(0);
  
  // Reset to first recipe when modal opens (MUST be before early return)
  React.useEffect(() => {
    if (isOpen) {
      setCurrentRecipeIndex(0);
    }
  }, [isOpen]);

  // Early return AFTER all hooks
  if (!isOpen) return null;

  const currentRecipe = recipes[currentRecipeIndex];
  const hasMultipleRecipes = recipes.length > 1;

  const nextRecipe = () => {
    setCurrentRecipeIndex((prev) => (prev + 1) % recipes.length);
  };

  const prevRecipe = () => {
    setCurrentRecipeIndex((prev) => (prev - 1 + recipes.length) % recipes.length);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b-2 border-pink-200 p-6 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <h2 className="text-3xl font-bold text-gray-800" style={{ fontFamily: 'Sacramento, cursive' }}>
                {isLoading ? 'Cooking up your recipes...' : 'Your Personalized Recipe! 🍽️'}
              </h2>
              {hasMultipleRecipes && !isLoading && (
                <div className="bg-pink-100 px-3 py-1 rounded-full text-sm text-pink-700 font-medium">
                  {currentRecipeIndex + 1} of {recipes.length}
                </div>
              )}
            </div>
            <button 
              onClick={onClose}
              className="text-gray-700 hover:text-gray-900 text-3xl font-bold leading-none"
            >
              ×
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4 animate-spin">🍳</div>
              <p className="text-xl text-gray-800">Generating your perfect recipes...</p>
              <div className="mt-4 bg-pink-100 rounded-full h-2 w-64 mx-auto">
                <div className="bg-pink-400 h-2 rounded-full animate-pulse w-3/4"></div>
              </div>
            </div>
          ) : recipes.length > 0 && currentRecipe ? (
            <div className="relative">
              {/* Navigation Arrows */}
              {hasMultipleRecipes && (
                <>
                  <button
                    onClick={prevRecipe}
                    className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-4 bg-white hover:bg-pink-50 text-pink-600 border-2 border-pink-300 rounded-full w-12 h-12 flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-105"
                  >
                    ←
                  </button>
                  <button
                    onClick={nextRecipe}
                    className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-4 bg-white hover:bg-pink-50 text-pink-600 border-2 border-pink-300 rounded-full w-12 h-12 flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-105"
                  >
                    →
                  </button>
                </>
              )}

              {/* Single Recipe Display */}
              <div className="bg-pink-50 rounded-xl p-6 border-2 border-pink-200">
                {/* Recipe Header */}
                <div className="text-center mb-6">
                  <div className="text-6xl mb-3">{currentRecipe.image}</div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">{currentRecipe.title}</h3>
                  <p className="text-gray-800 italic">{currentRecipe.description}</p>
                </div>

                {/* Recipe Stats */}
                <div className="flex justify-center space-x-8 mb-6 bg-white rounded-lg p-4">
                  <div className="text-center">
                    <div className="text-2xl">⏱️</div>
                    <div className="text-sm font-medium">{currentRecipe.cookTime}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl">👨‍🍳</div>
                    <div className="text-sm font-medium">{currentRecipe.difficulty}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl">🍽️</div>
                    <div className="text-sm font-medium">{currentRecipe.servings} servings</div>
                  </div>
                </div>

                {/* Ingredients */}
                <div className="mb-6">
                  <h4 className="text-xl font-bold mb-3 text-gray-800">📝 Ingredients:</h4>
                  <div className="bg-white rounded-lg p-4">
                    <ul className="space-y-2">
                      {currentRecipe.ingredients.map((ingredient, idx) => (
                        <li key={idx} className="flex items-center">
                          <span className="w-2 h-2 bg-pink-400 rounded-full mr-3"></span>
                          <span className="text-gray-700">{ingredient}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Instructions */}
                <div className="mb-6">
                  <h4 className="text-xl font-bold mb-3 text-gray-800">👩‍🍳 Instructions:</h4>
                  <div className="bg-white rounded-lg p-4">
                    <ol className="space-y-3">
                      {currentRecipe.instructions.map((instruction, idx) => (
                        <li key={idx} className="flex items-start">
                          <span className="bg-pink-400 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">
                            {idx + 1}
                          </span>
                          <span className="text-gray-700 flex-1">{instruction}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 justify-center mt-6">
                  <button className="bg-[#f895a2] text-white px-6 py-2 rounded-full font-medium hover:bg-[#f7849a] transition-colors">
                    💾 Save Recipe
                  </button>
                  <button className="bg-green-500 text-white px-6 py-2 rounded-full font-medium hover:bg-green-600 transition-colors">
                    🛒 Add to Grocery List
                  </button>
                  <button className="bg-blue-500 text-white px-6 py-2 rounded-full font-medium hover:bg-blue-600 transition-colors">
                    📤 Share Recipe
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">😅</div>
              <p className="text-xl text-gray-800">Oops! No recipes found. Try selecting different ingredients.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t-2 border-pink-200 p-4 rounded-b-2xl">
          <div className="flex justify-center items-center space-x-4">
            {hasMultipleRecipes && !isLoading && (
              <div className="text-sm text-gray-800">
                Use ← → arrows to navigate recipes
              </div>
            )}
            <button 
              onClick={onClose}
              className="bg-gray-200 text-gray-700 px-8 py-2 rounded-full font-medium hover:bg-gray-300 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeModal;
