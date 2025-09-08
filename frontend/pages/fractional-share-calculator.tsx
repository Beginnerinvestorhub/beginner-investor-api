import React from 'react';
import Head from 'next/head';
import FractionalShareCalculator from '../components/FractionalShareCalculator';

export default function FractionalShareCalculatorPage() {
  return (
    <>
      <Head>
        <title>Fractional Share Calculator | BeginnerInvestorHub</title>
        <meta name="description" content="Calculate how much of a stock you can buy with any amount." />
      </Head>
      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4 flex flex-col items-center">
        <h1 className="text-3xl md:text-5xl font-extrabold text-indigo-800 mb-6 text-center">Fractional Share Calculator</h1>
        <p className="text-lg text-gray-700 mb-8 text-center max-w-2xl">Enter an investment amount and stock price to see how many fractional shares you can buy. Compare costs across brokers and visualize your purchase.</p>
        <FractionalShareCalculator />
      </main>
    </>
  );
}
