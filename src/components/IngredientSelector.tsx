'use client';

import { useState } from 'react';

interface IngredientSelectorProps {
  onIngredientsChange: (ingredients: { base: string[], main: string[] }) => void;
}

export default function IngredientSelector({ onIngredientsChange }: IngredientSelectorProps) {
  const [selectedBaseIngredients, setSelectedBaseIngredients] = useState<string[]>([]);
  const [selectedMainIngredients, setSelectedMainIngredients] = useState<string[]>([]);

  const baseIngredients = [
    { name: 'Flour', emoji: '🌾' },
    { name: 'Rice', emoji: '🍚' },
    { name: 'Pulses', emoji: '🫘' },
    { name: 'Pasta', emoji: '🍝' },
    { name: 'Bread', emoji: '🍞' },
    { name: 'Oats', emoji: '🥣' }
  ];

  const mainIngredients = [
    { name: 'Tomato', emoji: '🍅' },
    { name: 'Onion', emoji: '🧅' },
    { name: 'Eggs', emoji: '🥚' },
    { name: 'Chicken', emoji: '🍗' },
    { name: 'Milk', emoji: '🥛' },
    { name: 'Cheese', emoji: '🧀' },
    { name: 'Spinach', emoji: '🥬' },
    { name: 'Potato', emoji: '🥔' },
    { name: 'Carrot', emoji: '🥕' },
    { name: 'Bell Pepper', emoji: '🫑' }
  ];

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
      {/* Base Ingredients */}
      <div className="bg-white bg-opacity-40 p-8 rounded-2xl shadow-sm border-4 border-pink-300" style={{ boxShadow: 'inset 0 0 0 2px rgba(236, 72, 153, 0.3), 0 0 0 4px rgba(236, 72, 153, 0.5)' }}>
        <h3 className="text-lg font-bold text-gray-900 mb-4 bg-pink-100 bg-opacity-50 p-2 rounded">
          Base Ingredients
        </h3>
        <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-200 rounded p-2">
          {baseIngredients.map((ingredient) => (
            <label key={ingredient.name} className="flex items-center space-x-3 p-2 hover:bg-gray-50 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedBaseIngredients.includes(ingredient.name)}
                onChange={() => toggleBaseIngredient(ingredient.name)}
                className="w-4 h-4 text-pink-600 rounded focus:ring-pink-500"
              />
              <span className="text-gray-900 font-medium">{ingredient.name.toLowerCase()}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Main Ingredients */}
      <div className="bg-white bg-opacity-40 p-8 rounded-2xl shadow-sm border-4 border-pink-300" style={{ boxShadow: 'inset 0 0 0 2px rgba(236, 72, 153, 0.3), 0 0 0 4px rgba(236, 72, 153, 0.5)' }}>
        <h3 className="text-lg font-bold text-gray-900 mb-4 bg-pink-100 bg-opacity-50 p-2 rounded">
          Main Ingredients
        </h3>
        <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-200 rounded p-2">
          {mainIngredients.map((ingredient) => (
            <label key={ingredient.name} className="flex items-center space-x-3 p-2 hover:bg-gray-50 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedMainIngredients.includes(ingredient.name)}
                onChange={() => toggleMainIngredient(ingredient.name)}
                className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500"
              />
              <span className="text-gray-900 font-medium">{ingredient.name.toLowerCase()}</span>
            </label>
          ))}
        </div>
      </div>
    </>
  );
}
