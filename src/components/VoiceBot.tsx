'use client';

import { useState, useEffect, useRef } from 'react';

interface VoiceBotProps {
  onVoiceRequest: (request: string) => void;
  isProcessing: boolean;
}

export default function VoiceBot({ onVoiceRequest, isProcessing }: VoiceBotProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(false);
  const [botMessage, setBotMessage] = useState("Hi! I'm your cooking assistant. Tell me what you'd like to cook!");
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check if speech recognition is supported
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        setIsSupported(true);
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = 'en-US';

        recognitionRef.current.onstart = () => {
          setIsListening(true);
          setBotMessage("I'm listening... Tell me what you'd like to cook!");
        };

        recognitionRef.current.onresult = (event: any) => {
          const result = event.results[0][0].transcript;
          setTranscript(result);
          setIsListening(false);
          setBotMessage("Got it! Let me find some recipes for you...");
          onVoiceRequest(result);
        };

        recognitionRef.current.onerror = (event: any) => {
          setIsListening(false);
          setBotMessage("Sorry, I didn't catch that. Try again!");
          console.error('Speech recognition error:', event.error);
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
        };
      }
    }
  }, [onVoiceRequest]);

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setTranscript('');
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  };

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 0.8;
      speechSynthesis.speak(utterance);
    }
  };

  useEffect(() => {
    if (isProcessing) {
      setBotMessage("Cooking up something special for you... 👨‍🍳");
    }
  }, [isProcessing]);

  if (!isSupported) {
    return (
      <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl p-6 mb-6 text-center">
        <div className="text-4xl mb-3">🤖</div>
        <p className="text-gray-600">Voice feature not supported in your browser. Please use manual selection below.</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl p-6 mb-6 shadow-lg">
      {/* Bot Avatar and Message */}
      <div className="text-center mb-6">
        <div className="text-6xl mb-3 animate-bounce">
          {isListening ? '🎤' : isProcessing ? '👨‍🍳' : '🤖'}
        </div>
        <div className="bg-white rounded-lg p-4 shadow-md max-w-md mx-auto">
          <p className="text-gray-800 font-medium">{botMessage}</p>
          {transcript && (
            <div className="mt-2 p-2 bg-gray-50 rounded text-sm text-gray-600">
              You said: "{transcript}"
            </div>
          )}
        </div>
      </div>

      {/* Voice Controls */}
      <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
        <button
          onClick={isListening ? stopListening : startListening}
          disabled={isProcessing}
          className={`
            px-8 py-4 rounded-full font-bold text-lg shadow-lg transform transition-all duration-200
            ${isListening 
              ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse' 
              : isProcessing
              ? 'bg-gray-400 cursor-not-allowed text-white'
              : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white hover:scale-105'
            }
          `}
        >
          {isListening ? (
            <span className="flex items-center gap-2">
              <div className="w-3 h-3 bg-white rounded-full animate-ping"></div>
              Listening...
            </span>
          ) : isProcessing ? (
            <span className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Processing...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              🎤 Start Talking
            </span>
          )}
        </button>

        <button
          onClick={() => speak(botMessage)}
          className="px-6 py-3 rounded-full bg-white border-2 border-purple-300 text-purple-600 font-medium hover:bg-purple-50 transition-all duration-200"
        >
          🔊 Repeat
        </button>
      </div>

      {/* Example Phrases */}
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600 mb-2">Try saying something like:</p>
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
                setTranscript(example);
                onVoiceRequest(example);
              }}
              className="text-xs bg-white px-3 py-1 rounded-full text-purple-600 hover:bg-purple-50 transition-colors"
            >
              "{example}"
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// Type declarations for speech recognition
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}
