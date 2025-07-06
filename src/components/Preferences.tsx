'use client';

import { useState } from 'react';

interface PreferencesProps {
  onPreferencesChange: (preferences: { mealType: string, dietary: string }) => void;
}

export default function Preferences({ onPreferencesChange }: PreferencesProps) {
  const [selectedMealType, setSelectedMealType] = useState<string>('');
  const [selectedDietary, setSelectedDietary] = useState<string>('');

  const mealTypes = [
    { name: 'Breakfast', emoji: '🌅' },
    { name: 'Lunch', emoji: '☀️' },
    { name: 'Dinner', emoji: '🌙' },
    { name: 'Snacks', emoji: '🍿' },
    { name: 'Desserts', emoji: '🍰' }
  ];

  const dietaryOptions = [
    { name: 'Vegan', emoji: '🌱' },
    { name: 'Vegetarian', emoji: '🥗' },
    { name: 'Non-Vegetarian', emoji: '🍗' },
    { name: 'Keto', emoji: '🥑' },
    { name: 'Gluten Free', emoji: '🌾' }
  ];

  const selectMealType = (mealType: string) => {
    setSelectedMealType(mealType);
    onPreferencesChange({ mealType, dietary: selectedDietary });
  };

  const selectDietary = (dietary: string) => {
    setSelectedDietary(dietary);
    onPreferencesChange({ mealType: selectedMealType, dietary });
  };

  return (
    <>
      {/* Meal Type - mobile optimized */}
      <div className="bg-white bg-opacity-40 p-2 sm:p-4 lg:p-8 rounded-xl sm:rounded-2xl shadow-sm border-2 sm:border-4 border-pink-300" style={{ boxShadow: 'inset 0 0 0 2px rgba(236, 72, 153, 0.3), 0 0 0 4px rgba(236, 72, 153, 0.5)' }}>
        <h3 className="text-sm sm:text-lg font-bold text-gray-900 mb-2 sm:mb-4 bg-pink-100 bg-opacity-50 p-1 sm:p-2 rounded text-center">
          Meal Type
        </h3>
        <div className="space-y-1 sm:space-y-2 max-h-32 sm:max-h-60 overflow-y-auto border border-gray-200 rounded p-1 sm:p-2">
          {mealTypes.map((meal) => (
            <label key={meal.name} className="flex items-center space-x-1 sm:space-x-3 p-1 sm:p-2 hover:bg-gray-50 cursor-pointer">
              <input
                type="radio"
                name="mealType"
                checked={selectedMealType === meal.name}
                onChange={() => selectMealType(meal.name)}
                className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-gray-900 font-medium text-xs sm:text-sm">{meal.name.toLowerCase()}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Dietary Preferences - mobile optimized */}
      <div className="bg-white bg-opacity-40 p-2 sm:p-4 lg:p-8 rounded-xl sm:rounded-2xl shadow-sm border-2 sm:border-4 border-pink-300" style={{ boxShadow: 'inset 0 0 0 2px rgba(236, 72, 153, 0.3), 0 0 0 4px rgba(236, 72, 153, 0.5)' }}>
        <h3 className="text-sm sm:text-lg font-bold text-gray-900 mb-2 sm:mb-4 bg-pink-100 bg-opacity-50 p-1 sm:p-2 rounded text-center">
          Dietary Needs
        </h3>
        <div className="space-y-1 sm:space-y-2 max-h-32 sm:max-h-60 overflow-y-auto border border-gray-200 rounded p-1 sm:p-2">
          {dietaryOptions.map((diet) => (
            <label key={diet.name} className="flex items-center space-x-1 sm:space-x-3 p-1 sm:p-2 hover:bg-gray-50 cursor-pointer">
              <input
                type="radio"
                name="dietary"
                checked={selectedDietary === diet.name}
                onChange={() => selectDietary(diet.name)}
                className="w-3 h-3 sm:w-4 sm:h-4 text-green-600 focus:ring-green-500"
              />
              <span className="text-gray-900 font-medium text-xs sm:text-sm">{diet.name.toLowerCase()}</span>
            </label>
          ))}
        </div>
      </div>
    </>
  );
}
