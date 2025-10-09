import { useState, useEffect } from 'react';

interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalPortfolios: number;
  simulationsToday: number;
  simulationsTotal: number;
  revenueThisMonth: number;
  systemHealth: 'healthy' | 'warning' | 'critical';
}

interface RecentUser {
  id: string;
  email: string;
  displayName: string;
  createdAt: string;
  role: string;
}

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'portfolios' | 'settings'>('overview');
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 12847,
    activeUsers: 8392,
    totalPortfolios: 45392,
    simulationsToday: 1247,
    simulationsTotal: 234891,
    revenueThisMonth: 47280,
    systemHealth: 'healthy'
  });
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API calls
      const response = await fetch('/api/admin/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
        setRecentUsers(data.recentUsers);
      }
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'healthy': return '#4caf50';
      case 'warning': return '#ff9800';
      case 'critical': return '#f44336';
      default: return '#9e9e9e';
    }
  };

  return (
    <div className="admin-panel">
      <div className="nyse-container">
        {/* Tab Navigation */}
        <nav className="admin-tabs">
          <button
            className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            📊 Overview
          </button>
          <button
            className={`tab-button ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            👥 Users
          </button>
          <button
            className={`tab-button ${activeTab === 'portfolios' ? 'active' : ''}`}
            onClick={() => setActiveTab('portfolios')}
          >
            💼 Portfolios
          </button>
          <button
            className={`tab-button ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            ⚙️ Settings
          </button>
        </nav>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="tab-content">
            {/* Stats Grid */}
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">👥</div>
                <div className="stat-info">
                  <div className="stat-value">{stats.totalUsers.toLocaleString()}</div>
                  <div className="stat-label">Total Users</div>
                  <div className="stat-change positive">+234 this week</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">🟢</div>
                <div className="stat-info">
                  <div className="stat-value">{stats.activeUsers.toLocaleString()}</div>
                  <div className="stat-label">Active Users</div>
                  <div className="stat-change positive">+12% vs last week</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">💼</div>
                <div className="stat-info">
                  <div className="stat-value">{stats.totalPortfolios.toLocaleString()}</div>
                  <div className="stat-label">Total Portfolios</div>
                  <div className="stat-change positive">+892 this month</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">🎯</div>
                <div className="stat-info">
                  <div className="stat-value">{stats.simulationsToday.toLocaleString()}</div>
                  <div className="stat-label">Simulations Today</div>
                  <div className="stat-change neutral">{stats.simulationsTotal.toLocaleString()} total</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">💰</div>
                <div className="stat-info">
                  <div className="stat-value">${(stats.revenueThisMonth / 1000).toFixed(1)}K</div>
                  <div className="stat-label">Revenue (MTD)</div>
                  <div className="stat-change positive">+18% vs last month</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">💚</div>
                <div className="stat-info">
                  <div className="stat-value" style={{ color: getHealthColor(stats.systemHealth) }}>
                    {stats.systemHealth.toUpperCase()}
                  </div>
                  <div className="stat-label">System Health</div>
                  <div className="stat-change neutral">All services operational</div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="activity-section">
              <h2 className="section-title">Recent User Registrations</h2>
              <div className="activity-table">
                <table className="nyse-table">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Joined</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>John Davidson</td>
                      <td>john.d@email.com</td>
                      <td><span className="role-badge user">User</span></td>
                      <td>2 hours ago</td>
                      <td>
                        <button className="action-btn">View</button>
                      </td>
                    </tr>
                    <tr>
                      <td>Sarah Mitchell</td>
                      <td>s.mitchell@email.com</td>
                      <td><span className="role-badge user">User</span></td>
                      <td>5 hours ago</td>
                      <td>
                        <button className="action-btn">View</button>
                      </td>
                    </tr>
                    <tr>
                      <td>Marcus Chen</td>
                      <td>m.chen@email.com</td>
                      <td><span className="role-badge premium">Premium</span></td>
                      <td>1 day ago</td>
                      <td>
                        <button className="action-btn">View</button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="tab-content">
            <div className="content-header">
              <h2 className="section-title">User Management</h2>
              <div className="header-actions">
                <input
                  type="search"
                  placeholder="Search users..."
                  className="search-input"
                />
                <button className="nyse-btn nyse-btn-primary">+ Add User</button>
              </div>
            </div>
            <p className="placeholder-text">User management interface coming soon...</p>
          </div>
        )}

        {/* Portfolios Tab */}
        {activeTab === 'portfolios' && (
          <div className="tab-content">
            <div className="content-header">
              <h2 className="section-title">Portfolio Management</h2>
            </div>
            <p className="placeholder-text">Portfolio analytics and management tools coming soon...</p>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="tab-content">
            <div className="content-header">
              <h2 className="section-title">System Settings</h2>
            </div>
            <div className="settings-grid">
              <div className="setting-card">
                <h3>Email Notifications</h3>
                <label className="toggle-switch">
                  <input type="checkbox" defaultChecked />
                  <span className="slider"></span>
                </label>
              </div>
              <div className="setting-card">
                <h3>User Registrations</h3>
                <label className="toggle-switch">
                  <input type="checkbox" defaultChecked />
                  <span className="slider"></span>
                </label>
              </div>
              <div className="setting-card">
                <h3>Maintenance Mode</h3>
                <label className="toggle-switch">
                  <input type="checkbox" />
                  <span className="slider"></span>
                </label>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .admin-panel {
          min-height: 60vh;
        }

        .admin-tabs {
          display: flex;
          gap: var(--nyse-spacing-sm);
          margin-bottom: var(--nyse-spacing-xl);
          border-bottom: 2px solid var(--nyse-color-border);
          overflow-x: auto;
        }

        .tab-button {
          padding: var(--nyse-spacing-md) var(--nyse-spacing-lg);
          background: transparent;
          border: none;
          border-bottom: 3px solid transparent;
          cursor: pointer;
          font-family: var(--nyse-font-sans);
          font-size: 1rem;
          font-weight: 600;
          color: var(--nyse-color-text);
          transition: all 0.3s ease;
          white-space: nowrap;
        }

        .tab-button:hover {
          color: var(--nyse-color-primary);
          background: rgba(0, 61, 122, 0.05);
        }

        .tab-button.active {
          color: var(--nyse-color-primary);
          border-bottom-color: var(--nyse-color-primary);
        }

        .tab-content {
          animation: fadeIn 0.3s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: var(--nyse-spacing-lg);
          margin-bottom: var(--nyse-spacing-xxl);
        }

        .stat-card {
          background: var(--nyse-color-background);
          padding: var(--nyse-spacing-xl);
          border-radius: 12px;
          border: 1px solid var(--nyse-color-border);
          display: flex;
          gap: var(--nyse-spacing-lg);
          align-items: flex-start;
          transition: all 0.3s ease;
        }

        .stat-card:hover {
          box-shadow: 0 8px 24px rgba(0, 61, 122, 0.1);
          transform: translateY(-2px);
        }

        .stat-icon {
          font-size: 2.5rem;
        }

        .stat-info {
          flex: 1;
        }

        .stat-value {
          font-family: var(--nyse-font-serif);
          font-size: 2rem;
          font-weight: 700;
          color: var(--nyse-color-dark);
          margin-bottom: var(--nyse-spacing-xs);
        }

        .stat-label {
          font-size: 0.9rem;
          color: var(--nyse-color-text-light);
          margin-bottom: var(--nyse-spacing-xs);
        }

        .stat-change {
          font-size: 0.85rem;
          font-weight: 600;
        }

        .stat-change.positive {
          color: #4caf50;
        }

        .stat-change.negative {
          color: #f44336;
        }

        .stat-change.neutral {
          color: var(--nyse-color-text-light);
        }

        .activity-section {
          background: var(--nyse-color-background);
          padding: var(--nyse-spacing-xl);
          border-radius: 12px;
          border: 1px solid var(--nyse-color-border);
        }

        .section-title {
          font-family: var(--nyse-font-serif);
          font-size: 1.5rem;
          color: var(--nyse-color-primary);
          margin-bottom: var(--nyse-spacing-lg);
        }

        .nyse-table {
          width: 100%;
          border-collapse: collapse;
        }

        .nyse-table th {
          background: var(--nyse-color-background-alt);
          padding: var(--nyse-spacing-md);
          text-align: left;
          font-weight: 600;
          color: var(--nyse-color-dark);
          border-bottom: 2px solid var(--nyse-color-border);
        }

        .nyse-table td {
          padding: var(--nyse-spacing-md);
          border-bottom: 1px solid var(--nyse-color-border);
        }

        .nyse-table tr:hover {
          background: var(--nyse-color-background-alt);
        }

        .role-badge {
          display: inline-block;
          padding: var(--nyse-spacing-xs) var(--nyse-spacing-sm);
          border-radius: 12px;
          font-size: 0.8rem;
          font-weight: 700;
          text-transform: uppercase;
        }

        .role-badge.user {
          background: #e3f2fd;
          color: #1976d2;
        }

        .role-badge.premium {
          background: #fff3e0;
          color: #f57c00;
        }

        .role-badge.admin {
          background: #f3e5f5;
          color: #7b1fa2;
        }

        .action-btn {
          padding: var(--nyse-spacing-xs) var(--nyse-spacing-md);
          background: var(--nyse-color-primary);
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.85rem;
          font-weight: 600;
          transition: all 0.3s ease;
        }

        .action-btn:hover {
          background: var(--nyse-color-secondary);
        }

        .content-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--nyse-spacing-xl);
          flex-wrap: wrap;
          gap: var(--nyse-spacing-md);
        }

        .header-actions {
          display: flex;
          gap: var(--nyse-spacing-md);
        }

        .search-input {
          padding: var(--nyse-spacing-sm) var(--nyse-spacing-md);
          border: 1px solid var(--nyse-color-border);
          border-radius: 4px;
          font-family: var(--nyse-font-sans);
          min-width: 250px;
        }

        .search-input:focus {
          outline: none;
          border-color: var(--nyse-color-primary);
        }

        .nyse-btn {
          padding: var(--nyse-spacing-sm) var(--nyse-spacing-lg);
          border: none;
          border-radius: 4px;
          font-family: var(--nyse-font-sans);
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .nyse-btn-primary {
          background: var(--nyse-color-primary);
          color: white;
        }

        .nyse-btn-primary:hover {
          background: var(--nyse-color-secondary);
        }

        .placeholder-text {
          text-align: center;
          color: var(--nyse-color-text-light);
          padding: var(--nyse-spacing-xxl);
          font-size: 1.1rem;
        }

        .settings-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: var(--nyse-spacing-lg);
        }

        .setting-card {
          background: var(--nyse-color-background);
          padding: var(--nyse-spacing-xl);
          border-radius: 12px;
          border: 1px solid var(--nyse-color-border);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .setting-card h3 {
          font-size: 1.1rem;
          color: var(--nyse-color-dark);
          margin: 0;
        }

        .toggle-switch {
          position: relative;
          display: inline-block;
          width: 60px;
          height: 34px;
        }

        .toggle-switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }

        .slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: #ccc;
          transition: 0.4s;
          border-radius: 34px;
        }

        .slider:before {
          position: absolute;
          content: "";
          height: 26px;
          width: 26px;
          left: 4px;
          bottom: 4px;
          background-color: white;
          transition: 0.4s;
          border-radius: 50%;
        }

        input:checked + .slider {
          background-color: var(--nyse-color-primary);
        }

        input:checked + .slider:before {
          transform: translateX(26px);
        }

        @media (max-width: 768px) {
          .stats-grid {
            grid-template-columns: 1fr;
          }

          .content-header {
            flex-direction: column;
            align-items: stretch;
          }

          .header-actions {
            flex-direction: column;
          }

          .search-input {
            min-width: 100%;
          }

          .nyse-table {
            font-size: 0.85rem;
          }

          .nyse-table th,
          .nyse-table td {
            padding: var(--nyse-spacing-sm);
          }
        }
      `}</style>
    </div>
  );
}body: JSON.stringify(profileData),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="nyse-profile-form-container">
      {/* Progress Bar */}
      <div className="profile-progress">
        <div className="progress-header">
          <span className="progress-label">Profile Completion</span>
          <span className="progress-percentage">{profileCompletion}%</span>
        </div>
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${profileCompletion}%` }}
          ></div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="nyse-profile-form">
        {/* Personal Information Section */}
        <section className="form-section">
          <h2 className="section-title">Personal Information</h2>
          
          <div className="form-group">
            <label htmlFor="displayName" className="form-label">
              Display Name <span className="required">*</span>
            </label>
            <input
              type="text"
              id="displayName"
              name="displayName"
              value={profileData.displayName}
              onChange={handleChange}
              className="nyse-input"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={profileData.email}
              className="nyse-input"
              disabled
            />
            <span className="form-hint">Email cannot be changed</span>
          </div>
        </section>

        {/* Investment Profile Section */}
        <section className="form-section">
          <h2 className="section-title">Investment Profile</h2>

          <div className="form-group">
            <label htmlFor="experienceLevel" className="form-label">
              Experience Level <span className="required">*</span>
            </label>
            <select
              id="experienceLevel"
              name="experienceLevel"
              value={profileData.experienceLevel}
              onChange={handleChange}
              className="nyse-select"
              required
            >
              <option value="beginner">Beginner - New to investing</option>
              <option value="intermediate">Intermediate - Some experience</option>
              <option value="advanced">Advanced - Experienced investor</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="riskTolerance" className="form-label">
              Risk Tolerance <span className="required">*</span>
            </label>
            <div className="risk-options">
              <label className={`risk-option ${profileData.riskTolerance === 'conservative' ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="riskTolerance"
                  value="conservative"
                  checked={profileData.riskTolerance === 'conservative'}
                  onChange={handleChange}
                />
                <div className="risk-content">
                  <span className="risk-icon">🛡️</span>
                  <span className="risk-label">Conservative</span>
                  <span className="risk-desc">Minimize risk, stable returns</span>
                </div>
              </label>

              <label className={`risk-option ${profileData.riskTolerance === 'moderate' ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="riskTolerance"
                  value="moderate"
                  checked={profileData.riskTolerance === 'moderate'}
                  onChange={handleChange}
                />
                <div className="risk-content">
                  <span className="risk-icon">⚖️</span>
                  <span className="risk-label">Moderate</span>
                  <span className="risk-desc">Balanced risk and growth</span>
                </div>
              </label>

              <label className={`risk-option ${profileData.riskTolerance === 'aggressive' ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="riskTolerance"
                  value="aggressive"
                  checked={profileData.riskTolerance === 'aggressive'}
                  onChange={handleChange}
                />
                <div className="risk-content">
                  <span className="risk-icon">🚀</span>
                  <span className="risk-label">Aggressive</span>
                  <span className="risk-desc">Higher risk, maximum growth</span>
                </div>
              </label>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="investmentGoal" className="form-label">
              Primary Investment Goal <span className="required">*</span>
            </label>
            <textarea
              id="investmentGoal"
              name="investmentGoal"
              value={profileData.investmentGoal}
              onChange={handleChange}
              className="nyse-textarea"
              rows={3}
              placeholder="e.g., Retirement planning, wealth building, saving for a house..."
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="investmentHorizon" className="form-label">
              Investment Time Horizon <span className="required">*</span>
            </label>
            <select
              id="investmentHorizon"
              name="investmentHorizon"
              value={profileData.investmentHorizon}
              onChange={handleChange}
              className="nyse-select"
              required
            >
              <option value="0-2">Short-term (0-2 years)</option>
              <option value="3-5">Medium-term (3-5 years)</option>
              <option value="5-10">Long-term (5-10 years)</option>
              <option value="10+">Very long-term (10+ years)</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="initialCapital" className="form-label">
              Initial Simulation Capital
            </label>
            <div className="input-with-prefix">
              <span className="input-prefix">$</span>
              <input
                type="number"
                id="initialCapital"
                name="initialCapital"
                value={profileData.initialCapital}
                onChange={handleChange}
                className="nyse-input with-prefix"
                min="1000"
                step="1000"
              />
            </div>
            <span className="form-hint">This is virtual money for portfolio simulation</span>
          </div>
        </section>

        {/* Success/Error Messages */}
        {success && (
          <div className="alert alert-success">
            ✓ Profile updated successfully!
          </div>
        )}

        {error && (
          <div className="alert alert-error">
            ✕ {error}
          </div>
        )}

        {/* Submit Button */}
        <div className="form-actions">
          <button
            type="submit"
            className="nyse-btn nyse-btn-primary"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </form>

      <style jsx>{`
        .nyse-profile-form-container {
          background: var(--nyse-color-background);
          border-radius: 12px;
          border: 1px solid var(--nyse-color-border);
          padding: var(--nyse-spacing-xxl);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        }

        .profile-progress {
          margin-bottom: var(--nyse-spacing-xxl);
          padding-bottom: var(--nyse-spacing-xl);
          border-bottom: 2px solid var(--nyse-color-border);
        }

        .progress-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--nyse-spacing-md);
        }

        .progress-label {
          font-weight: 600;
          color: var(--nyse-color-text);
          font-size: 1rem;
        }

        .progress-percentage {
          font-family: var(--nyse-font-serif);
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--nyse-color-primary);
        }

        .progress-bar {
          width: 100%;
          height: 12px;
          background: var(--nyse-color-background-alt);
          border-radius: 6px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--nyse-color-primary) 0%, var(--nyse-color-accent) 100%);
          transition: width 0.5s ease;
        }

        .nyse-profile-form {
          display: flex;
          flex-direction: column;
          gap: var(--nyse-spacing-xxl);
        }

        .form-section {
          display: flex;
          flex-direction: column;
          gap: var(--nyse-spacing-lg);
        }

        .section-title {
          font-family: var(--nyse-font-serif);
          font-size: 1.5rem;
          color: var(--nyse-color-primary);
          margin-bottom: var(--nyse-spacing-md);
          padding-bottom: var(--nyse-spacing-sm);
          border-bottom: 2px solid var(--nyse-color-accent);
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: var(--nyse-spacing-sm);
        }

        .form-label {
          font-weight: 600;
          color: var(--nyse-color-dark);
          font-size: 0.95rem;
        }

        .required {
          color: #d32f2f;
          margin-left: 2px;
        }

        .form-hint {
          font-size: 0.85rem;
          color: var(--nyse-color-text-light);
          font-style: italic;
        }

        .nyse-input,
        .nyse-textarea,
        .nyse-select {
          font-family: var(--nyse-font-sans);
          font-size: 1rem;
          padding: var(--nyse-spacing-md);
          border: 1px solid var(--nyse-color-border);
          border-radius: 4px;
          width: 100%;
          transition: all 0.3s ease;
        }

        .nyse-input:focus,
        .nyse-textarea:focus,
        .nyse-select:focus {
          outline: none;
          border-color: var(--nyse-color-primary);
          box-shadow: 0 0 0 3px rgba(0, 61, 122, 0.1);
        }

        .nyse-input:disabled {
          background: var(--nyse-color-background-alt);
          cursor: not-allowed;
          opacity: 0.7;
        }

        .input-with-prefix {
          position: relative;
          display: flex;
          align-items: center;
        }

        .input-prefix {
          position: absolute;
          left: var(--nyse-spacing-md);
          font-weight: 600;
          color: var(--nyse-color-text);
          pointer-events: none;
        }

        .nyse-input.with-prefix {
          padding-left: calc(var(--nyse-spacing-md) + 20px);
        }

        .risk-options {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: var(--nyse-spacing-md);
        }

        .risk-option {
          position: relative;
          cursor: pointer;
        }

        .risk-option input[type="radio"] {
          position: absolute;
          opacity: 0;
          pointer-events: none;
        }

        .risk-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: var(--nyse-spacing-lg);
          border: 2px solid var(--nyse-color-border);
          border-radius: 8px;
          background: var(--nyse-color-background);
          transition: all 0.3s ease;
        }

        .risk-option:hover .risk-content {
          border-color: var(--nyse-color-primary);
        }

        .risk-option.active .risk-content {
          border-color: var(--nyse-color-primary);
          background: linear-gradient(135deg, rgba(0, 61, 122, 0.05) 0%, rgba(0, 160, 227, 0.05) 100%);
          box-shadow: 0 4px 12px rgba(0, 61, 122, 0.15);
        }

        .risk-icon {
          font-size: 2.5rem;
          margin-bottom: var(--nyse-spacing-sm);
        }

        .risk-label {
          font-weight: 700;
          color: var(--nyse-color-dark);
          margin-bottom: var(--nyse-spacing-xs);
          font-size: 1rem;
        }

        .risk-desc {
          font-size: 0.85rem;
          color: var(--nyse-color-text-light);
        }

        .alert {
          padding: var(--nyse-spacing-md);
          border-radius: 4px;
          font-size: 0.95rem;
          font-weight: 600;
        }

        .alert-success {
          background: #e8f5e9;
          color: #2e7d32;
          border: 1px solid #66bb6a;
        }

        .alert-error {
          background: #ffebee;
          color: #c62828;
          border: 1px solid #ef5350;
        }

        .form-actions {
          display: flex;
          justify-content: flex-end;
          padding-top: var(--nyse-spacing-lg);
          border-top: 1px solid var(--nyse-color-border);
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

        .nyse-btn-primary:hover:not(:disabled) {
          background-color: var(--nyse-color-secondary);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 61, 122, 0.3);
        }

        .nyse-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        @media (max-width: 768px) {
          .nyse-profile-form-container {
            padding: var(--nyse-spacing-lg);
          }

          .risk-options {
            grid-template-columns: 1fr;
          }

          .form