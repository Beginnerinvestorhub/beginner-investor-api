import React from 'react';
import Head from 'next/head';
import PortfolioMonitor from '../components/PortfolioMonitor';

export default function PortfolioMonitorPage() {
  return (
    <>
      <Head>
        <title>Portfolio Monitoring Dashboard | BeginnerInvestorHub</title>
        <meta
          name="description"
          content="Track your portfolio performance and diversification over time."
        />
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
          <header className="text-center mb-12 relative">
            {/* Decorative Mechanical Gears */}
            <div className="absolute -top-8 left-0 w-20 h-20 opacity-10 animate-spin-slow">
              <svg
                viewBox="0 0 100 100"
                fill="none"
                stroke="currentColor"
                className="text-blue-900"
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
            <div className="absolute -top-4 right-4 w-16 h-16 opacity-10 animate-spin-reverse">
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
            <div className="absolute top-20 right-16 w-12 h-12 opacity-10 animate-spin-slower">
              <svg
                viewBox="0 0 100 100"
                fill="none"
                stroke="currentColor"
                className="text-blue-900"
              >
                <circle cx="50" cy="50" r="30" strokeWidth="2" />
                <circle cx="50" cy="50" r="18" strokeWidth="2" />
                {[...Array(12)].map((_, i) => (
                  <line
                    key={i}
                    x1="50"
                    y1="20"
                    x2="50"
                    y2="30"
                    strokeWidth="2"
                    transform={`rotate(${i * 30} 50 50)`}
                  />
                ))}
              </svg>
            </div>

            <h1
              className="text-4xl md:text-5xl font-bold text-gray-900 mb-4"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              Portfolio Monitoring Dashboard
            </h1>
            <div className="w-24 h-1 bg-blue-600 mx-auto mb-6"></div>
            <p className="text-lg md:text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
              <span className="font-semibold text-blue-900">
                Real-Time Assembly Monitor:
              </span>{' '}
              Visualize your portfolio allocation, performance metrics, and
              component details. Deploy alerts and track your investment
              architecture in real time.
            </p>
          </header>

          {/* Dashboard Status Bar */}
          <div className="mb-8 flex flex-wrap items-center justify-center gap-4">
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
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="text-sm text-blue-900 font-medium">
                System Operational
              </span>
            </div>
            <div className="inline-flex items-center px-4 py-2 bg-green-50 border border-green-200 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
              <span className="text-sm text-green-900 font-medium">
                Live Data Stream
              </span>
            </div>
            <div className="inline-flex items-center px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg">
              <svg
                className="w-5 h-5 text-gray-700 mr-2"
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
              <span className="text-sm text-gray-700 font-medium">
                Secure Connection
              </span>
            </div>
          </div>

          {/* Main Dashboard Card */}
          <section className="nyse-card">
            {/* Dashboard Header */}
            <div className="mb-8 pb-6 border-b border-gray-200">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h2
                    className="text-2xl font-bold text-gray-900 mb-2"
                    style={{ fontFamily: 'Georgia, serif' }}
                  >
                    ⚙️ Component Assembly Status
                  </h2>
                  <p className="text-gray-600">
                    Monitor all portfolio components and performance metrics in
                    your investment mechanism.
                  </p>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>Updated in real-time</span>
                </div>
              </div>
            </div>

            {/* Portfolio Monitor Component */}
            <PortfolioMonitor />
          </section>

          {/* Technical Specifications Footer */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="p-4 bg-white border border-gray-200 rounded-lg">
              <div
                className="text-3xl font-bold text-blue-900 mb-1"
                style={{ fontFamily: 'Georgia, serif' }}
              >
                📊
              </div>
              <div className="text-sm font-semibold text-gray-900 mb-1">
                Real-Time Analytics
              </div>
              <div className="text-xs text-gray-600">
                Performance tracking engine
              </div>
            </div>
            <div className="p-4 bg-white border border-gray-200 rounded-lg">
              <div
                className="text-3xl font-bold text-blue-900 mb-1"
                style={{ fontFamily: 'Georgia, serif' }}
              >
                🔔
              </div>
              <div className="text-sm font-semibold text-gray-900 mb-1">
                Alert Mechanisms
              </div>
              <div className="text-xs text-gray-600">
                Automated notification system
              </div>
            </div>
            <div className="p-4 bg-white border border-gray-200 rounded-lg">
              <div
                className="text-3xl font-bold text-blue-900 mb-1"
                style={{ fontFamily: 'Georgia, serif' }}
              >
                🔧
              </div>
              <div className="text-sm font-semibold text-gray-900 mb-1">
                Precision Engineering
              </div>
              <div className="text-xs text-gray-600">
                Enterprise-grade accuracy
              </div>
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
          @keyframes spin-slower {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }
          .animate-spin-slow {
            animation: spin-slow 20s linear infinite;
          }
          .animate-spin-reverse {
            animation: spin-reverse 15s linear infinite;
          }
          .animate-spin-slower {
            animation: spin-slower 30s linear infinite;
          }
        `}</style>
      </main>
    </>
  );
}
