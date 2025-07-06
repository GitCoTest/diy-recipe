'use client';

import { useState, useEffect } from 'react';

interface MascotProps {
  message?: string;
  isThinking?: boolean;
}

export default function Mascot({ message = "Hi there! I'm Chef Chickpea! 🌟 Tell me what you have in your kitchen and I'll help you create something delicious!", isThinking = false }: MascotProps) {
  const [currentMessage, setCurrentMessage] = useState(message);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    setCurrentMessage(message);
  }, [message]);

  useEffect(() => {
    const thinkingMessages = [
      "Hmm, let me think... 🤔",
      "Cooking up something special... 👨‍🍳",
      "Almost ready! 🍲",
      "Just a pinch of inspiration... ✨",
      "Mixing up your recipe... 🥄",
      "Adding a dash of creativity... 🧂",
      "Tasting for perfection... 😋",
      "Plating your dish... 🍽️",
    ];
    if (isThinking) {
      let index = 0;
      setCurrentMessage(thinkingMessages[index]);
      const interval = setInterval(() => {
        index = (index + 1) % thinkingMessages.length;
        setCurrentMessage(thinkingMessages[index]);
      }, 1500);
      return () => clearInterval(interval);
    }
  }, [isThinking]);

  return (
    <div className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-16 opacity-0'}`}>
      <div className="bg-white rounded-2xl shadow-lg border border-yellow-200 p-4 max-w-xs relative">
        {/* Speech bubble arrow */}
        <div className="absolute -bottom-2 right-6 w-4 h-4 bg-white border-r border-b border-yellow-200 transform rotate-45"></div>
        
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <div className={`w-12 h-12 bg-gradient-to-br from-yellow-300 to-orange-400 rounded-full flex items-center justify-center text-xl transform ${isThinking ? 'animate-bounce' : ''}`}>
              🫘
            </div>
          </div>
          <div className="flex-1">
            <div className="text-sm font-medium text-gray-800 mb-1">Chef Chickpea</div>
            <div className="text-sm text-gray-800">{currentMessage}</div>
          </div>
        </div>

        {/* Close button */}
        <button
          onClick={() => setIsVisible(false)}
          className="absolute top-2 right-2 w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-gray-800 hover:bg-gray-200 transition-colors"
        >
          ×
        </button>
      </div>

      {/* Show again button when hidden */}
      {!isVisible && (
        <button
          onClick={() => setIsVisible(true)}
          className="mt-2 w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center text-xl shadow-lg hover:bg-yellow-500 transition-colors animate-pulse"
        >
          🫘
        </button>
      )}
    </div>
  );
}
