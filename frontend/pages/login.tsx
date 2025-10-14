import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import AuthForm from '../components/AuthForm';

export default function LoginPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Redirect if already logged in
  useEffect(() => {
    if (!loading && user) {
      router.replace('/dashboard');
    }
  }, [user, loading, router]);

  // Don't show login form if already authenticated
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
        <style jsx>{css}</style>{`
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
        <title>Login | Beginner Investor Hub</title>
        <meta
          name="description"
          content="Login to access your personalized investment dashboard and portfolio simulations."
        />
      </Head>

      <div className="login-page">
        <div className="login-container">
          {/* Left Panel - Branding */}
          <div className="login-branding">
            <Link href="/" className="brand-logo">
              <div className="logo-icon">📊</div>
              <span className="brand-name">Investor Hub</span>
            </Link>

            <h1>Welcome Back</h1>
            <p className="brand-tagline">
              Continue your journey to financial mastery with precision tools
              and AI-powered insights.
            </p>

            <div className="features-list">
              <div className="feature-item">
                <span className="feature-icon">✓</span>
                <span>Portfolio simulation engine</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">✓</span>
                <span>AI behavioral coaching</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">✓</span>
                <span>Real-time market data</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">✓</span>
                <span>Risk analysis tools</span>
              </div>
            </div>
          </div>

          {/* Right Panel - Login Form */}
          <div className="login-form-panel">
            <div className="form-container">
              <div className="form-header">
                <h2>Sign In</h2>
                <p>Enter your credentials to access your account</p>
              </div>

              <AuthForm mode="login" />

              <div className="form-footer">
                <p>
                  New to Beginner Investor Hub?{' '}
                  <Link href="/signup" className="signup-link">
                    Create an account
                  </Link>
                </p>
              </div>

              <div className="divider">
                <span>or</span>
              </div>

              <Link href="/" className="back-home">
                ← Back to home
              </Link>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{css}</style>{`
        .login-page {
          min-height: 100vh;
          background: var(--nyse-color-background-alt);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: var(--nyse-spacing-lg);
        }

        .login-container {
          display: grid;
          grid-template-columns: 1fr 1fr;
          max-width: 1200px;
          width: 100%;
          background: var(--nyse-color-background);
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 20px 60px rgba(0, 61, 122, 0.15);
        }

        .login-branding {
          background: linear-gradient(
            135deg,
            var(--nyse-color-primary) 0%,
            var(--nyse-color-secondary) 100%
          );
          color: white;
          padding: var(--nyse-spacing-xxl);
          display: flex;
          flex-direction: column;
          justify-content: center;
          position: relative;
          overflow: hidden;
        }

        .login-branding::before {
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

        .login-branding h1 {
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

        .features-list {
          display: flex;
          flex-direction: column;
          gap: var(--nyse-spacing-md);
          position: relative;
          z-index: 1;
        }

        .feature-item {
          display: flex;
          align-items: center;
          gap: var(--nyse-spacing-md);
          font-size: 1rem;
        }

        .feature-icon {
          width: 24px;
          height: 24px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          flex-shrink: 0;
        }

        .login-form-panel {
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

        .signup-link {
          color: var(--nyse-color-primary);
          font-weight: 600;
          text-decoration: none;
          transition: color 0.3s ease;
        }

        .signup-link:hover {
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
        }

        .back-home:hover {
          color: var(--nyse-color-primary);
        }

        @media (max-width: 968px) {
          .login-container {
            grid-template-columns: 1fr;
          }

          .login-branding {
            padding: var(--nyse-spacing-xl);
            text-align: center;
          }

          .brand-logo {
            justify-content: center;
          }

          .features-list {
            align-items: center;
          }

          .login-form-panel {
            padding: var(--nyse-spacing-xl);
          }
        }

        @media (max-width: 640px) {
          .login-page {
            padding: var(--nyse-spacing-md);
          }

          .login-branding {
            padding: var(--nyse-spacing-lg);
          }

          .login-form-panel {
            padding: var(--nyse-spacing-lg);
          }
        }
      `}</style>
    </>
  );
}
