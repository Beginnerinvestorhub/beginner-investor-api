import Head from 'next/head';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../hooks/useAuth';
import { useOnboardingCompleted } from '../store/learningStore';
import OnboardingFlow from '../components/onboarding/OnboardingFlow';
import Layout from '../components/Layout';

export default function OnboardingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const onboardingCompleted = useOnboardingCompleted();

  // Redirect logic
  useEffect(() => {
    if (!loading) {
      if (!user) {
        // Not authenticated, redirect to signup
        router.push('/signup');
      } else if (onboardingCompleted) {
        // Already completed onboarding, redirect to dashboard
        router.push('/dashboard');
      }
    }
  }, [user, loading, onboardingCompleted, router]);

  const handleOnboardingComplete = () => {
    router.push('/dashboard');
  };

  // Show loading while checking auth state
  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </Layout>
    );
  }

  // Don't render if redirecting
  if (!user || onboardingCompleted) {
    return null;
  }

  return (
    <>
      <Head>
        <title>Welcome - Set Up Your Learning Path | Beginner Investor Hub</title>
        <meta name="description" content="Personalize your investment learning journey with our AI-powered onboarding process." />
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <OnboardingFlow onComplete={handleOnboardingComplete} />
    </>
  );
}
