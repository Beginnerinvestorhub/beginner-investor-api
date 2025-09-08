import React, { Suspense, useEffect, useState, useMemo } from 'react';
import { useApiGet } from '../hooks/useApi';

const Pie = React.lazy(() => import('react-chartjs-2').then(mod => ({ default: mod.Pie })));
const Line = React.lazy(() => import('react-chartjs-2').then(mod => ({ default: mod.Line })));

function useRegisterChartJS() {
  useEffect(() => {
    import('chart.js').then(({ Chart, LineElement, PointElement, LinearScale, CategoryScale, ArcElement, Tooltip, Legend }) => {
      Chart.register(LineElement, PointElement, LinearScale, CategoryScale, ArcElement, Tooltip, Legend);
    });
  }, []);
}


type PortfolioAsset = { name: string; value: number; allocation: number };
type PortfolioHistory = { date: string; total: number };

const PortfolioMonitor = React.memo(function PortfolioMonitor(): JSX.Element {
  useRegisterChartJS();
  const [showAsset, setShowAsset] = useState<string | null>(null);
  const [alertSensitivity, setAlertSensitivity] = useState<number>(5);

  // Use the new useApi hook for cleaner API state management
  const { data: portfolioData, loading, error } = useApiGet<{
    assets: PortfolioAsset[];
    history: PortfolioHistory[];
  }>('/api/portfolio-proxy');

  const portfolio = portfolioData?.assets || [];
  const history = portfolioData?.history || [];

  // Memoize chart data to prevent unnecessary recalculations - MUST be before early returns
  const pieData = useMemo(() => ({
    labels: portfolio.map((a) => a.name),
    datasets: [
      {
        data: portfolio.map((a) => a.allocation),
        backgroundColor: ['#6366f1', '#f59e42', '#10b981', '#f43f5e', '#a78bfa'],
      },
    ],
  }), [portfolio]);

  const lineData = useMemo(() => ({
    labels: history.map((h) => h.date),
    datasets: [
      {
        label: 'Portfolio Value',
        data: history.map((h) => h.total),
        fill: false,
        borderColor: '#6366f1',
        backgroundColor: '#6366f1',
        tension: 0.3,
      },
    ],
  }), [history]);

  // Memoize chart options to prevent unnecessary re-renders
  const pieOptions = useMemo(() => ({
    plugins: { legend: { position: 'bottom' as const } }
  }), []);

  const lineOptions = useMemo(() => ({
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true } },
  }), []);

  if (loading) {
    return <div className="text-center py-12">Loading portfolio data...</div>;
  }

  if (error) {
    return <div className="text-center text-red-600 py-12">Error: {error}</div>;
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-6 md:p-10 w-full max-w-3xl">
      <div className="mb-10">
        <h3 className="text-xl font-semibold text-indigo-800 mb-4">Portfolio Allocation</h3>
        <Suspense fallback={<div>Loading chart...</div>}>
          <Pie data={pieData} options={pieOptions} />
        </Suspense>
      </div>

      <div className="mb-10">
        <h3 className="text-xl font-semibold text-indigo-800 mb-4">Performance Over Time</h3>
        <Suspense fallback={<div>Loading chart...</div>}>
          <Line data={lineData} options={lineOptions} />
        </Suspense>
      </div>

      <div className="mb-10 flex flex-col md:flex-row gap-6">
        <div className="flex-1">
          <label className="block text-sm font-semibold mb-1">Asset Toggle</label>
          <label htmlFor="asset-select" className="block text-sm font-semibold mb-1">Asset Toggle</label>
          <select
            id="asset-select"
            className="w-full border border-gray-300 rounded-md p-2"
            value={showAsset || ''}
            onChange={(e) => setShowAsset(e.target.value || null)}
            title="Select asset"
          >
            <option value="">All</option>
            {portfolio.map((a) => (
              <option key={a.name} value={a.name}>
                {a.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1">
          <label className="block text-sm font-semibold mb-1">Alert Sensitivity</label>
          <input
            type="range"
            min="1"
            max="10"
            value={alertSensitivity}
            onChange={(e) => setAlertSensitivity(Number(e.target.value))}
            className="w-full"
            title="Alert sensitivity"
          />
          <div className="text-sm text-gray-600 mt-1">Level: {alertSensitivity}</div>
        </div>
      </div>

      <div>
        <h3 className="text-xl font-semibold text-indigo-800 mb-2">Asset Details</h3>
        {showAsset ? (
          <div className="text-indigo-700 font-bold">
            {showAsset}: $
            {portfolio.find((a) => a.name === showAsset)?.value?.toLocaleString() || 'N/A'}
          </div>
        ) : (
          <div className="text-gray-700">Select an asset to view details.</div>
        )}
      </div>
    </div>
  );
});

export default PortfolioMonitor;
