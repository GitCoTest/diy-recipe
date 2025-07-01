'use client';

import { useState } from 'react';

interface CustomizeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerateRecipe: (customizations: FilterState) => void;
}

interface FilterState {
  cuisine: string;
  time: string;
  skillLevel: string;
  mood: string;
  leftover: string;
}

const CustomizeModal: React.FC<CustomizeModalProps> = ({ isOpen, onClose, onGenerateRecipe }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [filters, setFilters] = useState<FilterState>({
    cuisine: '',
    time: '',
    skillLevel: '',
    mood: '',
    leftover: ''
  });

  const steps = [
    {
      title: "What's your cuisine vibe? 🌍",
      key: 'cuisine' as keyof FilterState,
      options: [
        { value: 'indian', label: 'Indian', emoji: '🍛' },
        { value: 'mexican', label: 'Mexican', emoji: '🌮' },
        { value: 'italian', label: 'Italian', emoji: '🍝' },
        { value: 'thai', label: 'Thai', emoji: '🍜' },
        { value: 'chinese', label: 'Chinese', emoji: '🥟' },
        { value: 'american', label: 'American', emoji: '🍔' }
      ]
    },
    {
      title: "How much time do you have? ⏰",
      key: 'time' as keyof FilterState,
      options: [
        { value: 'quick', label: 'Under 15 mins', emoji: '⚡' },
        { value: 'medium', label: '30 mins', emoji: '⏱️' },
        { value: 'slow', label: 'Slow-cook', emoji: '🐌' },
        { value: 'any', label: 'Whatever it takes!', emoji: '🕐' }
      ]
    },
    {
      title: "What's your cooking skill level? 👨‍🍳",
      key: 'skillLevel' as keyof FilterState,
      options: [
        { value: 'beginner', label: 'Beginner', emoji: '🌱' },
        { value: 'intermediate', label: 'Intermediate', emoji: '🔥' },
        { value: 'advanced', label: 'Advanced', emoji: '👑' }
      ]
    },
    {
      title: "What's the mood? 🎭",
      key: 'mood' as keyof FilterState,
      options: [
        { value: 'comfort', label: 'Comfort food', emoji: '🤗' },
        { value: 'party', label: 'Party food', emoji: '🎉' },
        { value: 'kidfriendly', label: 'Kid-friendly', emoji: '👶' },
        { value: 'spicy', label: 'Spicy cravings', emoji: '🌶️' },
        { value: 'lunchbox', label: 'Quick lunchbox', emoji: '🍱' }
      ]
    }
  ];

  const handleOptionSelect = (value: string) => {
    const currentStepData = steps[currentStep];
    setFilters(prev => ({
      ...prev,
      [currentStepData.key]: value
    }));
    
    if (currentStep < steps.length - 1) {
      setTimeout(() => setCurrentStep(prev => prev + 1), 300);
    } else {
      setTimeout(() => setCurrentStep(steps.length), 300);
    }
  };

  const handleSkipStep = () => {
    if (currentStep < steps.length - 1) {
      setTimeout(() => setCurrentStep(prev => prev + 1), 150);
    } else {
      setTimeout(() => setCurrentStep(steps.length), 150);
    }
  };

  const handleReset = () => {
    setCurrentStep(0);
    setFilters({
      cuisine: '',
      time: '',
      skillLevel: '',
      mood: '',
      leftover: ''
    });
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handleGenerateRecipe = () => {
    console.log('🎯 Generating customized recipe with filters:', filters);
    onGenerateRecipe(filters);
    handleClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#f895a2] to-[#ff9eb5] p-6 text-white relative">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center hover:bg-opacity-30 transition-colors"
          >
            ✕
          </button>
          <h2 className="text-2xl font-bold text-center">Further Customize ✨</h2>
          {currentStep < steps.length && (
            <div className="mt-4">
              <div className="bg-white bg-opacity-20 rounded-full h-2">
                <div 
                  className="bg-white rounded-full h-2 transition-all duration-500"
                  style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                />
              </div>
              <p className="text-center mt-2 text-sm opacity-90">
                Step {currentStep + 1} of {steps.length}
              </p>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          {currentStep < steps.length ? (
            // Current Step
            <div className="text-center">
              <h3 className="text-2xl font-bold mb-8 text-gray-800">
                {steps[currentStep].title}
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {steps[currentStep].options.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleOptionSelect(option.value)}
                    className="p-4 bg-pink-50 border-2 border-[#f895a2] rounded-2xl hover:bg-[#f895a2] hover:text-white transition-all duration-300 transform hover:scale-105 shadow-sm hover:shadow-md"
                  >
                    <div className="text-3xl mb-2">{option.emoji}</div>
                    <div className="font-medium text-sm">{option.label}</div>
                  </button>
                ))}
              </div>
              
              {/* Skip Button */}
              <div className="mt-6">
                <button
                  onClick={handleSkipStep}
                  className="w-full p-3 bg-gray-100 text-gray-800 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                >
                  ⏭️ Skip this step
                </button>
              </div>
            </div>
          ) : currentStep === steps.length ? (
            // Leftover Input Step
            <div className="text-center">
              <h3 className="text-2xl font-bold mb-4 text-gray-800">
                Any leftovers to use? 🍲
              </h3>
              <p className="text-gray-800 mb-6">Optional: Tell us what&apos;s in your fridge!</p>
              <input
                type="text"
                value={filters.leftover}
                onChange={(e) => setFilters(prev => ({ ...prev, leftover: e.target.value }))}
                placeholder="e.g., leftover rice, chicken, vegetables..."
                className="w-full p-4 border-2 border-[#f895a2] rounded-xl text-gray-900 placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#f895a2] mb-6"
              />
              <div className="flex gap-4">
                <button
                  onClick={() => {
                    setFilters(prev => ({ ...prev, leftover: '' }));
                    handleGenerateRecipe();
                  }}
                  className="flex-1 p-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Skip
                </button>
                <button
                  onClick={handleGenerateRecipe}
                  className="flex-1 p-3 bg-gradient-to-r from-[#f895a2] to-[#ff9eb5] text-white rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105 font-medium"
                >
                  🍳 Search Recipes
                </button>
              </div>
            </div>
          ) : (
            // Summary Step
            <div className="text-center">
              <h3 className="text-2xl font-bold mb-6 text-gray-800">
                Perfect! Here&apos;s your recipe profile 🎯
              </h3>
              <div className="bg-pink-50 rounded-2xl p-6 mb-6 text-left">
                <div className="space-y-3">
                  {filters.cuisine && (
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">🌍</span>
                      <span><strong>Cuisine:</strong> {steps[0].options.find(o => o.value === filters.cuisine)?.label}</span>
                    </div>
                  )}
                  {filters.time && (
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">⏰</span>
                      <span><strong>Time:</strong> {steps[1].options.find(o => o.value === filters.time)?.label}</span>
                    </div>
                  )}
                  {filters.skillLevel && (
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">👨‍🍳</span>
                      <span><strong>Skill:</strong> {steps[2].options.find(o => o.value === filters.skillLevel)?.label}</span>
                    </div>
                  )}
                  {filters.mood && (
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">🎭</span>
                      <span><strong>Mood:</strong> {steps[3].options.find(o => o.value === filters.mood)?.label}</span>
                    </div>
                  )}
                  {filters.leftover && (
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">🍲</span>
                      <span><strong>Leftovers:</strong> {filters.leftover}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={handleReset}
                  className="flex-1 p-4 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                >
                  Start Over
                </button>
                <button
                  onClick={handleGenerateRecipe}
                  className="flex-1 p-4 bg-gradient-to-r from-[#f895a2] to-[#ff9eb5] text-white rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105 font-medium"
                >
                  🍳 Generate Recipe!
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomizeModal;
