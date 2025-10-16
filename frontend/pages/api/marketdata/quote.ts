import type { NextApiRequest, NextApiResponse } from 'next';

interface MarketDataResponse {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  lastUpdated: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<MarketDataResponse | { error: string }>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { symbol = 'SPY' } = req.query;

    // Fetch data from the backend API which proxies to marketdata service
    const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';
    const response = await fetch(
      `${backendUrl}/api/v1/marketdata/quote/${symbol}`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch market data: ${response.statusText}`);
    }

    const data = await response.json();

    res.status(200).json(data);
  } catch (error) {
    console.error('Market data API error:', error);
    res.status(500).json({ error: 'Failed to fetch market data' });
  }
}
