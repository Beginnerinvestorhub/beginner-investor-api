import React from 'react';
import Head from 'next/head';
import ESGScreener from '../components/ESGScreener';

export default function ESGScreenerPage() {
  return (
    <>
      <Head>
        <title>ESG/SRI Screener | BeginnerInvestorHub</title>
        <meta
          name="description"
          content="Screen investments for environmental, social, and governance factors."
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
          <div className="text-center mb-12 relative">
            {/* Decorative Mechanical Gears */}
            <div className="absolute -top-6 left-4 w-20 h-20 opacity-10 animate-spin-slow">
              <svg
                viewBox="0 0 100 100"
                fill="none"
                stroke="currentColor"
                className="text-green-900"
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
            <div className="absolute top-20 right-0 w-14 h-14 opacity-10 animate-spin-slower">
              <svg
                viewBox="0 0 100 100"
                fill="none"
                stroke="currentColor"
                className="text-green-800"
              >
                <circle cx="50" cy="50" r="32" strokeWidth="2" />
                <circle cx="50" cy="50" r="20" strokeWidth="2" />
                {[...Array(10)].map((_, i) => (
                  <line
                    key={i}
                    x1="50"
                    y1="18"
                    x2="50"
                    y2="28"
                    strokeWidth="2"
                    transform={`rotate(${i * 36} 50 50)`}
                  />
                ))}
              </svg>
            </div>

            <h1
              className="text-4xl md:text-5xl font-bold text-gray-900 mb-4"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              ESG/SRI Screener
            </h1>
            <div className="w-24 h-1 bg-green-600 mx-auto mb-6"></div>
            <p className="text-lg text-gray-700 max-w-3xl mx-auto leading-relaxed">
              <span className="font-semibold text-blue-900">
                Sustainable Investment Filter:
              </span>{' '}
              Screen and construct portfolios using Environmental, Social, and
              Governance criteria. Detect component integrity issues, sector
              classifications, and risk indicators with precision engineering.
            </p>
          </div>

          {/* ESG Criteria Badges */}
          <div className="mb-8 flex flex-wrap items-center justify-center gap-4">
            <div className="inline-flex items-center px-4 py-2 bg-green-50 border border-green-200 rounded-lg">
              <svg
                className="w-5 h-5 text-green-900 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="text-sm text-green-900 font-medium">
                Environmental
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
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              <span className="text-sm text-blue-900 font-medium">Social</span>
            </div>
            <div className="inline-flex items-center px-4 py-2 bg-purple-50 border border-purple-200 rounded-lg">
              <svg
                className="w-5 h-5 text-purple-900 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
              <span className="text-sm text-purple-900 font-medium">
                Governance
              </span>
            </div>
            <div className="inline-flex items-center px-4 py-2 bg-amber-50 border border-amber-200 rounded-lg">
              <svg
                className="w-5 h-5 text-amber-900 mr-2"
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
              <span className="text-sm text-amber-900 font-medium">
                Risk Detection
              </span>
            </div>
          </div>

          {/* Main Screener Card */}
          <section className="nyse-card">
            {/* Screener Header */}
            <div className="mb-8 pb-6 border-b border-gray-200">
              <div className="flex items-start justify-between flex-wrap gap-4">
                <div>
                  <h2
                    className="text-2xl font-bold text-gray-900 mb-2"
                    style={{ fontFamily: 'Georgia, serif' }}
                  >
                    🔍 Component Integrity Scanner
                  </h2>
                  <p className="text-gray-600">
                    Configure sustainability filters to screen investment
                    components and detect greenwashing mechanisms.
                  </p>
                </div>
                <div className="flex items-center space-x-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-green-900 font-medium">
                    Real-Time Screening
                  </span>
                </div>
              </div>
            </div>

            {/* ESG Screener Component */}
            <ESGScreener />
          </section>

          {/* Screening Methodology - Assembly Process */}
          <div className="mt-12 nyse-card bg-gradient-to-br from-green-50 to-white">
            <div className="mb-6">
              <h3
                className="text-xl font-bold text-gray-900 mb-2"
                style={{ fontFamily: 'Georgia, serif' }}
              >
                📐 Screening Methodology
              </h3>
              <p className="text-gray-600">
                Our multi-stage verification process ensures component
                authenticity:
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="relative pl-8">
                <div className="absolute left-0 top-0 w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  1
                </div>
                <div className="font-semibold text-gray-900 mb-1">
                  Filter Criteria
                </div>
                <p className="text-sm text-gray-600">
                  Apply ESG parameters and sector specifications to component
                  database.
                </p>
              </div>
              <div className="relative pl-8">
                <div className="absolute left-0 top-0 w-6 h-6 bg-blue-900 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  2
                </div>
                <div className="font-semibold text-gray-900 mb-1">
                  Integrity Test
                </div>
                <p className="text-sm text-gray-600">
                  Scan for red flags, greenwashing indicators, and risk
                  anomalies.
                </p>
              </div>
              <div className="relative pl-8">
                <div className="absolute left-0 top-0 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  3
                </div>
                <div className="font-semibold text-gray-900 mb-1">
                  Visualize Data
                </div>
                <p className="text-sm text-gray-600">
                  Generate technical blueprints and performance visualizations.
                </p>
              </div>
              <div className="relative pl-8">
                <div className="absolute left-0 top-0 w-6 h-6 bg-gray-700 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  4
                </div>
                <div className="font-semibold text-gray-900 mb-1">
                  Deploy Results
                </div>
                <p className="text-sm text-gray-600">
                  Export validated components for portfolio construction.
                </p>
              </div>
            </div>
          </div>

          {/* Key Features Grid */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="nyse-card hover:shadow-lg transition-shadow bg-white">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
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
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">
                    Greenwashing Detection
                  </h3>
                  <p className="text-sm text-gray-600">
                    Advanced algorithms identify misleading sustainability
                    claims and verify authentic ESG commitments.
                  </p>
                </div>
              </div>
            </div>

            <div className="nyse-card hover:shadow-lg transition-shadow bg-white">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
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
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">
                    Real-Time Scanning
                  </h3>
                  <p className="text-sm text-gray-600">
                    Continuously monitor securities against the latest ESG
                    standards and regulatory frameworks.
                  </p>
                </div>
              </div>
            </div>

            <div className="nyse-card hover:shadow-lg transition-shadow bg-white">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
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
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">
                    Sector Intelligence
                  </h3>
                  <p className="text-sm text-gray-600">
                    Cross-reference sector classifications with risk profiles
                    for comprehensive due diligence.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Technical Specifications Footer */}
          <div className="mt-12 text-center">
            <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg">
              <svg
                className="w-5 h-5 text-green-700 mr-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
              <span className="text-sm text-gray-800 font-medium">
                All ESG data verified against MSCI, Sustainalytics, and
                regulatory disclosure standards
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
