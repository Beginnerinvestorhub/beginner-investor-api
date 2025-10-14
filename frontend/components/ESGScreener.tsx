import React, { useState, useEffect, Suspense } from 'react';

const Bubble = React.lazy(() =>
  import('react-chartjs-2').then(mod => ({ default: mod.Bubble }))
);

function useRegisterChartJS() {
  useEffect(() => {
    import('chart.js').then(
      ({
        Chart,
        BubbleController,
        PointElement,
        LinearScale,
        Tooltip,
        Legend,
      }) => {
        Chart.register(
          BubbleController,
          PointElement,
          LinearScale,
          Tooltip,
          Legend
        );
      }
    );
  }, []);
}

type ESGData = {
  name: string;
  sector: string;
  esg: number;
  flagged: boolean;
  marketCap: number;
};

export default function ESGScreener() {
  useRegisterChartJS();
  const [data, setData] = useState<ESGData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [sector, setSector] = useState<string>('');
  const [threshold, setThreshold] = useState<number>(0);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch('/api/esg-proxy')
      .then(async res => {
        if (!res.ok)
          throw new Error(
            (await res.json()).error || 'Failed to fetch ESG data'
          );
        return res.json();
      })
      .then(apiData => setData(apiData.stocks || []))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const sectors = Array.from(new Set(data.map(d => d.sector)));

  const filtered = data.filter(
    d => (sector === '' || d.sector === sector) && d.esg >= threshold
  );

  const bubbleData = {
    datasets: filtered.map(d => ({
      label: d.name,
      data: [{ x: d.marketCap, y: d.esg, r: 10 }],
      backgroundColor: d.flagged ? '#f43f5e' : '#10b981',
      borderColor: '#6366f1',
      borderWidth: 1,
    })),
  };

  if (loading) {
    return <div className="text-center py-12">Loading ESG data...</div>;
  }
  if (error) {
    return <div className="text-center text-red-600 py-12">Error: {error}</div>;
  }
  return (
    <div className="bg-white rounded-xl shadow-md p-8 w-full max-w-2xl">
      <form className="flex flex-wrap gap-4 mb-8 items-end">
        <div>
          <label className="block text-sm font-semibold mb-1">Sector</label>
          <select
            className="input"
            value={sector}
            onChange={e => setSector(e.target.value)}
          >
            <option value="">All</option>
            {sectors.map(s => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">
            ESG Score ≥
          </label>
          <input
            type="number"
            min="0"
            max="100"
            className="input"
            value={threshold}
            onChange={e => setThreshold(Number(e.target.value))}
          />
        </div>
      </form>
      <div className="mb-6">
        <h3 className="font-semibold mb-2">ESG Score Bubble Chart</h3>
        <Suspense fallback={<div>Loading chart...</div>}>
          <Bubble
            data={bubbleData}
            options={{
              plugins: {
                legend: { display: false },
                tooltip: {
                  callbacks: {
                    label: ctx => {
                      const raw = ctx.raw as {
                        x: number;
                        y: number;
                        r: number;
                      };
                      return `${ctx.dataset.label}: ESG ${raw.y}`;
                    },
                  },
                },
              },
              scales: {
                x: { title: { display: true, text: 'Market Cap ($B)' } },
                y: {
                  title: { display: true, text: 'ESG Score' },
                  min: 0,
                  max: 100,
                },
              },
            }}
          />
        </Suspense>
      </div>
      <div>
        <h3 className="font-semibold mb-2">Red Flags</h3>
        <ul className="space-y-1">
          {filtered.filter(d => d.flagged).length === 0 ? (
            <li className="text-green-600">
              No red flags detected in current filter.
            </li>
          ) : (
            filtered
              .filter(d => d.flagged)
              .map(d => (
                <li key={d.name} className="text-red-500 font-semibold">
                  {d.name} ({d.sector}) - Possible greenwashing or ESG concern
                </li>
              ))
          )}
        </ul>
      </div>
    </div>
  );
}
