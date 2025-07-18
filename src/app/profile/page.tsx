"use client";
import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';

// Place your mascot images in the public/mascots/ folder and reference as /mascots/filename.png
const presetAvatars = [
  '/mascots/boba.png',
  '/mascots/egg.png',
  '/mascots/mochi.png',
  '/mascots/strawberry.png',
];

const cuisines = ['Indian', 'Italian', 'Mexican', 'Thai', 'Chinese', 'American', 'French', 'Japanese'];
const dietTypes = ['Vegan', 'Vegetarian', 'Eggs', 'Non-Veg'];
const skillLevels = ['Beginner', 'Intermediate', 'Pro'];
const spiceLevels = ['Mild', 'Medium', 'Spicy'];

export default function ProfilePage() {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [avatar, setAvatar] = useState(presetAvatars[0]);
  const [burst, setBurst] = useState(false);
  const [dietType, setDietType] = useState('');
  const [avoidList, setAvoidList] = useState('');
  const [savedRecipes, setSavedRecipes] = useState<{ id: number; title: string; image: string }[]>([]); // Start empty
  const [cookingTime, setCookingTime] = useState('');
  const [skillLevel, setSkillLevel] = useState('');
  const [spiceLevel, setSpiceLevel] = useState('');
  const [favoriteCuisines, setFavoriteCuisines] = useState<string[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [splashIndex, setSplashIndex] = useState<number | null>(null);
  const splashTimeout = useRef<NodeJS.Timeout | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [showSavedPopup, setShowSavedPopup] = useState(false);

  useEffect(() => {
    // Fetch user info from Supabase
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        setEmail(data.user.email || '');
        const firstName = data.user.user_metadata?.first_name || data.user.email?.split('@')[0] || '';
        setDisplayName(`Chef ${firstName.charAt(0).toUpperCase() + firstName.slice(1)}`);
        // Fetch saved recipes for this user
        try {
          const res = await fetch(`/api/recipes/saved?userId=${data.user.id}`);
          const result = await res.json();
          if (result.success && Array.isArray(result.recipes)) {
            setSavedRecipes(result.recipes.map((r: any) => ({ id: r.id, title: r.title, image: r.image })));
          }
        } catch (err) {
          // Optionally handle error
        }
      }
    };
    getUser();
  }, []);

  // Placeholder handlers
  const handleAvatarChange = (src: string, idx: number) => {
    setBurst(true);
    setTimeout(() => {
      setAvatar(src);
      setBurst(false);
    }, 500); // Match burst animation duration
  };
  const handleCuisineToggle = (cuisine: string) => {
    setFavoriteCuisines((prev: string[]) =>
      prev.includes(cuisine) ? prev.filter((c) => c !== cuisine) : [...prev, cuisine]
    );
  };
  const handleDeleteRecipe = (id: number) => {
    setSavedRecipes((prev: any[]) => prev.filter((r) => r.id !== id));
  };
  const handleSaveProfile = async () => {
    setEditMode(false);
    setShowSavedPopup(true);
    setTimeout(() => setShowSavedPopup(false), 1200);
    // Here you would update user metadata in Supabase
  };
  const handleChangePassword = async () => {
    setPasswordError(''); setPasswordSuccess('');
    if (password !== passwordConfirm) {
      setPasswordError('Passwords do not match');
      return;
    }
    if (password.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      return;
    }
    const { error } = await supabase.auth.updateUser({ password });
    if (error) setPasswordError(error.message);
    else {
      setPasswordSuccess('Password changed!');
      setShowPasswordModal(false);
      setPassword(''); setPasswordConfirm('');
    }
  };
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };
  const handleDeleteAccount = async () => {
    setDeleteError('');
    try {
      const { error } = await supabase.auth.admin.deleteUser((await supabase.auth.getUser()).data.user.id);
      if (error) throw error;
      await supabase.auth.signOut();
      window.location.href = '/';
    } catch (err: any) {
      setDeleteError(err.message || 'Failed to delete account.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-orange-100 flex flex-col items-center py-10">
      {showSavedPopup && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50">
          <div className="relative flex items-center justify-center">
            <div className="animate-burst-pop bg-pink-400 text-white font-bold px-8 py-4 rounded-full shadow-lg text-xl flex items-center gap-2">
              <span role="img" aria-label="sparkle">✨</span> Saved!
            </div>
            {/* Drops */}
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 w-3 h-3 bg-pink-300 rounded-full animate-drop1"></span>
            <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-3 h-3 bg-pink-300 rounded-full animate-drop2"></span>
            <span className="absolute top-1/2 -left-3 -translate-y-1/2 w-3 h-3 bg-pink-300 rounded-full animate-drop3"></span>
            <span className="absolute top-1/2 -right-3 -translate-y-1/2 w-3 h-3 bg-pink-300 rounded-full animate-drop4"></span>
          </div>
        </div>
      )}
      <div className="w-full max-w-3xl bg-white rounded-3xl shadow-xl border-2 border-gray-200 p-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center" style={{ fontFamily: 'Dancing Script, cursive' }}>
          Profile Settings
        </h1>
        {/* 1. Basic Info */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-gray-700 mb-4 flex items-center gap-2">👤 Basic Info</h2>
          <div className="flex flex-col md:flex-row gap-8 items-center">
            <div className="flex flex-col items-center gap-2">
              <div className="relative w-24 h-24 mb-2 flex items-center justify-center">
                {/* Burst animation overlay */}
                {burst && (
                  <span className="absolute inset-0 z-20 rounded-full animate-burst bg-red-300 opacity-80 pointer-events-none"></span>
                )}
                <Image src={avatar} alt="Avatar" width={96} height={96} className="rounded-full border-2 border-gray-300 bg-gray-100 object-cover relative z-10 transition-all duration-200" />
              </div>
              <div className="flex gap-2 flex-wrap justify-center">
                {presetAvatars.map((src, idx) => (
                  <button key={src} onClick={() => handleAvatarChange(src, idx)} className={`relative rounded-full border-2 p-1 transition-all duration-200 ${avatar === src ? 'border-pink-400' : 'border-gray-200'}`}
                    style={{ outline: avatar === src ? '2px solid #f87171' : undefined }}>
                    <Image src={src} alt="Preset" width={40} height={40} className="relative z-10" />
                  </button>
                ))}
              </div>
              <span className="text-xs text-gray-500 mt-1">Choose a mascot or upload soon!</span>
            </div>
            <div className="flex-1 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1">Display Name</label>
                <input value={displayName} onChange={e => editMode && setDisplayName(e.target.value)} className="w-full px-4 py-2 border-2 border-gray-300 rounded-full bg-gray-100 focus:outline-none focus:ring-2 focus:ring-pink-200 text-gray-900" disabled={!editMode} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1">Email</label>
                <input value={email} className="w-full px-4 py-2 border-2 border-gray-300 rounded-full bg-gray-100 focus:outline-none focus:ring-2 focus:ring-pink-200 text-gray-900" disabled />
              </div>
            </div>
          </div>
        </section>
        {/* 2. Dietary Preferences */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-gray-700 mb-4 flex items-center gap-2">🥬 Dietary Preferences</h2>
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-800 mb-1">Diet Type</label>
              <select value={dietType} onChange={e => editMode && setDietType(e.target.value)} className="w-full px-4 py-2 border-2 border-gray-300 rounded-full bg-gray-100 focus:outline-none focus:ring-2 focus:ring-green-200 text-gray-900" disabled={!editMode}>
                <option value="">Select...</option>
                {dietTypes.map(type => <option key={type}>{type}</option>)}
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-800 mb-1">Avoid / Allergies</label>
              <input value={avoidList} onChange={e => editMode && setAvoidList(e.target.value)} placeholder="e.g. peanuts, dairy" className="w-full px-4 py-2 border-2 border-gray-300 rounded-full bg-gray-100 focus:outline-none focus:ring-2 focus:ring-green-200 text-gray-900" disabled={!editMode} />
            </div>
          </div>
        </section>
        {/* 3. Saved Recipes */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-gray-700 mb-4 flex items-center gap-2">💾 Saved Recipes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {savedRecipes.length === 0 ? (
              <div className="text-gray-400 italic col-span-2">No saved recipes yet.</div>
            ) : savedRecipes.map((recipe: any) => {
              // Fallback image logic
              let imgSrc = recipe.image;
              if (!imgSrc || typeof imgSrc !== 'string' || (!imgSrc.startsWith('/') && !imgSrc.startsWith('http'))) {
                imgSrc = '/default-recipe.png'; // Make sure you have this image in your public folder
              }
              return (
                <div key={recipe.id} className="flex items-center gap-4 bg-gray-50 border-2 border-gray-200 rounded-2xl p-4">
                  <Image src={imgSrc} alt={recipe.title} width={48} height={48} className="rounded-xl" />
                  <div className="flex-1">
                    <div className="font-bold text-gray-800">{recipe.title}</div>
                    <div className="flex gap-2 mt-1">
                      <button className="text-pink-500 hover:underline" onClick={() => alert('Share coming soon!')}>Share</button>
                      <button className="text-red-500 hover:underline" onClick={() => handleDeleteRecipe(recipe.id)}>Delete</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
        {/* 4. Cooking Preferences */}
        <section className="mb-10">
          <div className="bg-gray-50 rounded-2xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-2xl font-bold text-purple-700 mb-6 flex items-center gap-2">
              <span role="img" aria-label="Cooking">🍽️</span> Cooking Preferences
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">Preferred Cooking Time (mins)</label>
                <input type="number" min={5} max={180} value={cookingTime} onChange={e => setCookingTime(e.target.value)} className="w-full px-4 py-3 border-2 border-gray-300 rounded-full bg-white focus:outline-none focus:ring-2 focus:ring-purple-200 text-gray-900 text-base" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">Skill Level</label>
                <select value={skillLevel} onChange={e => setSkillLevel(e.target.value)} className="w-full px-4 py-3 border-2 border-gray-300 rounded-full bg-white focus:outline-none focus:ring-2 focus:ring-purple-200 text-gray-900 text-base">
                  <option value="">Select...</option>
                  {skillLevels.map(level => <option key={level}>{level}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">Spice Level</label>
                <select value={spiceLevel} onChange={e => setSpiceLevel(e.target.value)} className="w-full px-4 py-3 border-2 border-gray-300 rounded-full bg-white focus:outline-none focus:ring-2 focus:ring-purple-200 text-gray-900 text-base">
                  <option value="">Select...</option>
                  {spiceLevels.map(level => <option key={level}>{level}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">Favorite Cuisines</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {cuisines.map(cuisine => (
                    <button key={cuisine} type="button" onClick={() => handleCuisineToggle(cuisine)} className={`px-4 py-1 rounded-full border-2 text-sm font-medium transition-all duration-150 shadow-sm ${favoriteCuisines.includes(cuisine) ? 'bg-pink-100 border-pink-400 text-pink-700' : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-100'}`}>{cuisine}</button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* 5. Account Actions */}
        <section>
          <div className="bg-gray-50 rounded-2xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-700 mb-6 flex items-center gap-2">
              <span role="img" aria-label="Lock">🔐</span> Account Actions
            </h2>
            <div className="flex flex-wrap gap-4 justify-center">
              {!editMode ? (
                <button className="flex items-center gap-2 bg-pink-500 text-white px-6 py-3 rounded-full font-bold shadow hover:bg-pink-600 text-base transition-all duration-150" onClick={() => setEditMode(true)}>
                  <span role="img" aria-label="Edit">✏️</span> Edit Profile
                </button>
              ) : (
                <button className="flex items-center gap-2 bg-green-500 text-white px-6 py-3 rounded-full font-bold shadow hover:bg-green-600 text-base transition-all duration-150" onClick={handleSaveProfile}>
                  <span role="img" aria-label="Save">💾</span> Save
                </button>
              )}
              <button className="flex items-center gap-2 bg-yellow-400 text-white px-6 py-3 rounded-full font-bold shadow hover:bg-yellow-500 text-base transition-all duration-150" onClick={() => setShowPasswordModal(true)}>
                <span role="img" aria-label="Key">🔑</span> Change Password
              </button>
              <button className="flex items-center gap-2 bg-purple-400 text-white px-6 py-3 rounded-full font-bold shadow hover:bg-purple-500 text-base transition-all duration-150" onClick={handleSignOut}>
                <span role="img" aria-label="Sign Out">🔓</span> Sign Out
              </button>
            </div>
            <div className="flex flex-wrap gap-4 justify-center mt-6">
              <button className="flex items-center gap-2 bg-gray-200 text-gray-800 px-6 py-3 rounded-full font-bold shadow hover:bg-gray-300 text-base transition-all duration-150" onClick={() => window.location.href = '/'}>
                <span role="img" aria-label="Home">🏠</span> Back to Home
              </button>
              <button className="flex items-center gap-2 bg-red-500 text-white px-6 py-3 rounded-full font-bold shadow hover:bg-red-600 text-base transition-all duration-150" onClick={() => setShowDeleteConfirm(true)}>
                <span role="img" aria-label="Delete">🧼</span> Delete Account
              </button>
            </div>
            {/* Change Password Modal */}
            {showPasswordModal && (
              <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                <div className="bg-white rounded-2xl p-8 shadow-xl border-2 border-yellow-400 text-center max-w-xs w-full">
                  <h3 className="text-xl font-bold text-yellow-600 mb-4">Change Password</h3>
                  <input type="password" placeholder="New password" value={password} onChange={e => setPassword(e.target.value)} className="w-full mb-3 px-4 py-2 border-2 border-gray-300 rounded-full bg-gray-100 focus:outline-none focus:ring-2 focus:ring-yellow-200 text-gray-900" />
                  <input type="password" placeholder="Confirm password" value={passwordConfirm} onChange={e => setPasswordConfirm(e.target.value)} className="w-full mb-3 px-4 py-2 border-2 border-gray-300 rounded-full bg-gray-100 focus:outline-none focus:ring-2 focus:ring-yellow-200 text-gray-900" />
                  {passwordError && <div className="text-red-500 text-sm mb-2">{passwordError}</div>}
                  {passwordSuccess && <div className="text-green-600 text-sm mb-2">{passwordSuccess}</div>}
                  <div className="flex gap-2 justify-center mt-2">
                    <button className="bg-gray-200 px-4 py-2 rounded-full font-bold" onClick={() => setShowPasswordModal(false)}>Cancel</button>
                    <button className="bg-yellow-400 text-white px-4 py-2 rounded-full font-bold" onClick={handleChangePassword}>Change</button>
                  </div>
                </div>
              </div>
            )}
            {/* Delete Account Modal */}
            {showDeleteConfirm && (
              <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                <div className="bg-white rounded-2xl p-8 shadow-xl border-2 border-red-400 text-center max-w-xs w-full">
                  <h3 className="text-xl font-bold text-red-600 mb-4">Are you sure you want to delete your account?</h3>
                  <p className="mb-6 text-gray-700">This action cannot be undone.</p>
                  {deleteError && <div className="text-red-500 text-sm mb-2">{deleteError}</div>}
                  <div className="flex gap-2 justify-center mt-2">
                    <button className="bg-gray-200 px-4 py-2 rounded-full font-bold" onClick={() => setShowDeleteConfirm(false)}>Cancel</button>
                    <button className="bg-red-500 text-white px-4 py-2 rounded-full font-bold" onClick={handleDeleteAccount}>Delete</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
      <style jsx global>{`
        @keyframes burst {
          0% { transform: scale(0.7); opacity: 0.7; }
          60% { transform: scale(1.5); opacity: 0.9; }
          100% { transform: scale(1.1); opacity: 0; }
        }
        .animate-burst {
          animation: burst 0.5s cubic-bezier(0.4,0,0.2,1);
        }
        @keyframes burst-pop {
          0% { transform: scale(0.7); opacity: 0.7; }
          60% { transform: scale(1.2); opacity: 1; }
          100% { transform: scale(1); opacity: 0; }
        }
        .animate-burst-pop {
          animation: burst-pop 1.2s cubic-bezier(0.4,0,0.2,1);
        }
        @keyframes drop1 {
          0% { opacity: 0; transform: translateY(0) scale(0.5); }
          40% { opacity: 1; transform: translateY(-18px) scale(1.2); }
          100% { opacity: 0; transform: translateY(-30px) scale(0.7); }
        }
        .animate-drop1 { animation: drop1 1.2s; }
        @keyframes drop2 {
          0% { opacity: 0; transform: translateY(0) scale(0.5); }
          40% { opacity: 1; transform: translateY(18px) scale(1.2); }
          100% { opacity: 0; transform: translateY(30px) scale(0.7); }
        }
        .animate-drop2 { animation: drop2 1.2s; }
        @keyframes drop3 {
          0% { opacity: 0; transform: translateX(0) scale(0.5); }
          40% { opacity: 1; transform: translateX(-18px) scale(1.2); }
          100% { opacity: 0; transform: translateX(-30px) scale(0.7); }
        }
        .animate-drop3 { animation: drop3 1.2s; }
        @keyframes drop4 {
          0% { opacity: 0; transform: translateX(0) scale(0.5); }
          40% { opacity: 1; transform: translateX(18px) scale(1.2); }
          100% { opacity: 0; transform: translateX(30px) scale(0.7); }
        }
        .animate-drop4 { animation: drop4 1.2s; }
      `}</style>
    </div>
  );
}
