import React from 'react';
import Head from 'next/head';
import FractionalShareCalculator from '../components/FractionalShareCalculator';

export default function FractionalShareCalculatorPage() {
  return (
    <>
      <Head>
        <title>Fractional Share Calculator | BeginnerInvestorHub</title>
        <meta
          name="description"
          content="Calculate how much of a stock you can buy with any amount."
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
            <div className="absolute -top-6 left-8 w-16 h-16 opacity-10 animate-spin-slow">
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
            <div className="absolute top-0 right-12 w-20 h-20 opacity-10 animate-spin-reverse">
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
            <div className="absolute top-16 right-2 w-12 h-12 opacity-10 animate-spin-slower">
              <svg
                viewBox="0 0 100 100"
                fill="none"
                stroke="currentColor"
                className="text-blue-900"
              >
                <circle cx="50" cy="50" r="30" strokeWidth="2" />
                <circle cx="50" cy="50" r="18" strokeWidth="2" />
                {[...Array(10)].map((_, i) => (
                  <line
                    key={i}
                    x1="50"
                    y1="20"
                    x2="50"
                    y2="30"
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
              Fractional Share Calculator
            </h1>
            <div className="w-24 h-1 bg-blue-600 mx-auto mb-6"></div>
            <p className="text-lg text-gray-700 max-w-3xl mx-auto leading-relaxed">
              <span className="font-semibold text-blue-900">
                Precision Engineering Tool:
              </span>{' '}
              Enter an investment amount and stock price to construct your
              fractional share assembly. Compare component costs across brokers
              and visualize your calculated purchase blueprint.
            </p>
          </div>

          {/* Calculator Feature Badges */}
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
                  d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
              <span className="text-sm text-blue-900 font-medium">
                Precision Calculator
              </span>
            </div>
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
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="text-sm text-green-900 font-medium">
                Broker Comparison
              </span>
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
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
              <span className="text-sm text-purple-900 font-medium">
                Visual Analytics
              </span>
            </div>
          </div>

          {/* Main Calculator Card */}
          <section className="nyse-card">
            {/* Calculator Header */}
            <div className="mb-8 pb-6 border-b border-gray-200">
              <h2
                className="text-2xl font-bold text-gray-900 mb-2"
                style={{ fontFamily: 'Georgia, serif' }}
              >
                🔧 Component Calculation Engine
              </h2>
              <p className="text-gray-600">
                Configure your investment parameters below to construct your
                fractional share specifications.
              </p>
            </div>

            {/* Calculator Component */}
            <FractionalShareCalculator />
          </section>

          {/* How It Works - Assembly Instructions */}
          <div className="mt-12 nyse-card bg-gradient-to-br from-blue-50 to-white">
            <div className="mb-6">
              <h3
                className="text-xl font-bold text-gray-900 mb-2"
                style={{ fontFamily: 'Georgia, serif' }}
              >
                📐 Assembly Instructions
              </h3>
              <p className="text-gray-600">
                Follow these steps to construct your fractional share
                calculation:
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="relative pl-8">
                <div className="absolute left-0 top-0 w-6 h-6 bg-blue-900 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  1
                </div>
                <div className="font-semibold text-gray-900 mb-1">
                  Input Specifications
                </div>
                <p className="text-sm text-gray-600">
                  Enter your investment amount and target stock price into the
                  calculation engine.
                </p>
              </div>
              <div className="relative pl-8">
                <div className="absolute left-0 top-0 w-6 h-6 bg-blue-900 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  2
                </div>
                <div className="font-semibold text-gray-900 mb-1">
                  Process Components
                </div>
                <p className="text-sm text-gray-600">
                  System calculates precise fractional shares and compares
                  broker fee structures.
                </p>
              </div>
              <div className="relative pl-8">
                <div className="absolute left-0 top-0 w-6 h-6 bg-blue-900 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  3
                </div>
                <div className="font-semibold text-gray-900 mb-1">
                  Deploy Results
                </div>
                <p className="text-sm text-gray-600">
                  Review visual blueprints and detailed cost analysis for
                  informed decision-making.
                </p>
              </div>
            </div>
          </div>

          {/* Technical Specifications Footer */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
              <div
                className="text-3xl font-bold text-blue-900 mb-1"
                style={{ fontFamily: 'Georgia, serif' }}
              >
                ∞
              </div>
              <div className="text-sm font-semibold text-gray-900 mb-1">
                Unlimited Precision
              </div>
              <div className="text-xs text-gray-600">
                Calculate any fractional amount
              </div>
            </div>
            <div className="p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
              <div
                className="text-3xl font-bold text-blue-900 mb-1"
                style={{ fontFamily: 'Georgia, serif' }}
              >
                💰
              </div>
              <div className="text-sm font-semibold text-gray-900 mb-1">
                Cost Optimization
              </div>
              <div className="text-xs text-gray-600">
                Compare broker fee structures
              </div>
            </div>
            <div className="p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
              <div
                className="text-3xl font-bold text-blue-900 mb-1"
                style={{ fontFamily: 'Georgia, serif' }}
              >
                📊
              </div>
              <div className="text-sm font-semibold text-gray-900 mb-1">
                Visual Blueprints
              </div>
              <div className="text-xs text-gray-600">
                Interactive data visualization
              </div>
            </div>
          </div>
        </div>

        <style jsx>{css}</style>{`
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
