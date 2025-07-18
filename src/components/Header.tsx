import Link from 'next/link';

export default function Header() {
  return (
    <header className="w-full bg-gradient-to-r from-pink-100 via-purple-50 to-blue-100 py-6 px-4 rounded-2xl mb-8 shadow-sm">
      <div className="max-w-6xl mx-auto text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-purple-800 mb-2">
          🍳 Customize Your Meal
        </h1>
        <p className="text-purple-600 text-lg md:text-xl font-medium">
          Let&apos;s cook something amazing with what you have! ✨
        </p>
        <div className="mt-4 flex justify-center gap-4">
          <button 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              window.location.replace('/saved-recipes');
            }}
            className="bg-pink-200 hover:bg-pink-300 text-purple-800 font-bold py-2 px-6 rounded-full shadow transition-all duration-200 border-2 border-pink-300"
          >
            💾 Saved
          </button>
        </div>
      </div>
    </header>
  );
}
