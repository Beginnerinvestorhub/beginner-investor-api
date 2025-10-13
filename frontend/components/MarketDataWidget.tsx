import React, { useEffect, useState } from 'react';
import {
  fetchAlphaVantage,
  fetchIEXCloud,
  fetchCoinGecko,
} from '../lib/marketData';

interface MarketDataWidgetProps {
  alphaVantageKey: string;
  iexCloudKey: string;
  symbol: string; // e.g., 'AAPL'
  coinId: string; // e.g., 'bitcoin'
}

export default function MarketDataWidget({
  alphaVantageKey,
  iexCloudKey,
  symbol,
  coinId,
}: MarketDataWidgetProps) {
  const [alphaData, setAlphaData] = useState<any>(null);
  const [iexData, setIexData] = useState<any>(null);
  const [coinData, setCoinData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const [alpha, iex, coin] = await Promise.all([
          fetchAlphaVantage(symbol),
          fetchIEXCloud(symbol),
          fetchCoinGecko(coinId),
        ]);
        setAlphaData(alpha);
        setIexData(iex);
        setCoinData(coin);
      } catch (err: any) {
        // Log unexpected errors for debugging
        console.error('MarketDataWidget fetch error:', err);
        setError('Failed to fetch market data.');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [alphaVantageKey, iexCloudKey, symbol, coinId]);

  return (
    <div className="bg-white rounded-xl shadow-md p-6 m-2 w-full max-w-xl mx-auto my-6">
      <h3 className="text-xl font-bold text-indigo-800 mb-4">Market Data</h3>
      {loading && <div>Loading data...</div>}
      {error && <div className="text-red-500">{error}</div>}
      {!loading && !error && (
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-indigo-700">Stock ({symbol})</h4>
            <div className="text-sm text-gray-700">
              <div>
                <b>Alpha Vantage:</b>{' '}
                {alphaData && alphaData['Time Series (Daily)']
                  ? (
                      Object.entries(
                        alphaData['Time Series (Daily)']
                      )[0][1] as any
                    )['4. close']
                  : 'N/A'}
              </div>
              <div>
                <b>IEX Cloud:</b>{' '}
                {iexData && iexData.latestPrice
                  ? `$${iexData.latestPrice}`
                  : 'N/A'}
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-indigo-700">Crypto ({coinId})</h4>
            <div className="text-sm text-gray-700">
              <div>
                <b>CoinGecko:</b>{' '}
                {coinData && coinData.market_data
                  ? `$${coinData.market_data.current_price.usd}`
                  : 'N/A'}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
