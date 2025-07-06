'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function SignUpPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
    subscribeNewsletter: true
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Calculate password strength
    if (name === 'password') {
      const strength = calculatePasswordStrength(value);
      setPasswordStrength(strength);
    }
  };

  const calculatePasswordStrength = (password: string): number => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    if (/[^A-Za-z0-9]/.test(password)) strength += 25;
    return strength;
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength < 25) return 'bg-red-400';
    if (passwordStrength < 50) return 'bg-orange-400';
    if (passwordStrength < 75) return 'bg-yellow-400';
    return 'bg-green-400';
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength < 25) return 'Weak';
    if (passwordStrength < 50) return 'Fair';
    if (passwordStrength < 75) return 'Good';
    return 'Strong';
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match!');
      return;
    }
    
    if (!formData.agreeToTerms) {
      setError('Please agree to the terms and conditions');
      return;
    }

    if (passwordStrength < 50) {
      setError('Please choose a stronger password');
      return;
    }

    setIsLoading(true);

    try {
      // Sign up with Supabase
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
            full_name: `${formData.firstName} ${formData.lastName}`,
            subscribe_newsletter: formData.subscribeNewsletter
          }
        }
      });

      if (signUpError) {
        throw signUpError;
      }

      if (data.user) {
        // Show success message
        alert('Account created successfully! Please check your email to verify your account.');
        
        // Redirect to login page
        router.push('/login?message=Account created successfully. Please verify your email.');
      }

    } catch (error: unknown) {
      console.error('Sign up error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create account. Please try again.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-8 px-4" style={{ backgroundColor: '#fffaf0' }}>
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 text-5xl opacity-20">🧑‍🍳</div>
        <div className="absolute top-32 right-10 text-4xl opacity-20">🥄</div>
        <div className="absolute bottom-40 left-16 text-6xl opacity-20">🍰</div>
        <div className="absolute bottom-10 right-20 text-5xl opacity-20">🥙</div>
        <div className="absolute top-1/2 left-5 text-4xl opacity-20">🍅</div>
        <div className="absolute top-1/3 right-5 text-3xl opacity-20">🧄</div>
      </div>

      <div className="bg-white rounded-2xl shadow-xl border-4 border-[#f895a2] p-4 w-full max-w-4xl relative z-10">
        <div className="bg-white rounded-2xl border-4 border-pink-200 p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center min-h-[500px]">
            
            {/* Left Side - Welcome Section */}
            <div className="text-center lg:text-left order-2 lg:order-1 lg:flex lg:flex-col lg:justify-center lg:h-full">
              <div className="hidden lg:flex lg:flex-col lg:items-center lg:justify-center lg:h-full lg:space-y-6">
                <div className="text-center">
                  <h1 className="text-5xl font-bold text-[#f895a2] mb-3" style={{ fontFamily: 'Sacramento, cursive' }}>
                    Join Our Kitchen!
                  </h1>
                  <p className="text-gray-800 text-base mb-4">Create your recipe account and start your culinary adventure</p>
                </div>
                <div className="relative group mt-4">
                  <div className="text-7xl cursor-pointer transition-transform duration-300 group-hover:scale-110">
                    👩‍🍳
                  </div>
                  {/* Hover Message - Cloud thought bubble below */}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-4 bg-white px-6 py-3 rounded-3xl text-sm font-medium opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap shadow-lg border-2 border-[#f895a2] text-[#f895a2]">
                    Thousands of recipes await you! 🍳
                    {/* Cloud tail - small circles */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2">
                      <div className="w-1 h-1 bg-white border border-[#f895a2] rounded-full mb-1"></div>
                      <div className="w-2 h-2 bg-white border-2 border-[#f895a2] rounded-full ml-2 mb-2"></div>
                      <div className="w-3 h-3 bg-white border-2 border-[#f895a2] rounded-full mt-1"></div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Mobile version - keep original layout for mobile */}
              <div className="lg:hidden">
                <h1 className="text-4xl font-bold text-[#f895a2] mb-3" style={{ fontFamily: 'Sacramento, cursive' }}>
                  Join Our Kitchen!
                </h1>
                <p className="text-gray-800 text-base mb-6">Create your recipe account and start your culinary adventure</p>
              </div>
            </div>

            {/* Right Side - Sign Up Form */}
            <div className="order-1 lg:order-2">
              <form onSubmit={handleSignUp} className="space-y-4">
                {/* Error Message */}
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}
                
                {/* Name Fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                      First Name
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border-2 border-pink-200 rounded-full text-gray-900 placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#f895a2] focus:border-[#f895a2] bg-pink-50 text-sm"
                      placeholder="John"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border-2 border-pink-200 rounded-full text-gray-900 placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#f895a2] focus:border-[#f895a2] bg-pink-50 text-sm"
                      placeholder="Doe"
                      required
                    />
                  </div>
                </div>

                {/* Email Field */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border-2 border-pink-200 rounded-full text-gray-900 placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#f895a2] focus:border-[#f895a2] bg-pink-50 text-sm"
                    placeholder="john.doe@example.com"
                    required
                  />
                </div>

                {/* Password Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border-2 border-pink-200 rounded-full text-gray-900 placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#f895a2] focus:border-[#f895a2] bg-pink-50 pr-10 text-sm"
                        placeholder="Create password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-700 hover:text-gray-900 text-sm"
                      >
                        {showPassword ? '👁️' : '👁️‍🗨️'}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border-2 border-pink-200 rounded-full text-gray-900 placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#f895a2] focus:border-[#f895a2] bg-pink-50 pr-10 text-sm"
                        placeholder="Confirm password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-700 hover:text-gray-900 text-sm"
                      >
                        {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Password Strength Indicator - only show when password field is active */}
                {formData.password && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-gray-800">Password Strength</span>
                        <span className={`text-xs font-medium ${passwordStrength >= 75 ? 'text-green-600' : passwordStrength >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                          {getPasswordStrengthText()}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                          style={{ width: `${passwordStrength}%` }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                        <p className="text-xs text-red-600 mt-1">Passwords do not match</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Checkboxes */}
                <div className="space-y-2">
                  <label className="flex items-start text-sm">
                    <input
                      type="checkbox"
                      name="agreeToTerms"
                      checked={formData.agreeToTerms}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-[#f895a2] focus:ring-[#f895a2] border-pink-200 rounded mt-0.5 mr-2"
                      required
                    />
                    <span className="text-gray-800">
                      I agree to the{' '}
                      <Link href="/terms" className="text-[#f895a2] hover:text-[#f7849a] font-medium">
                        Terms of Service
                      </Link>
                      {' '}and{' '}
                      <Link href="/privacy" className="text-[#f895a2] hover:text-[#f7849a] font-medium">
                        Privacy Policy
                      </Link>
                    </span>
                  </label>

                  <label className="flex items-center text-sm">
                    <input
                      type="checkbox"
                      name="subscribeNewsletter"
                      checked={formData.subscribeNewsletter}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-[#f895a2] focus:ring-[#f895a2] border-pink-200 rounded mr-2"
                    />
                    <span className="text-gray-800">
                      Subscribe to our recipe newsletter (optional)
                    </span>
                  </label>
                </div>

                {/* Sign Up Button */}
                <button
                  type="submit"
                  className="w-full bg-[#f895a2] text-white py-3 px-6 rounded-full font-medium text-lg hover:bg-[#f7849a] transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!formData.agreeToTerms || formData.password !== formData.confirmPassword || isLoading}
                >
                  {isLoading ? (
                    <>
                      <span className="inline-block animate-spin mr-2">⏳</span>
                      Creating Account...
                    </>
                  ) : (
                    '🎉 Create Account'
                  )}
                </button>
              </form>

              {/* Social Sign Up */}
              <div className="mt-5">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-pink-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-800">Or sign up with</span>
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

              {/* Login Link */}
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-800">
                  Already have an account?{' '}
                  <Link href="/login" className="font-medium text-[#f895a2] hover:text-[#f7849a]">
                    Sign in here
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
