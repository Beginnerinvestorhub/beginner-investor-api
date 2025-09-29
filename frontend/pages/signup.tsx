// Using Next.js 13+ App Router structure for metadata, but component remains for pages/app folder compatibility
import Head from 'next/head'; 
import Link from 'next/link'; // Import Link for navigation
import AuthForm from '../components/AuthForm';

// Next.js 13+ App Router Metadata (Optional, depends on your project structure)
export const metadata = {
  title: 'Sign Up | Beginner Investor Hub',
  description: 'Create your account to start your personalized investment learning journey.'
}

export default function SignupPage() {
  return (
    <div className="flex flex-col min-h-screen">
      
      {/* If using Pages Router, keep the Head component */}
      <Head>
        <title>Sign Up | Beginner Investor Hub</title>
        <meta name="description" content="Create your account to start your personalized investment learning journey." />
      </Head>
      
      {/* Main content section, mirroring the Login Page's visual design */}
      <main className="flex flex-1 items-center justify-center px-6 py-12 bg-gradient-to-br from-blue-50 to-indigo-100">
        <section className="w-full max-w-md p-8 bg-white rounded-xl shadow-2xl flex flex-col items-center">
          
          {/* 1. Branding/Logo Placeholder */}
          <div className="mb-8">
            <Link href="/" className="flex items-center justify-center space-x-2">
              {/* Replace with your actual SVG logo */}
              <svg className="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span className="text-xl font-bold text-gray-900">Investor Hub</span>
            </Link>
          </div>
          
          <h1 className="mb-3 text-3xl font-extrabold text-center text-gray-900">
            Create Your Account
          </h1>
          <p className="mb-8 text-sm text-center text-gray-600">
            Start your personalized journey to financial confidence today.
          </p>
          
          {/* 2. Authentication Form in "signup" mode */}
          <AuthForm mode="signup" />

          {/* 3. Switch to Login Link */}
          <div className="mt-6 text-sm">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link 
                href="/login" // Link back to the login page
                className="font-semibold text-indigo-600 hover:text-indigo-700 hover:underline"
              >
                Log In
              </Link>
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
