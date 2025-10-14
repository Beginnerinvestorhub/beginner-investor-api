import Head from 'next/head';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../hooks/useAuth';
import { useOnboardingCompleted } from '../src/store/learningStore';
import OnboardingFlow from '../components/onboarding/OnboardingFlow';

export default function OnboardingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const onboardingCompleted = useOnboardingCompleted();
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Redirect logic
  useEffect(() => {
    if (!loading) {
      if (!user) {
        // Not authenticated, redirect to signup
        setIsRedirecting(true);
        router.replace('/signup');
      } else if (onboardingCompleted) {
        // Already completed onboarding, redirect to dashboard
        setIsRedirecting(true);
        router.replace('/dashboard');
      }
    }
  }, [user, loading, onboardingCompleted, router]);

  const handleOnboardingComplete = () => {
    setIsRedirecting(true);
    router.push('/dashboard');
  };

  // Show loading while checking auth state
  if (loading || isRedirecting) {
    return (
      <>
        <Head>
          <title>Loading Onboarding | Beginner Investor Hub</title>
          <meta name="robots" content="noindex, nofollow" />
        </Head>
        <div className="nyse-loading-container">
          <div className="nyse-spinner"></div>
          <p className="nyse-loading-text">
            {isRedirecting
              ? 'Redirecting...'
              : 'Preparing your onboarding experience...'}
          </p>
        </div>
      </>
    );
  }

  // Don't render if redirecting or invalid state
  if (!user || onboardingCompleted) {
    return null;
  }

  return (
    <>
      <Head>
        <title>
          Welcome - Set Up Your Learning Path | Beginner Investor Hub
        </title>
        <meta
          name="description"
          content="Personalize your investment learning journey with our AI-powered onboarding process."
        />
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <div className="onboarding-page">
        {/* Progress Header */}
        <header className="onboarding-header">
          <div className="header-container">
            <div className="brand-logo">
              <span className="logo-icon">📊</span>
              <span className="brand-name">Investor Hub</span>
            </div>
            <div className="header-subtitle">
              Welcome, {user?.displayName || 'Investor'}
            </div>
          </div>
        </header>

        {/* Onboarding Flow */}
        <main className="onboarding-main">
          <OnboardingFlow onComplete={handleOnboardingComplete} />
        </main>

        {/* Footer Note */}
        <footer className="onboarding-footer">
          <p>
            You can always update these preferences later in your account
            settings
          </p>
        </footer>
      </div>
    </>
  );
}
