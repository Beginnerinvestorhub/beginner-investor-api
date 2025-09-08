import React, { useState } from 'react';
import Head from 'next/head';
import RiskAssessmentForm from '../components/RiskAssessmentForm';
import RiskAssessmentResult from '../components/RiskAssessmentResult';

export default function RiskAssessmentPage() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <>
      <Head>
        <title>Risk Assessment Tool | BeginnerInvestorHub</title>
        <meta name="description" content="Discover your risk profile and get a personalized investment allocation." />
      </Head>
      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4 flex flex-col items-center">
        <h1 className="text-3xl md:text-5xl font-extrabold text-indigo-800 mb-6 text-center">Risk Assessment Tool</h1>
        <p className="text-lg text-gray-700 mb-8 text-center max-w-2xl">Answer a few questions about your background, finances, and goals. Get a personalized risk score and asset allocation recommendation—instantly and securely.</p>
        {!result && (
          <RiskAssessmentForm
            onSubmit={async (formData) => {
              setLoading(true);
              setError(null);
              try {
                // TODO: Replace with your backend URL
                const res = await fetch("/api/risk-assessment-proxy", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(formData),
                });
                if (!res.ok) throw new Error(await res.text());
                const data = await res.json();
                setResult(data);
              } catch (e: any) {
                setError(e.message || 'Failed to assess risk.');
              } finally {
                setLoading(false);
              }
            }}
            loading={loading}
            error={error}
          />
        )}
        {result && (
          <RiskAssessmentResult result={result} onReset={() => setResult(null)} />
        )}
      </main>
    </>
  );
}
