'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      setError(error.message);
      return;
    }
    // Redirect to home or profile on success
    router.push('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#fffaf0' }}>
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 text-6xl opacity-20">🍳</div>
        <div className="absolute top-40 right-20 text-5xl opacity-20">🥗</div>
        <div className="absolute bottom-32 left-20 text-4xl opacity-20">🍝</div>
        <div className="absolute bottom-20 right-10 text-6xl opacity-20">🥘</div>
      </div>

      <div className="bg-white rounded-2xl shadow-xl border-4 border-[#f895a2] p-6 w-full max-w-4xl relative z-10">
        <div className="bg-white rounded-2xl border-4 border-pink-200 p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* Left Side - Welcome Section */}
            <div className="text-center lg:text-left">
              <h1 className="text-5xl font-bold text-[#f895a2] mb-4" style={{ fontFamily: 'Sacramento, cursive' }}>
                Welcome Back!
              </h1>
              <p className="text-gray-800 text-lg mb-16">Sign in to your recipe account and continue your culinary journey</p>
              <div className="hidden lg:block">
                <div className="relative group flex justify-center">
                  {/* Hover Message - Cloud thought bubble above */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-4 bg-white px-6 py-3 rounded-3xl text-sm font-medium opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap shadow-lg border-2 border-[#f895a2] text-[#f895a2]">
                    Ready to cook something amazing? ✨
                    {/* Cloud tail - small circles */}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2">
                      <div className="w-3 h-3 bg-white border-2 border-[#f895a2] rounded-full -mt-1"></div>
                      <div className="w-2 h-2 bg-white border-2 border-[#f895a2] rounded-full ml-2 -mt-2"></div>
                      <div className="w-1 h-1 bg-white border border-[#f895a2] rounded-full ml-3 -mt-1"></div>
                    </div>
                  </div>
                  <div className="text-8xl cursor-pointer transition-transform duration-300 group-hover:scale-110">
                    👨‍🍳
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Login Form */}
            <div>
              <form onSubmit={handleLogin} className="space-y-5">
                {/* Email Field */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-pink-200 rounded-full text-gray-900 placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#f895a2] focus:border-[#f895a2] bg-pink-50"
                    placeholder="Enter your email"
                    required
                  />
                </div>

                {/* Password Field */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-pink-200 rounded-full text-gray-900 placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#f895a2] focus:border-[#f895a2] bg-pink-50 pr-12"
                      placeholder="Enter your password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-700 hover:text-gray-900"
                    >
                      {showPassword ? '👁️' : '👁️‍🗨️'}
                    </button>
                  </div>
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 text-[#f895a2] focus:ring-[#f895a2] border-pink-200 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-800">Remember me</span>
                  </label>
                  <Link href="/forgot-password" className="text-sm text-[#f895a2] hover:text-[#f7849a] font-medium">
                    Forgot password?
                  </Link>
                </div>

                {/* Login Button */}
                {error && (
                  <div className="text-red-500 text-sm font-medium mb-2">{error}</div>
                )}
                <button
                  type="submit"
                  className="w-full bg-[#f895a2] text-white py-3 px-6 rounded-full font-medium text-lg hover:bg-[#f7849a] transition-colors shadow-lg"
                >
                  🍽️ Sign In
                </button>
              </form>

              {/* Social Login */}
              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-pink-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-800">Or continue with</span>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <button className="w-full inline-flex justify-center py-2 px-4 border-2 border-pink-200 rounded-full shadow-sm bg-white text-sm font-medium text-gray-800 hover:bg-pink-50">
                    <span className="mr-2">📧</span>
                    Google
                  </button>
                  <button className="w-full inline-flex justify-center py-2 px-4 border-2 border-pink-200 rounded-full shadow-sm bg-white text-sm font-medium text-gray-800 hover:bg-pink-50">
                    <span className="mr-2">📘</span>
                    Facebook
                  </button>
                </div>
              </div>

              {/* Sign Up Link */}
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-800">
                  Don&apos;t have an account?{' '}
                  <Link href="/signup" className="font-medium text-[#f895a2] hover:text-[#f7849a]">
                    Sign up here
                  </Link>
                </p>
              </div>

              {/* Back to Home */}
              <div className="mt-3 text-center">
                <Link href="/" className="text-sm text-gray-700 hover:text-gray-900 flex items-center justify-center">
                  <span className="mr-1">🏠</span>
                  Back to Home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
