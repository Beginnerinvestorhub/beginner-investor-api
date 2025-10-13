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
        <style jsx>{`
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

      <style jsx>{`
        .signup-page {
          min-height: 100vh;
          background: var(--nyse-color-background-alt);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: var(--nyse-spacing-lg);
        }

        .signup-container {
          display: grid;
          grid-template-columns: 1fr 1fr;
          max-width: 1200px;
          width: 100%;
          background: var(--nyse-color-background);
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 20px 60px rgba(0, 61, 122, 0.15);
        }

        .signup-branding {
          background: linear-gradient(
            135deg,
            var(--nyse-color-secondary) 0%,
            var(--nyse-color-accent) 100%
          );
          color: white;
          padding: var(--nyse-spacing-xxl);
          display: flex;
          flex-direction: column;
          justify-content: center;
          position: relative;
          overflow: hidden;
        }

        .signup-branding::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background:
            repeating-linear-gradient(
              90deg,
              transparent,
              transparent 30px,
              rgba(255, 255, 255, 0.03) 30px,
              rgba(255, 255, 255, 0.03) 31px
            ),
            repeating-linear-gradient(
              0deg,
              transparent,
              transparent 30px,
              rgba(255, 255, 255, 0.03) 30px,
              rgba(255, 255, 255, 0.03) 31px
            );
          pointer-events: none;
        }

        .brand-logo {
          display: flex;
          align-items: center;
          gap: var(--nyse-spacing-md);
          margin-bottom: var(--nyse-spacing-xxl);
          text-decoration: none;
          position: relative;
          z-index: 1;
        }

        .logo-icon {
          font-size: 2.5rem;
        }

        .brand-name {
          font-family: var(--nyse-font-serif);
          font-size: 1.75rem;
          font-weight: 700;
          color: white;
          letter-spacing: 2px;
        }

        .signup-branding h1 {
          font-family: var(--nyse-font-serif);
          font-size: clamp(2rem, 4vw, 3rem);
          margin-bottom: var(--nyse-spacing-md);
          color: white;
          position: relative;
          z-index: 1;
        }

        .brand-tagline {
          font-size: 1.1rem;
          line-height: 1.7;
          margin-bottom: var(--nyse-spacing-xxl);
          opacity: 0.95;
          position: relative;
          z-index: 1;
        }

        .benefits-list {
          display: flex;
          flex-direction: column;
          gap: var(--nyse-spacing-lg);
          margin-bottom: var(--nyse-spacing-xxl);
          position: relative;
          z-index: 1;
        }

        .benefit-item {
          display: flex;
          gap: var(--nyse-spacing-md);
          align-items: flex-start;
        }

        .benefit-icon {
          font-size: 2rem;
          flex-shrink: 0;
        }

        .benefit-content h3 {
          font-size: 1.1rem;
          font-weight: 700;
          margin-bottom: var(--nyse-spacing-xs);
          color: white;
        }

        .benefit-content p {
          font-size: 0.95rem;
          opacity: 0.9;
          margin: 0;
          line-height: 1.5;
        }

        .social-proof {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--nyse-spacing-lg);
          padding: var(--nyse-spacing-lg);
          background: rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          backdrop-filter: blur(10px);
          position: relative;
          z-index: 1;
        }

        .proof-stat {
          text-align: center;
        }

        .stat-number {
          font-family: var(--nyse-font-serif);
          font-size: 2rem;
          font-weight: 700;
          margin-bottom: var(--nyse-spacing-xs);
        }

        .stat-label {
          font-size: 0.85rem;
          opacity: 0.9;
        }

        .signup-form-panel {
          padding: var(--nyse-spacing-xxl);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .form-container {
          width: 100%;
          max-width: 400px;
        }

        .form-header {
          margin-bottom: var(--nyse-spacing-xl);
        }

        .form-header h2 {
          font-family: var(--nyse-font-serif);
          font-size: 2rem;
          color: var(--nyse-color-dark);
          margin-bottom: var(--nyse-spacing-sm);
        }

        .form-header p {
          color: var(--nyse-color-text-light);
          font-size: 0.95rem;
          margin: 0;
        }

        .form-footer {
          margin-top: var(--nyse-spacing-xl);
          text-align: center;
        }

        .form-footer p {
          color: var(--nyse-color-text);
          font-size: 0.95rem;
          margin: 0;
        }

        .login-link {
          color: var(--nyse-color-primary);
          font-weight: 600;
          text-decoration: none;
          transition: color 0.3s ease;
        }

        .login-link:hover {
          color: var(--nyse-color-accent);
          text-decoration: underline;
        }

        .divider {
          margin: var(--nyse-spacing-xl) 0;
          text-align: center;
          position: relative;
        }

        .divider::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 0;
          right: 0;
          height: 1px;
          background: var(--nyse-color-border);
        }

        .divider span {
          position: relative;
          background: var(--nyse-color-background);
          padding: 0 var(--nyse-spacing-md);
          color: var(--nyse-color-text-light);
          font-size: 0.9rem;
        }

        .back-home {
          display: block;
          text-align: center;
          color: var(--nyse-color-text-light);
          text-decoration: none;
          font-size: 0.95rem;
          transition: color 0.3s ease;
          margin-bottom: var(--nyse-spacing-lg);
        }

        .back-home:hover {
          color: var(--nyse-color-primary);
        }

        .terms-notice {
          text-align: center;
          margin-top: var(--nyse-spacing-lg);
          padding-top: var(--nyse-spacing-lg);
          border-top: 1px solid var(--nyse-color-border);
        }

        .terms-notice p {
          font-size: 0.8rem;
          color: var(--nyse-color-text-light);
          margin: 0;
          line-height: 1.6;
        }

        .terms-notice a {
          color: var(--nyse-color-primary);
          text-decoration: none;
          font-weight: 600;
        }

        .terms-notice a:hover {
          text-decoration: underline;
        }

        @media (max-width: 968px) {
          .signup-container {
            grid-template-columns: 1fr;
          }

          .signup-branding {
            padding: var(--nyse-spacing-xl);
            text-align: center;
          }

          .brand-logo {
            justify-content: center;
          }

          .benefits-list {
            align-items: center;
          }

          .benefit-item {
            text-align: left;
            max-width: 400px;
          }

          .signup-form-panel {
            padding: var(--nyse-spacing-xl);
          }
        }

        @media (max-width: 640px) {
          .signup-page {
            padding: var(--nyse-spacing-md);
          }

          .signup-branding {
            padding: var(--nyse-spacing-lg);
          }

          .signup-form-panel {
            padding: var(--nyse-spacing-lg);
          }

          .social-proof {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </>
  );
}
