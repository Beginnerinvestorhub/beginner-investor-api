import Head from 'next/head';
import { useAuth } from '../hooks/useAuth';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function AdminPage() {
  const { user, loading, role } = useAuth();
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [adminData, setAdminData] = useState({
    totalUsers: 0,
    activePortfolios: 0,
    simulationsToday: 0,
    systemHealth: 'healthy',
  });

  useEffect(() => {
    if (!loading && !user) {
      setIsRedirecting(true);
      router.replace('/login');
    } else if (user && role !== 'admin') {
      // Check if user is admin, redirect if not
      setIsRedirecting(true);
      router.replace('/dashboard');
    }
  }, [user, loading, role, router]);

  useEffect(() => {
    // Fetch admin dashboard data
    const fetchAdminData = async () => {
      try {
        const response = await fetch('/api/admin/dashboard');
        const data = await response.json();
        setAdminData(data);
      } catch (error) {
        console.error('Error fetching admin data:', error);
      }
    };

    if (user && role === 'admin') {
      fetchAdminData();
    }
  }, [user, role]);

  // Loading state
  if (loading || isRedirecting) {
    return (
      <>
        <Head>
          <title>Loading | Admin Dashboard</title>
          <meta name="robots" content="noindex, nofollow" />
        </Head>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            {/* Mechanical Loading Gears */}
            <div className="relative w-24 h-24 mx-auto mb-6">
              <div className="absolute inset-0 animate-spin-slow">
                <svg
                  viewBox="0 0 100 100"
                  fill="none"
                  stroke="currentColor"
                  className="text-blue-900 w-full h-full"
                >
                  <circle cx="50" cy="50" r="40" strokeWidth="2" />
                  <circle cx="50" cy="50" r="25" strokeWidth="2" />
                  {[...Array(8)].map((_, i) => (
                    <line
                      key={i}
                      x1="50"
                      y1="10"
                      x2="50"
                      y2="25"
                      strokeWidth="3"
                      transform={`rotate(${i * 45} 50 50)`}
                    />
                  ))}
                </svg>
              </div>
              <div className="absolute inset-0 animate-spin-reverse opacity-60">
                <svg
                  viewBox="0 0 100 100"
                  fill="none"
                  stroke="currentColor"
                  className="text-blue-600 w-full h-full"
                >
                  <circle cx="50" cy="50" r="30" strokeWidth="2" />
                  <circle cx="50" cy="50" r="18" strokeWidth="2" />
                  {[...Array(6)].map((_, i) => (
                    <line
                      key={i}
                      x1="50"
                      y1="20"
                      x2="50"
                      y2="30"
                      strokeWidth="2"
                      transform={`rotate(${i * 60} 50 50)`}
                    />
                  ))}
                </svg>
              </div>
            </div>
            <p className="text-lg font-semibold text-gray-900 mb-2">
              Initializing System
            </p>
            <p className="text-sm text-gray-600">Loading admin dashboard...</p>
          </div>
        </div>
        <style jsx>{`
          @keyframes spin-slow {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }
          @keyframes spin-reverse {
            from {
              transform: rotate(360deg);
            }
            to {
              transform: rotate(0deg);
            }
          }
          .animate-spin-slow {
            animation: spin-slow 3s linear infinite;
          }
          .animate-spin-reverse {
            animation: spin-reverse 2s linear infinite;
          }
        `}</style>
      </>
    );
  }

  // Only render admin content if user is authenticated and is admin
  if (role !== 'admin') {
    return null;
  }

  return (
    <>
      <Head>
        <title>System Control Panel | Admin Dashboard</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <main className="min-h-screen bg-gray-50 py-12 px-4">
        {/* Technical Grid Overlay - Blueprint Pattern */}
        <div
          className="fixed inset-0 pointer-events-none opacity-5"
          style={{
            backgroundImage:
              'linear-gradient(rgba(0, 61, 122, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 61, 122, 0.3) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        ></div>

        <div className="nyse-container relative z-10">
          {/* Hero Section with Mechanical Elements */}
          <div className="text-center mb-12 relative">
            {/* Decorative Mechanical Gears */}
            <div className="absolute -top-6 left-0 w-20 h-20 opacity-10 animate-spin-slow">
              <svg
                viewBox="0 0 100 100"
                fill="none"
                stroke="currentColor"
                className="text-red-900"
              >
                <circle cx="50" cy="50" r="40" strokeWidth="2" />
                <circle cx="50" cy="50" r="25" strokeWidth="2" />
                {[...Array(8)].map((_, i) => (
                  <line
                    key={i}
                    x1="50"
                    y1="10"
                    x2="50"
                    y2="25"
                    strokeWidth="3"
                    transform={`rotate(${i * 45} 50 50)`}
                  />
                ))}
              </svg>
            </div>
            <div className="absolute top-2 right-8 w-16 h-16 opacity-10 animate-spin-reverse">
              <svg
                viewBox="0 0 100 100"
                fill="none"
                stroke="currentColor"
                className="text-blue-900"
              >
                <circle cx="50" cy="50" r="35" strokeWidth="2" />
                <circle cx="50" cy="50" r="20" strokeWidth="2" />
                {[...Array(6)].map((_, i) => (
                  <line
                    key={i}
                    x1="50"
                    y1="15"
                    x2="50"
                    y2="28"
                    strokeWidth="3"
                    transform={`rotate(${i * 60} 50 50)`}
                  />
                ))}
              </svg>
            </div>

            <div className="inline-flex items-center px-4 py-2 bg-red-50 border border-red-200 rounded-lg mb-4">
              <svg
                className="w-5 h-5 text-red-700 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
              <span className="text-sm text-red-900 font-medium">
                Restricted Access - Admin Only
              </span>
            </div>

            <h1
              className="text-4xl md:text-5xl font-bold text-gray-900 mb-4"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              System Control Panel
            </h1>
            <div className="w-24 h-1 bg-red-600 mx-auto mb-6"></div>
            <p className="text-lg text-gray-700 max-w-3xl mx-auto leading-relaxed">
              <span className="font-semibold text-blue-900">
                Master Engineering Console:
              </span>{' '}
              Monitor all system components, user assemblies, and operational
              metrics. Deploy administrative controls with precision authority.
            </p>
          </div>

          {/* System Status Bar */}
          <div className="mb-8 flex flex-wrap items-center justify-center gap-4">
            <div
              className={`inline-flex items-center px-4 py-2 rounded-lg border ${
                adminData.systemHealth === 'healthy'
                  ? 'bg-green-50 border-green-200'
                  : 'bg-red-50 border-red-200'
              }`}
            >
              <div
                className={`w-2 h-2 rounded-full mr-2 animate-pulse ${
                  adminData.systemHealth === 'healthy'
                    ? 'bg-green-500'
                    : 'bg-red-500'
                }`}
              ></div>
              <span
                className={`text-sm font-medium ${
                  adminData.systemHealth === 'healthy'
                    ? 'text-green-900'
                    : 'text-red-900'
                }`}
              >
                System{' '}
                {adminData.systemHealth === 'healthy' ? 'Operational' : 'Alert'}
              </span>
            </div>
            <div className="inline-flex items-center px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
              <svg
                className="w-5 h-5 text-blue-900 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              <span className="text-sm text-blue-900 font-medium">
                Admin: {user?.email || 'Administrator'}
              </span>
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="nyse-card bg-white hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-blue-700"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                </div>
                <div className="text-right">
                  <div
                    className="text-3xl font-bold text-gray-900"
                    style={{ fontFamily: 'Georgia, serif' }}
                  >
                    {adminData.totalUsers.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">Total Users</div>
                </div>
              </div>
              <div className="text-xs text-gray-500 flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Registered components
              </div>
            </div>

            <div className="nyse-card bg-white hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-purple-700"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                    />
                  </svg>
                </div>
                <div className="text-right">
                  <div
                    className="text-3xl font-bold text-gray-900"
                    style={{ fontFamily: 'Georgia, serif' }}
                  >
                    {adminData.activePortfolios.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">Active Portfolios</div>
                </div>
              </div>
              <div className="text-xs text-gray-500 flex items-center">
                <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                Portfolio assemblies
              </div>
            </div>

            <div className="nyse-card bg-white hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-green-700"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
                <div className="text-right">
                  <div
                    className="text-3xl font-bold text-gray-900"
                    style={{ fontFamily: 'Georgia, serif' }}
                  >
                    {adminData.simulationsToday.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">Simulations Today</div>
                </div>
              </div>
              <div className="text-xs text-gray-500 flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Tests executed (24h)
              </div>
            </div>
          </div>

          {/* Administrative Controls */}
          <div className="nyse-card">
            <div className="mb-8 pb-6 border-b border-gray-200">
              <h2
                className="text-2xl font-bold text-gray-900 mb-2"
                style={{ fontFamily: 'Georgia, serif' }}
              >
                ⚙️ Administrative Controls
              </h2>
              <p className="text-gray-600">
                Access system management tools and configuration panels.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <button className="nyse-btn nyse-btn-secondary text-left p-6 flex items-start space-x-4 h-auto">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-blue-700"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                </div>
                <div>
                  <div className="font-bold text-gray-900 mb-1">
                    User Management
                  </div>
                  <p className="text-sm text-gray-600">
                    Manage user accounts and permissions
                  </p>
                </div>
              </button>

              <button className="nyse-btn nyse-btn-secondary text-left p-6 flex items-start space-x-4 h-auto">
                <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-green-700"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
                <div>
                  <div className="font-bold text-gray-900 mb-1">
                    System Analytics
                  </div>
                  <p className="text-sm text-gray-600">
                    View detailed usage statistics
                  </p>
                </div>
              </button>

              <button className="nyse-btn nyse-btn-secondary text-left p-6 flex items-start space-x-4 h-auto">
                <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-purple-700"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>
                <div>
                  <div className="font-bold text-gray-900 mb-1">
                    System Configuration
                  </div>
                  <p className="text-sm text-gray-600">
                    Adjust system settings and parameters
                  </p>
                </div>
              </button>

              <button className="nyse-btn nyse-btn-secondary text-left p-6 flex items-start space-x-4 h-auto">
                <div className="flex-shrink-0 w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-amber-700"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
                <div>
                  <div className="font-bold text-gray-900 mb-1">
                    Security Logs
                  </div>
                  <p className="text-sm text-gray-600">
                    Review system security events
                  </p>
                </div>
              </button>

              <button className="nyse-btn nyse-btn-secondary text-left p-6 flex items-start space-x-4 h-auto">
                <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-red-700"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"
                    />
                  </svg>
                </div>
                <div>
                  <div className="font-bold text-gray-900 mb-1">
                    Database Management
                  </div>
                  <p className="text-sm text-gray-600">
                    Backup and maintenance operations
                  </p>
                </div>
              </button>

              <button className="nyse-btn nyse-btn-secondary text-left p-6 flex items-start space-x-4 h-auto">
                <div className="flex-shrink-0 w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-indigo-700"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <div>
                  <div className="font-bold text-gray-900 mb-1">
                    System Reports
                  </div>
                  <p className="text-sm text-gray-600">
                    Generate and export system reports
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Security Notice */}
          <div className="mt-12 text-center">
            <div className="inline-flex items-center px-6 py-3 bg-red-50 border border-red-200 rounded-lg">
              <svg
                className="w-5 h-5 text-red-700 mr-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
              <span className="text-sm text-red-900 font-medium">
                All administrative actions are logged and monitored for security
                compliance
              </span>
            </div>
          </div>
        </div>

        <style jsx>{`
          @keyframes spin-slow {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }
          @keyframes spin-reverse {
            from {
              transform: rotate(360deg);
            }
            to {
              transform: rotate(0deg);
            }
          }
          .animate-spin-slow {
            animation: spin-slow 20s linear infinite;
          }
          .animate-spin-reverse {
            animation: spin-reverse 15s linear infinite;
          }
        `}</style>
      </main>
    </>
  );
}
