import Head from 'next/head';
import { useAuth } from '../hooks/useAuth';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [profileData, setProfileData] = useState({
    displayName: '',
    email: '',
    experienceLevel: 'beginner',
    riskTolerance: 'moderate',
    investmentGoal: '',
    investmentHorizon: '3-5',
    initialCapital: 10000,
  });
  const [profileCompletion, setProfileCompletion] = useState(0);
  const [profileLoading, setProfileLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {
    if (!loading && !user) {
      setIsRedirecting(true);
      router.replace('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      setProfileData({
        displayName: user.displayName || '',
        email: user.email || '',
        experienceLevel: user.experienceLevel || 'beginner',
        riskTolerance: user.riskTolerance || 'moderate',
        investmentGoal: user.investmentGoal || '',
        investmentHorizon: user.investmentHorizon || '3-5',
        initialCapital: user.initialCapital || 10000,
      });
    }
  }, [user]);

  useEffect(() => {
    const completedFields = Object.values(profileData).filter(
      value => value !== '' && value !== 0
    ).length;
    const totalFields = Object.keys(profileData).length;
    setProfileCompletion(Math.round((completedFields / totalFields) * 100));
  }, [profileData]);

  const handleChange = e => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value,
    }));
    setSuccess(false);
    setError('');
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setProfileLoading(true);
    setError('');
    setSuccess(false);

    try {
      const response = await fetch('/api/profile/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setProfileLoading(false);
    }
  };

  if (loading || isRedirecting) {
    return (
      <>
        <Head>
          <title>Loading Profile | Beginner Investor Hub</title>
          <meta name="robots" content="noindex, nofollow" />
        </Head>
        <div className="nyse-loading-container">
          <div className="nyse-spinner"></div>
          <p className="nyse-loading-text">
            {isRedirecting ? 'Redirecting...' : 'Loading your profile...'}
          </p>
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

  if (!user) {
    return null;
  }

  return (
    <>
      <Head>
        <title>My Profile | Beginner Investor Hub</title>
        <meta
          name="description"
          content="Manage your profile and investment preferences."
        />
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <div className="profile-page">
        <div className="nyse-container">
          {/* Profile Header */}
          <div className="profile-header">
            <div className="profile-avatar">
              <div className="avatar-circle">
                {user.displayName?.charAt(0)?.toUpperCase() ||
                  user.email?.charAt(0)?.toUpperCase() ||
                  'U'}
              </div>
            </div>
            <div className="profile-info">
              <h1 className="profile-name">{user.displayName || 'User'}</h1>
              <p className="profile-email">{user.email}</p>
              <div className="profile-stats">
                <div className="stat">
                  <span className="stat-value">Level {user.level || 1}</span>
                  <span className="stat-label">Investor Level</span>
                </div>
                <div className="stat">
                  <span className="stat-value">{user.points || 0}</span>
                  <span className="stat-label">Points</span>
                </div>
                <div className="stat">
                  <span className="stat-value">{user.streak || 0} days</span>
                  <span className="stat-label">Streak</span>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Form Component - Import dynamically to avoid issues */}
          <div className="profile-content">
            <div className="profile-section">
              <h2 className="section-title">Profile Settings</h2>
              <p className="section-description">
                Update your personal information and investment preferences
              </p>

              {/* Profile Form Component Placeholder */}
              <div className="profile-form-placeholder">
                <div className="form-card">
                  <h3>Profile Information</h3>
                  <div className="form-group">
                    <label>Display Name</label>
                    <input
                      type="text"
                      defaultValue={user.displayName || ''}
                      placeholder="Enter your display name"
                    />
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input type="email" value={user.email || ''} disabled />
                    <small>Email cannot be changed</small>
                  </div>
                  <button className="nyse-btn nyse-btn-primary">
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{css}</style>{`
        .profile-page {
          min-height: 100vh;
          background: var(--nyse-color-background-alt);
        }

        .profile-header {
          background: var(--nyse-color-background);
          padding: var(--nyse-spacing-xxl);
          margin-bottom: var(--nyse-spacing-xl);
          border-radius: 12px;
          border: 1px solid var(--nyse-color-border);
          display: flex;
          gap: var(--nyse-spacing-xl);
          align-items: center;
        }

        .profile-avatar {
          flex-shrink: 0;
        }

        .avatar-circle {
          width: 80px;
          height: 80px;
          background: linear-gradient(
            135deg,
            var(--nyse-color-primary) 0%,
            var(--nyse-color-accent) 100%
          );
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--nyse-font-serif);
          font-size: 2rem;
          font-weight: 700;
          color: white;
          box-shadow: 0 4px 12px rgba(0, 61, 122, 0.2);
        }

        .profile-info {
          flex: 1;
        }

        .profile-name {
          font-family: var(--nyse-font-serif);
          font-size: 2rem;
          color: var(--nyse-color-dark);
          margin-bottom: var(--nyse-spacing-xs);
        }

        .profile-email {
          color: var(--nyse-color-text-light);
          font-size: 1rem;
          margin-bottom: var(--nyse-spacing-lg);
        }

        .profile-stats {
          display: flex;
          gap: var(--nyse-spacing-lg);
          flex-wrap: wrap;
        }

        .stat {
          display: flex;
          flex-direction: column;
          gap: var(--nyse-spacing-xs);
        }

        .stat-value {
          font-family: var(--nyse-font-serif);
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--nyse-color-primary);
        }

        .stat-label {
          font-size: 0.85rem;
          color: var(--nyse-color-text-light);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .profile-content {
          background: var(--nyse-color-background);
          padding: var(--nyse-spacing-xxl);
          border-radius: 12px;
          border: 1px solid var(--nyse-color-border);
        }

        .profile-section {
          max-width: 600px;
        }

        .section-title {
          font-family: var(--nyse-font-serif);
          font-size: 1.75rem;
          color: var(--nyse-color-primary);
          margin-bottom: var(--nyse-spacing-sm);
        }

        .section-description {
          color: var(--nyse-color-text-light);
          font-size: 1rem;
          margin-bottom: var(--nyse-spacing-xl);
        }

        .profile-form-placeholder {
          background: var(--nyse-color-background-alt);
          padding: var(--nyse-spacing-xl);
          border-radius: 8px;
          border: 2px dashed var(--nyse-color-border);
        }

        .form-card h3 {
          font-family: var(--nyse-font-serif);
          font-size: 1.25rem;
          color: var(--nyse-color-dark);
          margin-bottom: var(--nyse-spacing-lg);
        }

        .form-group {
          margin-bottom: var(--nyse-spacing-lg);
        }

        .form-group label {
          display: block;
          font-weight: 600;
          color: var(--nyse-color-dark);
          margin-bottom: var(--nyse-spacing-sm);
        }

        .form-group input {
          width: 100%;
          padding: var(--nyse-spacing-md);
          border: 1px solid var(--nyse-color-border);
          border-radius: 4px;
          font-family: var(--nyse-font-sans);
          font-size: 1rem;
        }

        .form-group input:disabled {
          background: var(--nyse-color-background-alt);
          opacity: 0.7;
          cursor: not-allowed;
        }

        .form-group small {
          display: block;
          color: var(--nyse-color-text-light);
          font-size: 0.85rem;
          margin-top: var(--nyse-spacing-xs);
          font-style: italic;
        }

        .nyse-btn {
          font-family: var(--nyse-font-sans);
          font-size: 1rem;
          font-weight: 600;
          padding: var(--nyse-spacing-md) var(--nyse-spacing-xl);
          border: none;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .nyse-btn-primary {
          background-color: var(--nyse-color-primary);
          color: var(--nyse-color-background);
        }

        .nyse-btn-primary:hover {
          background-color: var(--nyse-color-secondary);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 61, 122, 0.3);
        }

        @media (max-width: 768px) {
          .profile-header {
            flex-direction: column;
            text-align: center;
            padding: var(--nyse-spacing-xl);
          }

          .profile-stats {
            justify-content: center;
          }
        }
      `}</style>
    </>
  );
}
