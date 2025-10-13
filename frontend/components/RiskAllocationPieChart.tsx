import React, { Suspense, useEffect } from 'react';

const Pie = React.lazy(() =>
  import('react-chartjs-2').then(mod => ({ default: mod.Pie }))
);

export function useRegisterChartJS() {
  useEffect(() => {
    import('chart.js').then(({ Chart, ArcElement, Tooltip, Legend }) => {
      Chart.register(ArcElement, Tooltip, Legend);
    });
  }, []);
}

interface RiskAllocationPieChartProps {
  allocation: Record<string, number>;
}

export default function RiskAllocationPieChart({
  allocation,
}: RiskAllocationPieChartProps) {
  useRegisterChartJS();
  const data = {
    labels: Object.keys(allocation),
    datasets: [
      {
        data: Object.values(allocation),
        backgroundColor: [
          '#6366f1', // indigo-600
          '#f59e42', // orange-400
          '#10b981', // emerald-500
          '#f43f5e', // rose-500
          '#3b82f6', // blue-500
          '#a78bfa', // purple-400
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="mb-6">
      <Suspense fallback={<div>Loading chart...</div>}>
        <Pie
          data={data}
          options={{ plugins: { legend: { position: 'bottom' } } }}
        />
      </Suspense>
    </div>
  );
}
