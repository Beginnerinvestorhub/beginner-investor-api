import express from 'express';
import axios from 'axios';

const router = express.Router();

// Market data proxy routes
router.get('/marketdata/quote/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const marketDataServiceUrl = process.env.MARKETDATA_SERVICE_URL || 'http://localhost:8001';

    const response = await axios.get(`${marketDataServiceUrl}/quote/${symbol}`);

    res.json(response.data);
  } catch (error: any) {
    console.error('Market data proxy error:', error.message);

    // If marketdata service is not available, return mock data for development
    if (error.code === 'ECONNREFUSED' || error.response?.status === 404) {
      return res.json({
        symbol: req.params.symbol,
        price: Math.random() * 100 + 100, // Mock price between 100-200
        change: (Math.random() - 0.5) * 10, // Mock change between -5 and +5
        changePercent: (Math.random() - 0.5) * 2, // Mock percent change
        volume: Math.floor(Math.random() * 1000000),
        lastUpdated: new Date().toISOString(),
      });
    }

    res.status(error.response?.status || 500).json({
      error: 'Failed to fetch market data',
      details: error.message,
    });
  }
});

router.get('/marketdata/historical/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const { interval = '1d', start_date, end_date } = req.query;
    const marketDataServiceUrl = process.env.MARKETDATA_SERVICE_URL || 'http://localhost:8001';

    const response = await axios.get(`${marketDataServiceUrl}/historical/${symbol}`, {
      params: { interval, start_date, end_date },
    });

    res.json(response.data);
  } catch (error: any) {
    console.error('Historical data proxy error:', error.message);
    res.status(error.response?.status || 500).json({
      error: 'Failed to fetch historical data',
      details: error.message,
    });
  }
});

router.get('/marketdata/search', async (req, res) => {
  try {
    const { query } = req.query;
    const marketDataServiceUrl = process.env.MARKETDATA_SERVICE_URL || 'http://localhost:8001';

    if (!query) {
      return res.status(400).json({ error: 'Query parameter is required' });
    }

    const response = await axios.get(`${marketDataServiceUrl}/search`, {
      params: { query },
    });

    res.json(response.data);
  } catch (error: any) {
    console.error('Search proxy error:', error.message);
    res.status(error.response?.status || 500).json({
      error: 'Failed to search symbols',
      details: error.message,
    });
  }
});

export default router;
