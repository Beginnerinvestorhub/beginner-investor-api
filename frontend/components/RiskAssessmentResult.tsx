import React from 'react';
import RiskAllocationPieChart from './RiskAllocationPieChart';

interface RiskAssessmentResultProps {
  result: {
    risk_score: number;
    risk_label: string;
    recommended_allocation: Record<string, number>;
  };
  onReset: () => void;
}

export default function RiskAssessmentResult({
  result,
  onReset,
}: RiskAssessmentResultProps) {
  return (
    <div className="bg-white rounded-xl shadow-md p-8 w-full max-w-lg text-center">
      <h2 className="text-2xl font-bold text-indigo-700 mb-4">
        Your Risk Assessment
      </h2>
      <div className="mb-4">
        <div className="text-lg font-semibold">
          Risk Score:{' '}
          <span className="text-indigo-800">
            {result.risk_score.toFixed(2)}
          </span>
        </div>
        <div className="text-lg font-semibold">
          Profile: <span className="text-indigo-800">{result.risk_label}</span>
        </div>
      </div>
      <div className="mb-6">
        <h3 className="font-semibold mb-2">Recommended Allocation</h3>
        <RiskAllocationPieChart allocation={result.recommended_allocation} />
        <ul className="space-y-1">
          {Object.entries(result.recommended_allocation).map(
            ([asset, percent]) => (
              <li key={asset} className="text-gray-700">
                {asset}: <span className="font-bold">{percent}%</span>
              </li>
            )
          )}
        </ul>
      </div>
      <button
        onClick={onReset}
        className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
      >
        Start Over
      </button>
    </div>
  );
}
