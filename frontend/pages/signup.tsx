import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import AuthForm from '../components/AuthForm';

export default function SignupPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Redirect if already logged in
  useEffect(() => {
    if (!loading && user) {
      router.replace('/onboarding');
    }
  }, [user, loading, router]);

  // Don't show signup form if already authenticated
  if (loading || user) {
    return (
      <>
        <Head>
          <title>Loading | Beginner Investor Hub</title>
          <meta name="robots" content="noindex, nofollow" />
        </Head>
        <div className="nyse-loading-container">
          <div className="nyse-spinner"></div>
          <p className="nyse-loading-text">Loading...</p>
        </div>
        <style>{`
          .nyse-loading-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            background: var(--nyse-color-background-alt);
          }
          .nyse-spinner {
            width: 60px;
            height: 60px;
            border: 4px solid var(--nyse-color-background-alt);
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

  return (
    <>
      <Head>
        <title>Sign Up | Beginner Investor Hub</title>
        <meta
          name="description"
          content="Create your account to start building your investment knowledge with AI-powered tools and portfolio simulations."
        />
      </Head>

      <div className="signup-page">
        <div className="signup-container">
          {/* Left Panel - Branding */}
          <div className="signup-branding">
            <Link href="/" className="brand-logo">
              <div className="logo-icon">📊</div>
              <span className="brand-name">Investor Hub</span>
            </Link>

            <h1>Start Your Journey</h1>
            <p className="brand-tagline">
              Join thousands of investors mastering the art of portfolio
              management with our precision-engineered learning platform.
            </p>

            <div className="benefits-list">
              <div className="benefit-item">
                <div className="benefit-icon">🎯</div>
                <div className="benefit-content">
                  <h3>Risk-Free Simulation</h3>
                  <p>
                    Practice with virtual portfolios before investing real money
                  </p>
                </div>
              </div>
              <div className="benefit-item">
                <div className="benefit-icon">🤖</div>
                <div className="benefit-content">
                  <h3>AI-Powered Coaching</h3>
                  <p>
                    Get personalized behavioral insights and recommendations
                  </p>
                </div>
              </div>
              <div className="benefit-item">
                <div className="benefit-icon">📈</div>
                <div className="benefit-content">
                  <h3>Real Market Data</h3>
                  <p>
                    Access institutional-grade analytics and market insights
                  </p>
                </div>
              </div>
            </div>

            <div className="social-proof">
              <div className="proof-stat">
                <div className="stat-number">12,847</div>
                <div className="stat-label">Active Investors</div>
              </div>
              <div className="proof-stat">
                <div className="stat-number">45,392</div>
                <div className="stat-label">Portfolios Created</div>
              </div>
            </div>
          </div>

          {/* Right Panel - Signup Form */}
          <div className="signup-form-panel">
            <div className="form-container">
              <div className="form-header">
                <h2>Create Account</h2>
                <p>Start learning with a free account</p>
              </div>

              <AuthForm mode="signup" />

              <div className="form-footer">
                <p>
                  Already have an account?{' '}
                  <Link href="/login" className="login-link">
                    Sign in
                  </Link>
                </p>
              </div>

              <div className="divider">
                <span>or</span>
              </div>

              <Link href="/" className="back-home">
                ← Back to home
              </Link>

              <div className="terms-notice">
                <p>
                  By signing up, you agree to our{' '}
                  <Link href="/terms">Terms of Service</Link> and{' '}
                  <Link href="/privacy">Privacy Policy</Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
