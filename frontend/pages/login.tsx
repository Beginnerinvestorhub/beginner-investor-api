import React, { useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../hooks/useAuth';
import AuthForm from '../components/AuthForm';

// --- Extracted Components ---
import LoadingSpinner from '../components/common/LoadingSpinner'; 
import LoginBrandingPanel from '../components/auth/LoginBrandingPanel';

export default function LoginPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Redirect if already logged in
  useEffect(() => {
    if (!loading && user) {
      // Use router.push('/') if you want to allow back button
      // But router.replace('/dashboard') is correct for authentication flow
      router.replace('/dashboard'); 
    }
  }, [user, loading, router]);

  // Show loading spinner if user status is being checked or is already logged in
  if (loading || user) {
    return (
      <LoadingSpinner 
        title="Loading" 
        metaDescription="Checking authentication status..." 
      />
    );
  }

  return (
    <>
      <Head>
        <title>Sign In | Beginner Investor Hub</title>
        <meta
          name="description"
          content="Login to access your personalized investment dashboard and portfolio simulations."
        />
      </Head>

      <div className="min-h-screen flex items-center justify-center p-4 sm:p-8 bg-gray-50">
        <div className="grid grid-cols-1 lg:grid-cols-2 max-w-6xl w-full bg-white rounded-xl overflow-hidden shadow-2xl">
          
          {/* Left Panel - Branding (Extracted) */}
          <LoginBrandingPanel />

          {/* Right Panel - Login Form */}
          <div className="flex items-center justify-center p-8 sm:p-12">
            <div className="w-full max-w-md">
              <div className="mb-8">
                <h2 className="text-3xl font-serif font-bold text-gray-900 mb-2">
                  Sign In
                </h2>
                <p className="text-gray-500 text-sm">
                  Enter your credentials to access your account
                </p>
              </div>

              <AuthForm mode="login" />

              <div className="mt-6 text-center text-sm">
                <p className="text-gray-700">
                  New to Beginner Investor Hub?{' '}
                  <Link 
                    href="/signup" 
                    className="text-blue-600 font-semibold hover:text-blue-800 transition-colors"
                  >
                    Create an account
                  </Link>
                </p>
              </div>
              
              {/* Divider */}
              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-3 bg-white text-gray-500">
                    or
                  </span>
                </div>
              </div>

              <Link 
                href="/" 
                className="block text-center text-sm text-gray-500 hover:text-blue-600 transition-colors"
              >
                &larr; Back to home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// --- Required Extracted Components (for context) ---

// 1. components/common/LoadingSpinner.js
/*
import React from 'react';
import Head from 'next/head';

const LoadingSpinner = ({ title, metaDescription }) => (
  <>
    <Head>
      <title>{title || 'Loading'} | Beginner Investor Hub</title>
      <meta name="robots" content="noindex, nofollow" />
      <meta name="description" content={metaDescription || "Please wait while we load your content."} />
    </Head>
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mb-6"></div>
      <p className="text-gray-700 font-semibold">Loading...</p>
    </div>
  </>
);
export default LoadingSpinner;
*/

// 2. components/auth/LoginBrandingPanel.js
/*
import React from 'react';
import Link from 'next/link';

const features = [
  'Portfolio simulation engine',
  'AI behavioral coaching',
  'Real-time market data',
  'Risk analysis tools',
];

const LoginBrandingPanel = () => (
  <div className="hidden lg:flex flex-col justify-center p-12 bg-gradient-to-br from-blue-700 to-blue-900 text-white relative overflow-hidden">
    
    // Background Grid Overlay 
    <div className="absolute inset-0 opacity-10 pointer-events-none" 
         style={{ backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 30px, rgba(255, 255, 255, 0.03) 30px, rgba(255, 255, 255, 0.03) 31px), repeating-linear-gradient(0deg, transparent, transparent 30px, rgba(255, 255, 255, 0.03) 30px, rgba(255, 255, 255, 0.03) 31px)' }}
    ></div>

    <Link href="/" className="flex items-center gap-2 mb-16 relative z-10">
      <div className="text-4xl">📊</div>
      <span className="font-serif text-3xl font-bold tracking-wider text-white">
        Investor Hub
      </span>
    </Link>

    <h1 className="font-serif text-4xl font-bold mb-4 relative z-10">
      Welcome Back
    </h1>
    <p className="text-lg leading-relaxed mb-12 opacity-95 relative z-10">
      Continue your journey to financial mastery with precision tools
      and AI-powered insights.
    </p>

    <div className="flex flex-col gap-4 relative z-10">
      {features.map((feature) => (
        <div key={feature} className="flex items-center gap-3 text-lg">
          <span className="w-6 h-6 bg-white bg-opacity-20 rounded-full flex items-center justify-center font-bold flex-shrink-0">
            ✓
          </span>
          <span>{feature}</span>
        </div>
      ))}
    </div>
  </div>
);

export default LoginBrandingPanel;
*/