'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
    }, 2000);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#fffaf0' }}>
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 text-6xl opacity-20">📧</div>
          <div className="absolute top-40 right-20 text-5xl opacity-20">✨</div>
          <div className="absolute bottom-32 left-20 text-4xl opacity-20">🔑</div>
          <div className="absolute bottom-20 right-10 text-6xl opacity-20">💌</div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border-4 border-[#f895a2] p-6 w-full max-w-3xl relative z-10">
          <div className="bg-white rounded-2xl border-4 border-pink-200 p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              
              {/* Left Side - Visual */}
              <div className="text-center lg:text-left">
                <div className="text-8xl mb-4">📬</div>
                <h1 className="text-4xl font-bold text-[#f895a2] mb-4" style={{ fontFamily: 'Sacramento, cursive' }}>
                  Check Your Email!
                </h1>
                <p className="text-gray-800 text-lg">
                  We&apos;ve sent a password reset link to <strong>{email}</strong>
                </p>
              </div>

              {/* Right Side - Actions */}
              <div>
                <p className="text-sm text-gray-800 mb-6">
                  Didn&apos;t receive the email? Check your spam folder or try again with a different email address.
                </p>
                
                <div className="space-y-3">
                  <button
                    onClick={() => setIsSubmitted(false)}
                    className="w-full bg-pink-50 text-[#f895a2] py-3 px-6 rounded-full font-medium border-2 border-[#f895a2] hover:bg-pink-100 transition-colors"
                  >
                    Try Another Email
                  </button>
                  
                  <Link 
                    href="/login"
                    className="block w-full bg-[#f895a2] text-white py-3 px-6 rounded-full font-medium hover:bg-[#f7849a] transition-colors text-center"
                  >
                    Back to Login
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#fffaf0' }}>
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 text-6xl opacity-20">🔐</div>
        <div className="absolute top-40 right-20 text-5xl opacity-20">🗝️</div>
        <div className="absolute bottom-32 left-20 text-4xl opacity-20">🔑</div>
        <div className="absolute bottom-20 right-10 text-6xl opacity-20">💭</div>
      </div>

      <div className="bg-white rounded-2xl shadow-xl border-4 border-[#f895a2] p-6 w-full max-w-3xl relative z-10">
        <div className="bg-white rounded-2xl border-4 border-pink-200 p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            
            {/* Left Side - Visual Section */}
            <div className="text-center lg:text-left">
              <div className="text-8xl mb-4">🤔</div>
              <h1 className="text-4xl font-bold text-[#f895a2] mb-4" style={{ fontFamily: 'Sacramento, cursive' }}>
                Forgot Password?
              </h1>
              <p className="text-gray-800 text-lg">No worries! We&apos;ll help you reset it quickly and easily.</p>
            </div>

            {/* Right Side - Form */}
            <div>
              <form onSubmit={handleSubmit} className="space-y-5">
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
                    placeholder="Enter your email address"
                    required
                  />
                  <p className="mt-2 text-xs text-gray-800">
                    Enter the email address associated with your account and we&apos;ll send you a link to reset your password.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#f895a2] text-white py-3 px-6 rounded-full font-medium text-lg hover:bg-[#f7849a] transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending...
                    </span>
                  ) : (
                    '📧 Send Reset Link'
                  )}
                </button>
              </form>

              {/* Additional Options */}
              <div className="mt-6 text-center space-y-3">
                <Link 
                  href="/login" 
                  className="text-sm text-[#f895a2] hover:text-[#f7849a] font-medium flex items-center justify-center"
                >
                  <span className="mr-1">←</span>
                  Back to Login
                </Link>
                
                <div className="text-sm text-gray-800">
                  Don&apos;t have an account?{' '}
                  <Link href="/signup" className="text-[#f895a2] hover:text-[#f7849a] font-medium">
                    Sign up now
                  </Link>
                </div>
                
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
