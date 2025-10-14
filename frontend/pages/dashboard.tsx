import Head from 'next/head';
import { useAuth } from '../hooks/useAuth';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'tools' | 'learning'>(
    'overview'
  );

  useEffect(() => {
    if (!loading && !user) {
      setIsRedirecting(true);
      router.replace('/login');
    }
  }, [user, loading, router]);

  if (loading || isRedirecting) {
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
                  <div className="stat-number">{user.level || 1}</div>
                  <div className="stat-label">Level</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">⭐</div>
                <div className="stat-content">
                  <div className="stat-number">{user.points || 0}</div>
                  <div className="stat-label">Points</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">🔥</div>
                <div className="stat-content">
                  <div className="stat-number">{user.streak || 0}</div>
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

      <style jsx>{`
        .dashboard-page {
          min-height: 100vh;
          background: var(--nyse-color-background-alt);
        }

        .dashboard-header {
          background: var(--nyse-color-background);
          padding: var(--nyse-spacing-xxl);
          margin-bottom: var(--nyse-spacing-xl);
          border-radius: 12px;
          border: 1px solid var(--nyse-color-border);
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: var(--nyse-spacing-xl);
        }

        .welcome-section {
          flex: 1;
        }

        .welcome-title {
          font-family: var(--nyse-font-serif);
          font-size: clamp(1.5rem, 3vw, 2rem);
          color: var(--nyse-color-dark);
          margin-bottom: var(--nyse-spacing-sm);
        }

        .welcome-subtitle {
          color: var(--nyse-color-text-light);
          font-size: 1.1rem;
          margin: 0;
        }

        .quick-stats {
          display: flex;
          gap: var(--nyse-spacing-md);
        }

        .stat-card {
          background: var(--nyse-color-background-alt);
          padding: var(--nyse-spacing-lg);
          border-radius: 8px;
          text-align: center;
          min-width: 80px;
          border: 1px solid var(--nyse-color-border);
        }

        .stat-icon {
          font-size: 1.5rem;
          margin-bottom: var(--nyse-spacing-sm);
        }

        .stat-number {
          font-family: var(--nyse-font-serif);
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--nyse-color-primary);
          margin-bottom: var(--nyse-spacing-xs);
        }

        .stat-label {
          font-size: 0.8rem;
          color: var(--nyse-color-text-light);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .dashboard-nav {
          margin-bottom: var(--nyse-spacing-xl);
        }

        .nav-tabs {
          display: flex;
          gap: var(--nyse-spacing-sm);
          background: var(--nyse-color-background);
          padding: var(--nyse-spacing-sm);
          border-radius: 8px;
          border: 1px solid var(--nyse-color-border);
        }

        .nav-tab {
          flex: 1;
          padding: var(--nyse-spacing-md) var(--nyse-spacing-lg);
          background: transparent;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-family: var(--nyse-font-sans);
          font-size: 1rem;
          font-weight: 600;
          color: var(--nyse-color-text);
          transition: all 0.3s ease;
        }

        .nav-tab:hover {
          background: var(--nyse-color-background-alt);
          color: var(--nyse-color-primary);
        }

        .nav-tab.active {
          background: var(--nyse-color-primary);
          color: white;
        }

        .dashboard-content {
          background: var(--nyse-color-background);
          padding: var(--nyse-spacing-xxl);
          border-radius: 12px;
          border: 1px solid var(--nyse-color-border);
        }

        .tab-panel {
          animation: fadeIn 0.3s ease;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .overview-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--nyse-spacing-xl);
        }

        .activity-card,
        .progress-card {
          background: var(--nyse-color-background-alt);
          padding: var(--nyse-spacing-xl);
          border-radius: 8px;
          border: 1px solid var(--nyse-color-border);
        }

        .card-title {
          font-family: var(--nyse-font-serif);
          font-size: 1.25rem;
          color: var(--nyse-color-primary);
          margin-bottom: var(--nyse-spacing-lg);
        }

        .activity-list {
          display: flex;
          flex-direction: column;
          gap: var(--nyse-spacing-md);
        }

        .activity-item {
          display: flex;
          gap: var(--nyse-spacing-md);
          align-items: center;
          padding: var(--nyse-spacing-md);
          background: var(--nyse-color-background);
          border-radius: 6px;
          border-left: 3px solid var(--nyse-color-accent);
        }

        .activity-icon {
          font-size: 1.25rem;
        }

        .activity-content {
          flex: 1;
        }

        .activity-text {
          font-size: 0.95rem;
          color: var(--nyse-color-dark);
          margin-bottom: var(--nyse-spacing-xs);
        }

        .activity-time {
          font-size: 0.8rem;
          color: var(--nyse-color-text-light);
        }

        .progress-overview {
          display: flex;
          flex-direction: column;
          gap: var(--nyse-spacing-lg);
        }

        .progress-item {
          display: flex;
          flex-direction: column;
          gap: var(--nyse-spacing-sm);
        }

        .progress-label {
          font-size: 0.9rem;
          color: var(--nyse-color-text);
          font-weight: 600;
        }

        .progress-bar {
          width: 100%;
          height: 8px;
          background: var(--nyse-color-background-alt);
          border-radius: 4px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(
            90deg,
            var(--nyse-color-primary) 0%,
            var(--nyse-color-accent) 100%
          );
          transition: width 0.5s ease;
        }

        .progress-text {
          font-size: 0.85rem;
          color: var(--nyse-color-text-light);
          text-align: right;
        }

        .tools-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: var(--nyse-spacing-lg);
        }

        .tool-card {
          background: var(--nyse-color-background-alt);
          padding: var(--nyse-spacing-xl);
          border-radius: 8px;
          border: 1px solid var(--nyse-color-border);
          text-align: center;
          transition: all 0.3s ease;
        }

        .tool-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 61, 122, 0.1);
          border-color: var(--nyse-color-primary);
        }

        .tool-icon {
          font-size: 3rem;
          margin-bottom: var(--nyse-spacing-md);
        }

        .tool-title {
          font-family: var(--nyse-font-serif);
          font-size: 1.25rem;
          color: var(--nyse-color-dark);
          margin-bottom: var(--nyse-spacing-sm);
        }

        .tool-description {
          color: var(--nyse-color-text-light);
          font-size: 0.95rem;
          margin-bottom: var(--nyse-spacing-lg);
        }

        .tool-button {
          background: var(--nyse-color-primary);
          color: white;
          border: none;
          padding: var(--nyse-spacing-sm) var(--nyse-spacing-lg);
          border-radius: 4px;
          font-family: var(--nyse-font-sans);
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .tool-button:hover {
          background: var(--nyse-color-secondary);
          transform: translateY(-1px);
        }

        .learning-path {
          background: var(--nyse-color-background-alt);
          padding: var(--nyse-spacing-xl);
          border-radius: 8px;
          border: 1px solid var(--nyse-color-border);
        }

        .learning-modules {
          display: flex;
          flex-direction: column;
          gap: var(--nyse-spacing-md);
        }

        .module-item {
          display: flex;
          gap: var(--nyse-spacing-md);
          align-items: center;
          padding: var(--nyse-spacing-lg);
          background: var(--nyse-color-background);
          border-radius: 8px;
          border: 1px solid var(--nyse-color-border);
        }

        .module-item.completed {
          border-left: 4px solid #4caf50;
        }

        .module-item.current {
          border-left: 4px solid var(--nyse-color-primary);
          background: linear-gradient(
            135deg,
            rgba(0, 61, 122, 0.05) 0%,
            rgba(0, 160, 227, 0.05) 100%
          );
        }

        .module-item.locked {
          opacity: 0.6;
        }

        .module-icon {
          font-size: 1.5rem;
        }

        .module-content h4 {
          font-family: var(--nyse-font-serif);
          font-size: 1.1rem;
          color: var(--nyse-color-dark);
          margin-bottom: var(--nyse-spacing-xs);
        }

        .module-content p {
          color: var(--nyse-color-text-light);
          font-size: 0.9rem;
          margin: 0;
        }

        @media (max-width: 968px) {
          .dashboard-header {
            flex-direction: column;
            align-items: stretch;
            text-align: center;
          }

          .quick-stats {
            justify-content: center;
          }

          .overview-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {
          .nav-tabs {
            flex-direction: column;
          }

          .tools-grid {
            grid-template-columns: 1fr;
          }

          .dashboard-header {
            padding: var(--nyse-spacing-xl);
          }

          .dashboard-content {
            padding: var(--nyse-spacing-lg);
          }
        }
      `}</style>
    </>
  );
}
