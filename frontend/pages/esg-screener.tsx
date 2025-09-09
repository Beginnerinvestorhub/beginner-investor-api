import React from 'react';
import Head from 'next/head';
import ESGScreener from '../components/ESGScreener';

export default function ESGScreenerPage() {
  return (
    <>
      <Head>
        <title>ESG/SRI Screener | BeginnerInvestorHub</title>
        <meta name="description" content="Screen investments for environmental, social, and governance factors." />
      </Head>
      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4 flex flex-col items-center">
        <h1 className="text-3xl md:text-5xl font-extrabold text-indigo-800 mb-6 text-center">ESG/SRI Screener</h1>
        <p className="text-lg text-gray-700 mb-8 text-center max-w-2xl">Filter and visualize securities by ESG criteria, sector, and risk. See red flags and greenwashing indicators at a glance.</p>
        <ESGScreener />
      </main>
    </>
  );
}
