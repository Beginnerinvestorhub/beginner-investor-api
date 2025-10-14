import React, { useState, Suspense, useEffect } from 'react';

const Pie = React.lazy(() =>
  import('react-chartjs-2').then(mod => ({ default: mod.Pie }))
);
const Bar = React.lazy(() =>
  import('react-chartjs-2').then(mod => ({ default: mod.Bar }))
);

function useRegisterChartJS() {
  useEffect(() => {
    import('chart.js').then(
      ({
        Chart,
        ArcElement,
        Tooltip,
        Legend,
        BarElement,
        CategoryScale,
        LinearScale,
      }) => {
        Chart.register(
          ArcElement,
          Tooltip,
          Legend,
          BarElement,
          CategoryScale,
          LinearScale
        );
      }
    );
  }, []);
}

const brokers = [
  { name: 'Broker A', fee: 0 },
  { name: 'Broker B', fee: 1.99 },
  { name: 'Broker C', fee: 4.95 },
];

/**
 * FractionalShareCalculator is a component that allows users to calculate the number of fractional shares
 * they can buy from various brokers based on an investment amount and stock price. It provides a form for
 * inputting the investment amount and stock symbol, fetches the stock price, and displays the results in
 * both a pie chart showing fractional shares by broker and a bar chart comparing broker fees. Users can
 * select a broker to see the specific number of shares they can purchase with the investment amount minus
 * the broker's fee.
 */
export default function FractionalShareCalculator() {
  useRegisterChartJS();
  const [amount, setAmount] = useState<string>('');
  const [symbol, setSymbol] = useState<string>('');
  const [price, setPrice] = useState<string>('');
  const [selectedBroker, setSelectedBroker] = useState<string>(brokers[0].name);
  const [loadingPrice, setLoadingPrice] = useState<boolean>(false);
  const [priceError, setPriceError] = useState<string | null>(null);

  const fetchPrice = async (sym: string) => {
    setLoadingPrice(true);
    setPriceError(null);
    setPrice('');
    try {
      const res = await fetch(
        `/api/price-proxy?symbol=${encodeURIComponent(sym)}`
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch price');
      setPrice(data.price.toString());
    } catch (err: any) {
      setPriceError(err.message);
    } finally {
      setLoadingPrice(false);
    }
  };

  const calcShares = (amt: number, p: number, fee: number) =>
    amt - fee > 0 && p > 0 ? (amt - fee) / p : 0;

  const shares = brokers.map(b =>
    calcShares(Number(amount), Number(price), b.fee)
  );

  const pieData = {
    labels: brokers.map(b => b.name),
    datasets: [
      {
        data: shares,
        backgroundColor: ['#6366f1', '#10b981', '#f59e42'],
      },
    ],
  };

  const barData = {
    labels: brokers.map(b => b.name),
    datasets: [
      {
        label: 'Broker Fee ($)',
        data: brokers.map(b => b.fee),
        backgroundColor: '#6366f1',
      },
    ],
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-8 w-full max-w-lg">
      <form className="space-y-4 mb-8">
        <input
          type="number"
          min="0"
          step="0.01"
          className="input"
          placeholder="Investment Amount (USD)"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          required
        />
        <div className="flex gap-2">
          <input
            type="text"
            className="input flex-1"
            placeholder="Stock Symbol (e.g. AAPL)"
            value={symbol}
            onChange={e => setSymbol(e.target.value.toUpperCase())}
            onBlur={() => symbol && fetchPrice(symbol)}
          />
          <button
            type="button"
            className="btn btn-primary"
            disabled={!symbol || loadingPrice}
            onClick={() => symbol && fetchPrice(symbol)}
          >
            {loadingPrice ? '...' : 'Get Price'}
          </button>
        </div>
        <input
          type="number"
          min="0"
          step="0.01"
          className="input"
          placeholder="Stock Price (USD)"
          value={price}
          onChange={e => setPrice(e.target.value)}
          required
        />
        {priceError && <div className="text-red-500 text-sm">{priceError}</div>}
        <select
          className="input"
          value={selectedBroker}
          onChange={e => setSelectedBroker(e.target.value)}
        >
          {brokers.map(b => (
            <option key={b.name} value={b.name}>
              {b.name}
            </option>
          ))}
        </select>
      </form>
      <div className="mb-6">
        <h3 className="font-semibold mb-2">Fractional Shares by Broker</h3>
        <Suspense fallback={<div>Loading chart...</div>}>
          <Pie
            data={pieData}
            options={{ plugins: { legend: { position: 'bottom' } } }}
          />
        </Suspense>
      </div>
      <div className="mb-6">
        <h3 className="font-semibold mb-2">Broker Fee Comparison</h3>
        <Suspense fallback={<div>Loading chart...</div>}>
          <Bar
            data={barData}
            options={{ plugins: { legend: { display: false } } }}
          />
        </Suspense>
      </div>
      <div className="text-center mt-4">
        <span className="text-lg font-bold text-indigo-700">
          {selectedBroker}:{' '}
          {calcShares(
            Number(amount),
            Number(price),
            brokers.find(b => b.name === selectedBroker)?.fee ?? 0
          ).toFixed(4)}{' '}
          shares
        </span>
      </div>
    </div>
  );
}
