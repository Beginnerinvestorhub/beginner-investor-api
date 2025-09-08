import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { AcademicCapIcon, ScaleIcon, ChartBarIcon, GlobeAltIcon } from '@heroicons/react/24/outline';

const tools = [
  {
    name: 'Risk Assessment Tool',
    icon: <AcademicCapIcon className="w-8 h-8 text-indigo-700" />,
    description: 'Discover your risk tolerance and get a personalized investment profile.',
    href: '/risk-assessment',
  },
  {
    name: 'Fractional Share Calculator',
    icon: <ScaleIcon className="w-8 h-8 text-indigo-700" />,
    description: 'Calculate how much of a stock you can buy with any amount.',
    href: '/fractional-share-calculator',
  },
  {
    name: 'Portfolio Monitoring Dashboard',
    icon: <ChartBarIcon className="w-8 h-8 text-indigo-700" />,
    description: 'Track your portfolio performance and diversification over time.',
    href: '/dashboard',
  },
  {
    name: 'ESG/SRI Screening Tool',
    icon: <GlobeAltIcon className="w-8 h-8 text-indigo-700" />,
    description: 'Screen investments for environmental, social, and governance factors.',
    href: '/esg-screener',
  },
];

export default function ToolsOverview() {
  return (
    <>
      <Head>
        <title>Tools Overview | BeginnerInvestorHub</title>
        <meta name="description" content="Explore investment tools: risk assessment, calculators, dashboards, ESG screening." />
      </Head>

      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-16 px-6">
        <section className="max-w-5xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-indigo-800 mb-10">
            Explore Our Investment Tools
          </h1>

          <div className="grid gap-8 grid-cols-1 sm:grid-cols-2">
            {tools.map((tool) => (
              <div
                key={tool.name}
                className="bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center text-center transition hover:shadow-xl"
              >
                <div className="bg-indigo-100 p-4 rounded-full mb-4">{tool.icon}</div>
                <h2 className="text-lg font-semibold text-indigo-800">{tool.name}</h2>
                <p className="text-sm text-gray-600 mt-2 mb-4">{tool.description}</p>
                <Link href={tool.href}>
                  <button className="px-5 py-2 text-sm bg-indigo-700 text-white rounded-md font-medium hover:bg-indigo-800 transition">
                    Launch Tool
                  </button>
                </Link>
              </div>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
