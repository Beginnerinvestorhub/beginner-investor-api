import Head from 'next/head'; // Import Head if you are using Pages Router (though `metadata` suggests App Router)
import Link from 'next/link'; // Import Link for navigation
import AuthForm from '../components/AuthForm'

// Next.js 13+ App Router Metadata
export const metadata = {
  title: 'Login | Beginner Investor Hub',
  description: 'Login to access your personalized investment dashboard and tools.'
}

export default function LoginPage() {
  return (
    // Removed min-h-screen here as it's better handled by a Layout component, 
    // but kept it on the main section for robustness if no Layout is used.
    <div className="flex flex-col min-h-screen"> 
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
            Welcome Back
          </h1>
          <p className="mb-8 text-sm text-center text-gray-600">
            Log in to your account to access your personalized investment dashboard.
          </p>
          
          {/* 2. Authentication Form */}
          <AuthForm mode="login" />

          {/* 3. Switch to Signup Link */}
          <div className="mt-6 text-sm">
            <p className="text-gray-600">
              New to Beginner Investor Hub?{' '}
              <Link 
                href="/signup" // Assuming your signup page is at /signup
                className="font-semibold text-indigo-600 hover:text-indigo-700 hover:underline"
              >
                Create an account
              </Link>
            </p>
          </div>
        </section>
      </main>
    </div>
  )
}
