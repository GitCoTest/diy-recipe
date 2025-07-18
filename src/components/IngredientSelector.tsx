'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface IngredientSelectorProps {
  onIngredientsChange: (ingredients: { base: string[], main: string[] }) => void;
}

export default function IngredientSelector({ onIngredientsChange }: IngredientSelectorProps) {
  const [selectedBaseIngredients, setSelectedBaseIngredients] = useState<string[]>([]);
  const [selectedMainIngredients, setSelectedMainIngredients] = useState<string[]>([]);
  const [customBaseInput, setCustomBaseInput] = useState('');
  const [customMainInput, setCustomMainInput] = useState('');
  const [isValidatingBase, setIsValidatingBase] = useState(false);
  const [isValidatingMain, setIsValidatingMain] = useState(false);
  const [baseSearchTerm, setBaseSearchTerm] = useState('');
  const [mainSearchTerm, setMainSearchTerm] = useState('');
  const [validationError, setValidationError] = useState('');
  const [baseIngredients, setBaseIngredients] = useState([
    // Grains & Starches
    { name: 'Rice', emoji: '🍚' },
    { name: 'Flour', emoji: '🌾' },
    { name: 'Wheat', emoji: '🌾' },
    { name: 'Bread', emoji: '�' },
    { name: 'Pasta', emoji: '🍝' },
    { name: 'Noodles', emoji: '🍜' },
    { name: 'Oats', emoji: '🥣' },
    { name: 'Quinoa', emoji: '�' },
    { name: 'Barley', emoji: '🌾' },
    { name: 'Millet', emoji: '�' },
    { name: 'Buckwheat', emoji: '🌾' },
    { name: 'Corn flour', emoji: '🌽' },
    { name: 'Semolina', emoji: '🌾' },
    { name: 'Couscous', emoji: '🌾' }
  ]);
  const [mainIngredients, setMainIngredients] = useState([
    // Vegetables
    { name: 'Tomato', emoji: '🍅' },
    { name: 'Onion', emoji: '🧅' },
    { name: 'Garlic', emoji: '🧄' },
    { name: 'Ginger', emoji: '🫚' },
    { name: 'Potato', emoji: '🥔' },
    { name: 'Carrot', emoji: '🥕' },
    { name: 'Bell pepper', emoji: '🫑' },
    { name: 'Spinach', emoji: '🥬' },
    { name: 'Lettuce', emoji: '🥬' },
    { name: 'Cucumber', emoji: '🥒' },
    { name: 'Broccoli', emoji: '🥦' },
    { name: 'Cauliflower', emoji: '🥦' },
    { name: 'Cabbage', emoji: '🥬' },
    { name: 'Celery', emoji: '🥬' },
    { name: 'Zucchini', emoji: '🥒' },
    { name: 'Eggplant', emoji: '🍆' },
    { name: 'Mushroom', emoji: '🍄' },
    { name: 'Corn', emoji: '🌽' },
    { name: 'Peas', emoji: '🟢' },
    { name: 'Beans', emoji: '🫘' },
    { name: 'Lentils', emoji: '🫘' },
    { name: 'Chickpeas', emoji: '🫘' },
    { name: 'Okra', emoji: '🥒' },
    { name: 'Bottle gourd', emoji: '🥒' },
    { name: 'Bitter gourd', emoji: '🥒' },
    { name: 'Ridge gourd', emoji: '🥒' },
    { name: 'Snake gourd', emoji: '🥒' },
    { name: 'Pumpkin', emoji: '🎃' },
    { name: 'Squash', emoji: '🥒' },
    { name: 'Radish', emoji: '🥕' },
    { name: 'Turnip', emoji: '🥕' },
    { name: 'Beetroot', emoji: '🥕' },
    { name: 'Sweet potato', emoji: '🍠' },
    { name: 'Asparagus', emoji: '🥬' },
    { name: 'Artichoke', emoji: '🥬' },
    { name: 'Ladyfinger', emoji: '🥒' },
    
    // Fruits
    { name: 'Apple', emoji: '🍎' },
    { name: 'Banana', emoji: '🍌' },
    { name: 'Orange', emoji: '🍊' },
    { name: 'Lemon', emoji: '🍋' },
    { name: 'Lime', emoji: '🍋' },
    { name: 'Mango', emoji: '�' },
    { name: 'Pineapple', emoji: '🍍' },
    { name: 'Grapes', emoji: '🍇' },
    { name: 'Strawberry', emoji: '🍓' },
    { name: 'Blueberry', emoji: '🫐' },
    { name: 'Raspberry', emoji: '🍓' },
    { name: 'Blackberry', emoji: '🍓' },
    { name: 'Cherry', emoji: '🍒' },
    { name: 'Peach', emoji: '🍑' },
    { name: 'Pear', emoji: '🍐' },
    { name: 'Plum', emoji: '🍇' },
    { name: 'Kiwi', emoji: '🥝' },
    { name: 'Papaya', emoji: '🥭' },
    { name: 'Watermelon', emoji: '🍉' },
    { name: 'Cantaloupe', emoji: '🍈' },
    { name: 'Avocado', emoji: '🥑' },
    { name: 'Coconut', emoji: '🥥' },
    
    // Proteins
    { name: 'Chicken', emoji: '🍗' },
    { name: 'Beef', emoji: '🥩' },
    { name: 'Pork', emoji: '🥩' },
    { name: 'Lamb', emoji: '🥩' },
    { name: 'Fish', emoji: '🐟' },
    { name: 'Salmon', emoji: '🐟' },
    { name: 'Tuna', emoji: '🐟' },
    { name: 'Shrimp', emoji: '🍤' },
    { name: 'Crab', emoji: '🦀' },
    { name: 'Lobster', emoji: '🦞' },
    { name: 'Eggs', emoji: '🥚' },
    { name: 'Tofu', emoji: '🧄' },
    { name: 'Paneer', emoji: '🧀' },
    { name: 'Cottage cheese', emoji: '🧀' },
    
    // Dairy
    { name: 'Milk', emoji: '🥛' },
    { name: 'Cheese', emoji: '🧀' },
    { name: 'Butter', emoji: '🧈' },
    { name: 'Cream', emoji: '🥛' },
    { name: 'Yogurt', emoji: '🥛' },
    { name: 'Sour cream', emoji: '🥛' },
    { name: 'Mozzarella', emoji: '🧀' },
    { name: 'Cheddar', emoji: '�' },
    { name: 'Parmesan', emoji: '🧀' },
    { name: 'Feta', emoji: '🧀' },
    { name: 'Ricotta', emoji: '🧀' },
    { name: 'Cream cheese', emoji: '�' },
    
    // Spices & Herbs
    { name: 'Salt', emoji: '🧂' },
    { name: 'Pepper', emoji: '🌶️' },
    { name: 'Cumin', emoji: '🌶️' },
    { name: 'Coriander', emoji: '🌿' },
    { name: 'Turmeric', emoji: '🌶️' },
    { name: 'Paprika', emoji: '🌶️' },
    { name: 'Cinnamon', emoji: '🌶️' },
    { name: 'Cardamom', emoji: '🌶️' },
    { name: 'Cloves', emoji: '🌶️' },
    { name: 'Nutmeg', emoji: '🌶️' },
    { name: 'Bay leaves', emoji: '🌿' },
    { name: 'Thyme', emoji: '🌿' },
    { name: 'Rosemary', emoji: '🌿' },
    { name: 'Basil', emoji: '🌿' },
    { name: 'Oregano', emoji: '🌿' },
    { name: 'Parsley', emoji: '🌿' },
    { name: 'Cilantro', emoji: '🌿' },
    { name: 'Mint', emoji: '🌿' },
    { name: 'Dill', emoji: '🌿' },
    { name: 'Sage', emoji: '🌿' },
    { name: 'Garam masala', emoji: '🌶️' },
    { name: 'Curry powder', emoji: '🌶️' },
    
    // Oils & Fats
    { name: 'Olive oil', emoji: '🫒' },
    { name: 'Vegetable oil', emoji: '🫒' },
    { name: 'Coconut oil', emoji: '�' },
    { name: 'Ghee', emoji: '🧈' },
    { name: 'Sesame oil', emoji: '🫒' },
    
    // Nuts & Seeds
    { name: 'Almonds', emoji: '🥜' },
    { name: 'Walnuts', emoji: '🥜' },
    { name: 'Cashews', emoji: '🥜' },
    { name: 'Pistachios', emoji: '🥜' },
    { name: 'Peanuts', emoji: '🥜' },
    { name: 'Sesame seeds', emoji: '🌰' },
    { name: 'Sunflower seeds', emoji: '🌻' },
    { name: 'Pumpkin seeds', emoji: '🎃' },
    { name: 'Chia seeds', emoji: '🌰' },
    { name: 'Flax seeds', emoji: '🌰' },
    
    // Others
    { name: 'Honey', emoji: '🍯' },
    { name: 'Sugar', emoji: '🍯' },
    { name: 'Brown sugar', emoji: '🍯' },
    { name: 'Maple syrup', emoji: '🍯' },
    { name: 'Vanilla', emoji: '🌟' },
    { name: 'Chocolate', emoji: '🍫' },
    { name: 'Cocoa', emoji: '🍫' },
    { name: 'Vinegar', emoji: '🍶' },
    { name: 'Soy sauce', emoji: '🍶' },
    { name: 'Tomato sauce', emoji: '🍅' },
    { name: 'Coconut milk', emoji: '�' },
    { name: 'Stock', emoji: '🍲' },
    { name: 'Broth', emoji: '🍲' }
  ]);

  // Load custom ingredients on component mount
  useEffect(() => {
    loadCustomIngredients();
  }, []);

  const loadCustomIngredients = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const response = await fetch(`/api/ingredients/custom?userId=${user.id}`);
      const result = await response.json();
      
      if (result.success && result.ingredients) {
        // Add custom ingredients to the appropriate lists
        result.ingredients.forEach((ingredient: any) => {
          if (ingredient.category === 'base' || ingredient.category === 'grain') {
            setBaseIngredients(prev => {
              const exists = prev.some(item => item.name.toLowerCase() === ingredient.name.toLowerCase());
              if (!exists) {
                return [...prev, { name: ingredient.name, emoji: ingredient.emoji || '🥄' }];
              }
              return prev;
            });
          } else {
            setMainIngredients(prev => {
              const exists = prev.some(item => item.name.toLowerCase() === ingredient.name.toLowerCase());
              if (!exists) {
                return [...prev, { name: ingredient.name, emoji: ingredient.emoji || '🥄' }];
              }
              return prev;
            });
          }
        });
      }
    } catch (error) {
      console.error('Error loading custom ingredients:', error);
    }
  };

  const validateAndAddCustomIngredient = async (ingredient: string, category: 'base' | 'main') => {
    if (!ingredient.trim()) return;

    const isBase = category === 'base';
    const setValidating = isBase ? setIsValidatingBase : setIsValidatingMain;
    const setInput = isBase ? setCustomBaseInput : setCustomMainInput;
    const currentList = isBase ? baseIngredients : mainIngredients;
    const selectedList = isBase ? selectedBaseIngredients : selectedMainIngredients;
    
    // Clear any previous error
    setValidationError('');
    
    // First check if ingredient already exists in the list
    const existingIngredient = currentList.find(item => 
      item.name.toLowerCase() === ingredient.trim().toLowerCase()
    );

    if (existingIngredient) {
      // If ingredient exists, just select it and clear input
      if (!selectedList.includes(existingIngredient.name)) {
        if (isBase) {
          const updated = [...selectedBaseIngredients, existingIngredient.name];
          setSelectedBaseIngredients(updated);
          onIngredientsChange({ base: updated, main: selectedMainIngredients });
        } else {
          const updated = [...selectedMainIngredients, existingIngredient.name];
          setSelectedMainIngredients(updated);
          onIngredientsChange({ base: selectedBaseIngredients, main: updated });
        }
      }
      setInput('');
      return;
    }

    // If not found, validate with API and add
    setValidating(true);

    try {
      const validateResponse = await fetch('/api/validate-ingredient', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ingredient: ingredient.trim() })
      });

      const validateResult = await validateResponse.json();
      
      if (!validateResult.success) {
        setValidationError('Failed to validate ingredient. Please try again.');
        setValidating(false);
        return;
      }

      const validation = validateResult.validation;
      
      if (!validation.valid) {
        setValidationError(`"${ingredient}" is not a valid cooking ingredient.`);
        setInput('');
        setValidating(false);
        // Clear error after 3 seconds
        setTimeout(() => setValidationError(''), 3000);
        return;
      }

      // Save to database if user is logged in
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await fetch('/api/ingredients/custom', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            userId: user.id, 
            name: validation.name, 
            category: validation.category 
          })
        });
      }

      // Add to the appropriate list
      const newIngredient = { 
        name: validation.name, 
        emoji: validation.emoji || '🥄' 
      };

      if (isBase) {
        setBaseIngredients(prev => [...prev, newIngredient]);
        // Automatically select the new ingredient
        const updated = [...selectedBaseIngredients, validation.name];
        setSelectedBaseIngredients(updated);
        onIngredientsChange({ base: updated, main: selectedMainIngredients });
      } else {
        setMainIngredients(prev => [...prev, newIngredient]);
        // Automatically select the new ingredient
        const updated = [...selectedMainIngredients, validation.name];
        setSelectedMainIngredients(updated);
        onIngredientsChange({ base: selectedBaseIngredients, main: updated });
      }

      setInput('');

    } catch (error) {
      console.error('Error validating ingredient:', error);
      setValidationError('Network error. Please check your connection and try again.');
      // Clear error after 3 seconds
      setTimeout(() => setValidationError(''), 3000);
    } finally {
      setValidating(false);
    }
  };

  // Function to get sorted ingredients (selected ones first)
  const getSortedIngredients = (ingredients: any[], selectedIngredients: string[]) => {
    const selected = ingredients.filter(ingredient => 
      selectedIngredients.includes(ingredient.name)
    );
    const unselected = ingredients.filter(ingredient => 
      !selectedIngredients.includes(ingredient.name)
    );
    return [...selected, ...unselected];
  };

  // Function to filter ingredients based on search term
  const getFilteredIngredients = (ingredients: any[], selectedIngredients: string[], searchTerm: string) => {
    if (!searchTerm.trim()) {
      return getSortedIngredients(ingredients, selectedIngredients);
    }
    
    const filtered = ingredients.filter(ingredient =>
      ingredient.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    return getSortedIngredients(filtered, selectedIngredients);
  };

  // Handle search input changes
  const handleBaseSearch = (value: string) => {
    setBaseSearchTerm(value);
    setCustomBaseInput(value);
  };

  const handleMainSearch = (value: string) => {
    setMainSearchTerm(value);
    setCustomMainInput(value);
  };

  // Check if search term matches any existing ingredient exactly
  const findExactMatch = (ingredients: any[], searchTerm: string) => {
    return ingredients.find(ingredient => 
      ingredient.name.toLowerCase() === searchTerm.toLowerCase()
    );
  };

  const toggleBaseIngredient = (ingredient: string) => {
    const updated = selectedBaseIngredients.includes(ingredient)
      ? selectedBaseIngredients.filter(item => item !== ingredient)
      : [...selectedBaseIngredients, ingredient];
    
    setSelectedBaseIngredients(updated);
    onIngredientsChange({ base: updated, main: selectedMainIngredients });
  };

  const toggleMainIngredient = (ingredient: string) => {
    const updated = selectedMainIngredients.includes(ingredient)
      ? selectedMainIngredients.filter(item => item !== ingredient)
      : [...selectedMainIngredients, ingredient];
    
    setSelectedMainIngredients(updated);
    onIngredientsChange({ base: selectedBaseIngredients, main: updated });
  };

  return (
    <>
      {/* Validation Error Message */}
      {validationError && (
        <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-lg text-red-700 text-center font-medium">
          ❌ {validationError}
        </div>
      )}

      {/* Base Ingredients - mobile optimized */}
      <div className="bg-white bg-opacity-40 p-2 sm:p-4 lg:p-8 rounded-xl sm:rounded-2xl shadow-sm border-2 sm:border-4 border-pink-300" style={{ boxShadow: 'inset 0 0 0 2px rgba(236, 72, 153, 0.3), 0 0 0 4px rgba(236, 72, 153, 0.5)' }}>
        <h3 className="text-sm sm:text-lg font-bold text-gray-900 mb-2 sm:mb-4 bg-pink-100 bg-opacity-50 p-1 sm:p-2 rounded text-center" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
          Base Ingredients
        </h3>
        
        {/* Search Input - compact */}
        <div className="flex gap-1 sm:gap-2 mb-2 sm:mb-4">
          <input
            type="text"
            value={baseSearchTerm}
            onChange={(e) => handleBaseSearch(e.target.value)}
            placeholder="Search..."
            className="flex-1 px-2 sm:px-3 py-1 sm:py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent text-gray-800 placeholder-gray-500 text-xs sm:text-sm"
            style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
            onKeyPress={(e) => e.key === 'Enter' && validateAndAddCustomIngredient(customBaseInput, 'base')}
            disabled={isValidatingBase}
          />
          <button
            onClick={() => validateAndAddCustomIngredient(customBaseInput, 'base')}
            disabled={isValidatingBase || !customBaseInput.trim()}
            className="px-2 sm:px-3 py-1 sm:py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 disabled:bg-gray-300 disabled:cursor-not-allowed font-bold transition-colors flex items-center justify-center text-xs sm:text-sm w-8 sm:w-16"
            style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
          >
            {isValidatingBase ? '...' : findExactMatch(baseIngredients, baseSearchTerm) ? '✓' : '+'}
          </button>
        </div>

        {/* Filtered Ingredients List - compact */}
        <div className="space-y-1 sm:space-y-2 max-h-32 sm:max-h-48 overflow-y-auto border border-gray-200 rounded p-1 sm:p-2">
          {getFilteredIngredients(baseIngredients, selectedBaseIngredients, baseSearchTerm).length === 0 && baseSearchTerm ? (
            <div className="text-center py-2 sm:py-4 text-gray-500">
              <div className="text-xs sm:text-sm">No ingredients found</div>
              <div className="text-xs mt-1 hidden sm:block">Press Enter or click "+" to add it</div>
            </div>
          ) : (
            getFilteredIngredients(baseIngredients, selectedBaseIngredients, baseSearchTerm).map((ingredient) => (
              <label key={ingredient.name} className={`flex items-center space-x-1 sm:space-x-3 p-1 sm:p-2 hover:bg-gray-50 cursor-pointer rounded transition-colors ${
                selectedBaseIngredients.includes(ingredient.name) ? 'bg-pink-50 border-l-2 sm:border-l-4 border-pink-400' : ''
              }`}>
                <input
                  type="checkbox"
                  checked={selectedBaseIngredients.includes(ingredient.name)}
                  onChange={() => toggleBaseIngredient(ingredient.name)}
                  className="w-3 h-3 sm:w-4 sm:h-4 text-pink-600 rounded focus:ring-pink-500"
                />
                <span className={`font-medium text-xs sm:text-sm ${
                  selectedBaseIngredients.includes(ingredient.name) ? 'text-pink-700 font-bold' : 'text-gray-900'
                }`} style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                  {ingredient.name.toLowerCase()}
                </span>
              </label>
            ))
          )}
        </div>
      </div>

      {/* Main Ingredients - mobile optimized */}
      <div className="bg-white bg-opacity-40 p-2 sm:p-4 lg:p-8 rounded-xl sm:rounded-2xl shadow-sm border-2 sm:border-4 border-pink-300" style={{ boxShadow: 'inset 0 0 0 2px rgba(236, 72, 153, 0.3), 0 0 0 4px rgba(236, 72, 153, 0.5)' }}>
        <h3 className="text-sm sm:text-lg font-bold text-gray-900 mb-2 sm:mb-4 bg-pink-100 bg-opacity-50 p-1 sm:p-2 rounded text-center" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
          Main Ingredients
        </h3>
        
        {/* Search Input - compact */}
        <div className="flex gap-1 sm:gap-2 mb-2 sm:mb-4">
          <input
            type="text"
            value={mainSearchTerm}
            onChange={(e) => handleMainSearch(e.target.value)}
            placeholder="Search..."
            className="flex-1 px-2 sm:px-3 py-1 sm:py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-800 placeholder-gray-500 text-xs sm:text-sm"
            style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
            onKeyPress={(e) => e.key === 'Enter' && validateAndAddCustomIngredient(customMainInput, 'main')}
            disabled={isValidatingMain}
          />
          <button
            onClick={() => validateAndAddCustomIngredient(customMainInput, 'main')}
            disabled={isValidatingMain || !customMainInput.trim()}
            className="px-2 sm:px-3 py-1 sm:py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed font-bold transition-colors flex items-center justify-center text-xs sm:text-sm w-8 sm:w-16"
            style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
          >
            {isValidatingMain ? '...' : findExactMatch(mainIngredients, mainSearchTerm) ? '✓' : '+'}
          </button>
        </div>

        {/* Filtered Ingredients List - compact */}
        <div className="space-y-1 sm:space-y-2 max-h-32 sm:max-h-48 overflow-y-auto border border-gray-200 rounded p-1 sm:p-2">
          {getFilteredIngredients(mainIngredients, selectedMainIngredients, mainSearchTerm).length === 0 && mainSearchTerm ? (
            <div className="text-center py-2 sm:py-4 text-gray-500">
              <div className="text-xs sm:text-sm">No ingredients found</div>
              <div className="text-xs mt-1 hidden sm:block">Press Enter or click "+" to add it</div>
            </div>
          ) : (
            getFilteredIngredients(mainIngredients, selectedMainIngredients, mainSearchTerm).map((ingredient) => (
              <label key={ingredient.name} className={`flex items-center space-x-1 sm:space-x-3 p-1 sm:p-2 hover:bg-gray-50 cursor-pointer rounded transition-colors ${
                selectedMainIngredients.includes(ingredient.name) ? 'bg-orange-50 border-l-2 sm:border-l-4 border-orange-400' : ''
              }`}>
                <input
                  type="checkbox"
                  checked={selectedMainIngredients.includes(ingredient.name)}
                  onChange={() => toggleMainIngredient(ingredient.name)}
                  className="w-3 h-3 sm:w-4 sm:h-4 text-orange-600 rounded focus:ring-orange-500"
                />
                <span className={`font-medium text-xs sm:text-sm ${
                  selectedMainIngredients.includes(ingredient.name) ? 'text-orange-700 font-bold' : 'text-gray-900'
                }`} style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                  {ingredient.name.toLowerCase()}
                </span>
              </label>
            ))
          )}
        </div>
      </div>
    </>
  );
}
