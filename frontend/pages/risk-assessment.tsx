import React, { useState } from 'react';
import Head from 'next/head';
import RiskAssessmentForm from '../components/RiskAssessmentForm';
import RiskAssessmentResult from '../components/RiskAssessmentResult';

// Define interface for risk data
interface RiskData {
  riskScore: number;
  riskLevel: 'low' | 'medium' | 'high';
  recommendations: string[];
  portfolioMetrics: {
    volatility: number;
    diversification: number;
  };
}

export default function RiskAssessmentPage() {
  const [result, setResult] = useState<RiskData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <>
      <Head>
        <title>Risk Assessment Tool | BeginnerInvestorHub</title>
        <meta
          name="description"
          content="Discover your risk profile and get a personalized investment allocation."
        />
      </Head>
      <main className="min-h-screen bg-gray-50 py-12 px-4">
        {/* Technical Grid Overlay */}
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
            {/* Decorative Gears */}
            <div className="absolute top-0 left-0 w-16 h-16 opacity-10 animate-spin-slow">
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
            <div className="absolute top-10 right-10 w-20 h-20 opacity-10 animate-spin-reverse">
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

            <h1
              className="text-4xl md:text-5xl font-bold text-gray-900 mb-4"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              Risk Assessment Tool
            </h1>
            <div className="w-24 h-1 bg-blue-600 mx-auto mb-6"></div>
            <p className="text-lg text-gray-700 max-w-3xl mx-auto leading-relaxed">
              <span className="font-semibold text-blue-900">
                Assembly Instructions:
              </span>{' '}
              Answer a few questions about your background, finances, and goals.
              Get a personalized risk score and asset allocation
              recommendation—constructed with precision and delivered instantly.
            </p>
          </div>

          {/* Error Display */}
          {error && (
            <div className="nyse-card mb-8 border-l-4 border-red-600 bg-red-50">
              <div className="flex items-start">
                <svg
                  className="w-6 h-6 text-red-600 mr-3 flex-shrink-0 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div>
                  <h3 className="font-semibold text-red-900 mb-1">
                    Assessment Error
                  </h3>
                  <p className="text-red-800">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Form or Result */}
          {!result ? (
            <div className="nyse-card">
              <div className="mb-6 pb-6 border-b border-gray-200">
                <h2
                  className="text-2xl font-bold text-gray-900 mb-2"
                  style={{ fontFamily: 'Georgia, serif' }}
                >
                  🔧 Build Your Risk Profile
                </h2>
                <p className="text-gray-600">
                  Complete the component assembly below to construct your
                  personalized investment blueprint.
                </p>
              </div>
              <RiskAssessmentForm
                onSubmit={async formData => {
                  setLoading(true);
                  setError(null);
                  try {
                    const res = await fetch('/api/risk-assessment-proxy', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(formData),
                    });
                    if (!res.ok) throw new Error(await res.text());
                    const data: RiskData = await res.json();
                    setResult(data);
                  } catch (e: unknown) {
                    const errorMessage = e instanceof Error ? e.message : 'Failed to assess risk. Please verify all components and try again.';
                    setError(errorMessage);
                  } finally {
                    setLoading(false);
                  }
                }}
                loading={loading}
                error={error}
              />
            </div>
          ) : (
            <div className="nyse-card">
              <div className="mb-6 pb-6 border-b border-gray-200">
                <h2
                  className="text-2xl font-bold text-gray-900 mb-2"
                  style={{ fontFamily: 'Georgia, serif' }}
                >
                  ⚙️ Your Constructed Risk Profile
                </h2>
                <p className="text-gray-600">
                  Assembly complete. Review your personalized specifications
                  below.
                </p>
              </div>
              <RiskAssessmentResult
                result={result}
                onReset={() => {
                  setResult(null);
                  setError(null);
                }}
              />
            </div>
          )}

          {/* Assembly Instructions Footer */}
          <div className="mt-12 text-center">
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
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="text-sm text-blue-900 font-medium">
                All assessments are processed securely with enterprise-grade
                encryption
              </span>
            </div>
          </div>
        </div>

        <style>{`
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
