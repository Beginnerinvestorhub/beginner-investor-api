import Head from 'next/head';
import { useAuth } from '../hooks/useAuth';
import { useGamification } from '../hooks/useGamification';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'tools' | 'learning'>(
    'overview'
  );

  // Get gamification data - call hook unconditionally
  const { userProgress, loading: gamificationLoading } = useGamification(user?.uid || '');

  useEffect(() => {
    if (!loading && !user) {
      setIsRedirecting(true);
      router.replace('/login');
    }
  }, [user, loading, router]);

  if (loading || isRedirecting || gamificationLoading) {
    return (
      <>
        <Head>
          <title>Loading Dashboard | Beginner Investor Hub</title>
          <meta name="robots" content="noindex, nofollow" />
        </Head>
        <div className="nyse-loading-container">
          <div className="nyse-spinner"></div>
          <p className="nyse-loading-text">
            {isRedirecting ? 'Redirecting...' : 'Loading your dashboard...'}
          </p>
        </div>
      </>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <>
      <Head>
        <title>My Dashboard | Beginner Investor Hub</title>
        <meta
          name="description"
          content="Your personalized investment dashboard and learning journey."
        />
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <div className="dashboard-page">
        <div className="nyse-container">
          {/* Welcome Header */}
          <div className="dashboard-header">
            <div className="welcome-section">
              <h1 className="welcome-title">
                Welcome back, {user.displayName || 'Investor'}! 👋
              </h1>
              <p className="welcome-subtitle">
                Ready to continue your investment learning journey?
              </p>
            </div>

            {/* Quick Stats */}
            <div className="quick-stats">
              <div className="stat-card">
                <div className="stat-icon">🎯</div>
                <div className="stat-content">
                  <div className="stat-number">{userProgress?.level || 1}</div>
                  <div className="stat-label">Level</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">⭐</div>
                <div className="stat-content">
                  <div className="stat-number">{userProgress?.totalPoints || 0}</div>
                  <div className="stat-label">Points</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">🔥</div>
                <div className="stat-content">
                  <div className="stat-number">{userProgress?.streaks.loginStreak || 0}</div>
                  <div className="stat-label">Day Streak</div>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="dashboard-nav">
            <nav className="nav-tabs">
              <button
                className={`nav-tab ${activeTab === 'overview' ? 'active' : ''}`}
                onClick={() => setActiveTab('overview')}
              >
                📊 Overview
              </button>
              <button
                className={`nav-tab ${activeTab === 'tools' ? 'active' : ''}`}
                onClick={() => setActiveTab('tools')}
              >
                🛠️ Tools
              </button>
              <button
                className={`nav-tab ${activeTab === 'learning' ? 'active' : ''}`}
                onClick={() => setActiveTab('learning')}
              >
                📚 Learning
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="dashboard-content">
            {activeTab === 'overview' && (
              <div className="tab-panel">
                <div className="overview-grid">
                  {/* Recent Activity */}
                  <div className="activity-card">
                    <h3 className="card-title">Recent Activity</h3>
                    <div className="activity-list">
                      <div className="activity-item">
                        <div className="activity-icon">✅</div>
                        <div className="activity-content">
                          <div className="activity-text">
                            Completed &quot;Risk Assessment&quot; module
                          </div>
                          <div className="activity-time">2 hours ago</div>
                        </div>
                      </div>
                      <div className="activity-item">
                        <div className="activity-icon">📈</div>
                        <div className="activity-content">
                          <div className="activity-text">
                            Updated portfolio simulation
                          </div>
                          <div className="activity-time">1 day ago</div>
                        </div>
                      </div>
                      <div className="activity-item">
                        <div className="activity-icon">🏆</div>
                        <div className="activity-content">
                          <div className="activity-text">
                            Earned &quot;First Investment&quot; badge
                          </div>
                          <div className="activity-time">3 days ago</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Progress Overview */}
                  <div className="progress-card">
                    <h3 className="card-title">Learning Progress</h3>
                    <div className="progress-overview">
                      <div className="progress-item">
                        <div className="progress-label">Modules Completed</div>
                        <div className="progress-bar">
                          <div
                            className="progress-fill"
                            style={{ width: '65%' }}
                          ></div>
                        </div>
                        <div className="progress-text">13/20</div>
                      </div>
                      <div className="progress-item">
                        <div className="progress-label">Tools Mastered</div>
                        <div className="progress-bar">
                          <div
                            className="progress-fill"
                            style={{ width: '40%' }}
                          ></div>
                        </div>
                        <div className="progress-text">4/10</div>
                      </div>
                      <div className="progress-item">
                        <div className="progress-label">
                          Portfolio Simulations
                        </div>
                        <div className="progress-bar">
                          <div
                            className="progress-fill"
                            style={{ width: '80%' }}
                          ></div>
                        </div>
                        <div className="progress-text">8/10</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'tools' && (
              <div className="tab-panel">
                <div className="tools-grid">
                  <div className="tool-card">
                    <div className="tool-icon">📊</div>
                    <h3 className="tool-title">Portfolio Monitor</h3>
                    <p className="tool-description">
                      Track your virtual investments
                    </p>
                    <button className="tool-button">Open Tool</button>
                  </div>

                  <div className="tool-card">
                    <div className="tool-icon">⚖️</div>
                    <h3 className="tool-title">Risk Assessment</h3>
                    <p className="tool-description">
                      Evaluate your risk tolerance
                    </p>
                    <button className="tool-button">Open Tool</button>
                  </div>

                  <div className="tool-card">
                    <div className="tool-icon">🎯</div>
                    <h3 className="tool-title">ESG Screener</h3>
                    <p className="tool-description">
                      Find sustainable investments
                    </p>
                    <button className="tool-button">Open Tool</button>
                  </div>

                  <div className="tool-card">
                    <div className="tool-icon">💰</div>
                    <h3 className="tool-title">Fractional Calculator</h3>
                    <p className="tool-description">
                      Calculate fractional share values
                    </p>
                    <button className="tool-button">Open Tool</button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'learning' && (
              <div className="tab-panel">
                <div className="learning-path">
                  <h3 className="card-title">Your Learning Path</h3>
                  <div className="learning-modules">
                    <div className="module-item completed">
                      <div className="module-icon">✅</div>
                      <div className="module-content">
                        <h4>Investment Basics</h4>
                        <p>Learn fundamental investment concepts</p>
                      </div>
                    </div>

                    <div className="module-item current">
                      <div className="module-icon">🔄</div>
                      <div className="module-content">
                        <h4>Portfolio Management</h4>
                        <p>Master portfolio construction and rebalancing</p>
                      </div>
                    </div>

                    <div className="module-item locked">
                      <div className="module-icon">🔒</div>
                      <div className="module-content">
                        <h4>Advanced Strategies</h4>
                        <p>Explore advanced investment techniques</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
