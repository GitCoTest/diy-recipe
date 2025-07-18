"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import RecipeCard from "@/components/RecipeCard";

export default function SavedRecipesPage() {
  const [recipes, setRecipes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecipe, setSelectedRecipe] = useState<any>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState<string>('');
  const [processingAction, setProcessingAction] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecipes = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setRecipes([]);
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`/api/recipes/saved?userId=${user.id}`);
        const result = await res.json();
        if (result.success && Array.isArray(result.recipes)) {
          setRecipes(result.recipes);
        }
      } catch (error) {
        console.error('Error fetching saved recipes:', error);
      }
      setLoading(false);
    };
    fetchRecipes();
  }, []);

  const handleViewRecipe = (recipe: any) => {
    // Convert saved recipe format to RecipeCard format
    const formattedRecipe = {
      title: recipe.title,
      description: recipe.description,
      ingredients: recipe.ingredients,
      instructions: recipe.instructions,
      cookTime: recipe.cookTime,
      difficulty: recipe.difficulty,
      servings: recipe.servings
    };
    setSelectedRecipe(formattedRecipe);
  };

  const handleCloseRecipe = () => {
    setSelectedRecipe(null);
  };

  const handleToggleFavorite = async (recipeId: string, currentFavorite: boolean) => {
    if (processingAction === recipeId) return; // Prevent double-click
    
    setProcessingAction(recipeId);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const res = await fetch('/api/recipes/saved', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          recipeId, 
          userId: user.id, 
          favorite: !currentFavorite 
        }),
      });
      
      const result = await res.json();
      if (result.success) {
        // Update the local state
        setRecipes(prev => prev.map(recipe => 
          recipe.id === recipeId 
            ? { ...recipe, favorite: !currentFavorite }
            : recipe
        ));
        
        // Show success message
        setShowSuccessMessage(!currentFavorite ? '⭐ Added to favorites!' : '💔 Removed from favorites');
        setTimeout(() => setShowSuccessMessage(''), 2000);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      setShowSuccessMessage('❌ Failed to update favorite status');
      setTimeout(() => setShowSuccessMessage(''), 2000);
    } finally {
      setProcessingAction(null);
    }
  };

  const handleDeleteRecipe = async (recipeId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const res = await fetch(`/api/recipes/saved?recipeId=${recipeId}&userId=${user.id}`, {
        method: 'DELETE',
      });
      
      const result = await res.json();
      if (result.success) {
        // Remove the recipe from local state
        setRecipes(prev => prev.filter(recipe => recipe.id !== recipeId));
        setShowDeleteConfirm(null);
        
        // Show success message
        setShowSuccessMessage('🗑️ Recipe deleted successfully!');
        setTimeout(() => setShowSuccessMessage(''), 2000);
      } else {
        setShowSuccessMessage('❌ Failed to delete recipe');
        setTimeout(() => setShowSuccessMessage(''), 2000);
      }
    } catch (error) {
      console.error('Error deleting recipe:', error);
      setShowSuccessMessage('❌ Failed to delete recipe');
      setTimeout(() => setShowSuccessMessage(''), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-pink-50 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Back to Home Button */}
        <div className="mb-6">
          <Link href="/" className="text-green-700 hover:text-green-800 font-bold text-lg flex items-center gap-2">
            ← Back to Home
          </Link>
        </div>

        {/* Page Title */}
        <h1 className="text-5xl font-bold text-green-700 mb-8 text-center uppercase tracking-wider font-nunito">
          💾 MY SAVED RECIPES
        </h1>

        {/* Content */}
        {loading ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-6 animate-spin">🍽️</div>
            <div className="text-3xl text-green-700 font-bold mb-4" style={{fontFamily: "'Dancing Script', cursive"}}>
              Loading your delicious recipes...
            </div>
            <div className="text-lg text-gray-600">Just a moment! 🥄✨</div>
          </div>
        ) : recipes.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-8xl mb-6 animate-bounce">🍽️</div>
            <h2 className="text-4xl font-bold text-green-700 mb-4" style={{fontFamily: "'Dancing Script', cursive"}}>
              No Saved Recipes Yet!
            </h2>
            <p className="text-gray-600 text-xl mb-8 leading-relaxed max-w-md mx-auto">
              Start exploring and save your favorite recipes to see them here! 🥰
            </p>
            <Link href="/" className="bg-gradient-to-r from-pink-200 to-yellow-200 hover:from-pink-300 hover:to-yellow-300 text-green-800 font-bold py-4 px-10 rounded-full shadow-lg transition-all duration-200 border-4 border-pink-300 hover:border-pink-400 transform hover:scale-105 text-lg">
              🔍 Discover Recipes
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {recipes.map((recipe) => (
              <div key={recipe.id} className="group relative bg-gradient-to-br from-pink-50 to-pink-100 border-4 border-pink-200 rounded-3xl p-4 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 hover:border-pink-300">
                {/* Favorite indicator - top left */}
                {recipe.favorite && (
                  <div className="absolute -top-2 -left-2 bg-yellow-200 text-yellow-600 rounded-full w-8 h-8 flex items-center justify-center text-lg shadow-lg border-2 border-yellow-300 z-10">
                    ⭐
                  </div>
                )}

                {/* Action buttons in top right */}
                <div className="absolute top-3 right-3 flex gap-2 opacity-70 group-hover:opacity-100 transition-opacity duration-200">
                  <button
                    onClick={() => handleToggleFavorite(recipe.id, recipe.favorite)}
                    disabled={processingAction === recipe.id}
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-lg transition-all duration-200 shadow-md border-2 ${
                      processingAction === recipe.id 
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed border-gray-300' 
                        : recipe.favorite 
                          ? 'bg-yellow-200 text-yellow-600 hover:bg-yellow-300 border-yellow-300 hover:scale-110' 
                          : 'bg-white text-gray-400 hover:bg-yellow-100 hover:text-yellow-500 border-gray-200 hover:border-yellow-300 hover:scale-110'
                    }`}
                    title={recipe.favorite ? "Remove from favorites" : "Add to favorites"}
                  >
                    {processingAction === recipe.id ? '⏳' : recipe.favorite ? '⭐' : '☆'}
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(recipe.id)}
                    className="w-9 h-9 rounded-full bg-white text-red-500 hover:bg-red-100 hover:text-red-600 flex items-center justify-center text-lg transition-all duration-200 shadow-md border-2 border-gray-200 hover:border-red-300 hover:scale-110"
                    title="Delete recipe"
                  >
                    ✕
                  </button>
                </div>

                <div className="text-center pt-2">
                  {/* Recipe Icon */}
                  <div className="text-4xl mb-3 filter drop-shadow-sm">🍽️</div>
                  
                  {/* Recipe Title */}
                  <h3 className="text-lg font-bold text-gray-800 leading-tight mb-3 min-h-[2.5rem] flex items-center justify-center text-center" 
                      style={{fontFamily: "'Dancing Script', cursive"}}>
                    {recipe.title}
                  </h3>
                  
                  {/* Additional Info */}
                  <div className="flex justify-center gap-2 mb-3 text-xs">
                    {recipe.cookTime && (
                      <span className="bg-pink-200 text-pink-700 px-2 py-1 rounded-full font-semibold border border-pink-300">
                        ⏱️ {recipe.cookTime}
                      </span>
                    )}
                    {recipe.difficulty && (
                      <span className="bg-pink-200 text-pink-700 px-2 py-1 rounded-full font-semibold border border-pink-300">
                        ⭐ {recipe.difficulty}
                      </span>
                    )}
                  </div>
                  
                  {/* View Recipe Button */}
                  <div className="pt-3 border-t-2 border-pink-200">
                    <button 
                      onClick={() => handleViewRecipe(recipe)}
                      className="bg-pink-200 hover:bg-pink-300 text-pink-800 font-bold py-2 px-5 rounded-full text-sm transition-all duration-200 border-2 border-pink-300 hover:border-pink-400 shadow-md hover:shadow-lg transform hover:scale-105"
                    >
                      View Recipe 👀
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recipe Modal */}
      {selectedRecipe && (
        <RecipeCard 
          recipe={selectedRecipe} 
          onClose={handleCloseRecipe}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-gradient-to-br from-red-50 to-pink-50 border-4 border-red-200 rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl transform animate-pulse">
            <div className="text-center">
              <div className="text-6xl mb-4 animate-bounce">🗑️</div>
              <h3 className="text-3xl font-bold text-red-700 mb-4" style={{fontFamily: "'Dancing Script', cursive"}}>
                Delete Recipe?
              </h3>
              <p className="text-gray-600 mb-6 text-lg leading-relaxed">
                Are you sure you want to delete this delicious recipe? 🥺<br/>
                <span className="text-sm text-gray-500 italic">This action cannot be undone.</span>
              </p>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="px-8 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-full font-bold transition-all duration-200 border-2 border-gray-300 hover:scale-105 shadow-md"
                >
                  Keep It! 💚
                </button>
                <button
                  onClick={() => handleDeleteRecipe(showDeleteConfirm)}
                  className="px-8 py-3 bg-red-500 hover:bg-red-600 text-white rounded-full font-bold transition-all duration-200 border-2 border-red-600 hover:scale-105 shadow-md"
                >
                  Delete 🗑️
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Message */}
      {showSuccessMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50">
          <div className="bg-green-500 text-white font-bold px-8 py-4 rounded-full shadow-lg text-lg flex items-center gap-2 animate-bounce">
            {showSuccessMessage}
          </div>
        </div>
      )}
    </div>
  );
}
