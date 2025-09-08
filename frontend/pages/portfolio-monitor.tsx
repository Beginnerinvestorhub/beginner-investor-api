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

      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 flex flex-col items-center w-full max-w-6xl mx-auto">
        <header className="mb-10 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-indigo-800 mb-4">
            Portfolio Monitoring Dashboard
          </h1>
          <p className="text-lg md:text-xl text-gray-700 max-w-2xl mx-auto">
            Visualize your portfolio allocation, performance, and asset details. Set alerts and monitor your investments in real time.
          </p>
        </header>

        <section className="w-full bg-white rounded-xl shadow-lg p-6 md:p-10">
          <PortfolioMonitor />
        </section>
      </main>
    </>
  );
}
