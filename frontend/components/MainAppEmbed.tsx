// components/MainAppEmbed.tsx
'use client';

import React from 'react';

interface MainAppEmbedProps {
  className?: string;
}

const MainAppEmbed: React.FC<MainAppEmbedProps> = ({ className = '' }) => {
  return (
    <div className={`bg-white rounded-lg shadow-sm border p-6 ${className}`}>
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Investment Tools Hub
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
          <h3 className="font-medium text-indigo-900 mb-2">Portfolio Simulator</h3>
          <p className="text-sm text-indigo-700">
            Practice investing with virtual money in real-time market conditions.
          </p>
        </div>
        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
          <h3 className="font-medium text-green-900 mb-2">Risk Assessment</h3>
          <p className="text-sm text-green-700">
            Evaluate your risk tolerance and get personalized recommendations.
          </p>
        </div>
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-medium text-blue-900 mb-2">Market Analysis</h3>
          <p className="text-sm text-blue-700">
            Real-time market data and technical analysis tools.
          </p>
        </div>
      </div>
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-500 mb-3">
          Ready to start? Choose a tool above or explore all available tools.
        </p>
        <button className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
          Explore All Tools
        </button>
      </div>
    </div>
  );
};

export default MainAppEmbed;
