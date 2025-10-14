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

        <style jsx>{`
          .nyse-loading-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            background: linear-gradient(
              135deg,
              var(--nyse-color-background-alt) 0%,
              #e8eef5 100%
            );
          }

          .nyse-spinner {
            width: 60px;
            height: 60px;
            border: 4px solid var(--nyse-color-border);
            border-top: 4px solid var(--nyse-color-primary);
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-bottom: 1.5rem;
          }

          @keyframes spin {
            0% {
              transform: rotate(0deg);
            }
            100% {
              transform: rotate(360deg);
            }
          }

          .nyse-loading-text {
            font-family: var(--nyse-font-sans);
            color: var(--nyse-color-text);
            font-size: 1rem;
            font-weight: 600;
          }
        `}</style>
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

      <style jsx>{`
        .onboarding-page {
          min-height: 100vh;
          background: linear-gradient(
            180deg,
            var(--nyse-color-background-alt) 0%,
            #f0f4f8 100%
          );
          display: flex;
          flex-direction: column;
        }

        .onboarding-header {
          background: var(--nyse-color-background);
          border-bottom: 2px solid var(--nyse-color-border);
          padding: var(--nyse-spacing-lg) 5%;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }

        .header-container {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: var(--nyse-spacing-md);
        }

        .brand-logo {
          display: flex;
          align-items: center;
          gap: var(--nyse-spacing-sm);
        }

        .logo-icon {
          font-size: 2rem;
        }

        .brand-name {
          font-family: var(--nyse-font-serif);
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--nyse-color-primary);
          letter-spacing: 2px;
        }

        .header-subtitle {
          font-size: 1rem;
          color: var(--nyse-color-text);
          font-weight: 600;
        }

        .onboarding-main {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: var(--nyse-spacing-xl) 5%;
        }

        .onboarding-footer {
          background: var(--nyse-color-background);
          border-top: 1px solid var(--nyse-color-border);
          padding: var(--nyse-spacing-lg);
          text-align: center;
        }

        .onboarding-footer p {
          color: var(--nyse-color-text-light);
          font-size: 0.9rem;
          margin: 0;
          font-style: italic;
        }

        @media (max-width: 768px) {
          .header-container {
            flex-direction: column;
            align-items: flex-start;
          }

          .onboarding-main {
            padding: var(--nyse-spacing-lg) var(--nyse-spacing-md);
          }
        }
      `}</style>
    </>
  );
}
