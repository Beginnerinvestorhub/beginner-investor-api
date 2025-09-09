// Frontend Integration - Next.js with Firebase Auth & Backend Caching

// 1. FIREBASE CLIENT CONFIGURATION
// pages/_app.js
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { createContext, useContext, useEffect, useState } from 'react';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

// 2. AUTH CONTEXT WITH TOKEN MANAGEMENT
const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [idToken, setIdToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Get fresh ID token
          const token = await firebaseUser.getIdToken();
          setIdToken(token);
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            emailVerified: firebaseUser.emailVerified,
            displayName: firebaseUser.displayName
          });
          
          // Refresh token every 50 minutes (tokens expire in 1 hour)
          const refreshInterval = setInterval(async () => {
            try {
              const newToken = await firebaseUser.getIdToken(true);
              setIdToken(newToken);
            } catch (error) {
              console.error('Token refresh failed:', error);
            }
          }, 50 * 60 * 1000);

          return () => clearInterval(refreshInterval);
        } catch (error) {
          console.error('Error getting ID token:', error);
          setUser(null);
          setIdToken(null);
        }
      } else {
        setUser(null);
        setIdToken(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ user, idToken, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

// 3. API CLIENT WITH CACHING AWARENESS
class APIClient {
  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL;
    this.cache = new Map(); // Client-side cache for non-sensitive data
  }

  async request(endpoint, options = {}) {
    const { user, idToken } = useAuth();
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(idToken && { 'Authorization': `Bearer ${idToken}` }),
        ...options.headers
      },
      ...options
    };

    // Add cache control headers to help backend caching
    if (options.cache !== false) {
      config.headers['Cache-Control'] = options.cacheControl || 'max-age=300';
    }

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, config);
      
      // Handle rate limiting
      if (response.status === 429) {
        const retryAfter = response.headers.get('X-RateLimit-Reset');
        throw new Error(`Rate limited. Retry after: ${retryAfter}`);
      }

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      // Log cache status for debugging
      const cacheStatus = response.headers.get('X-Cache');
      if (cacheStatus) {
        console.debug(`Cache ${cacheStatus} for ${endpoint}`);
      }

      return data;
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // GET with optional client-side caching
  async get(endpoint, { clientCache = false, cacheTTL = 60000 } = {}) {
    const cacheKey = `${endpoint}`;
    
    if (clientCache && this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < cacheTTL) {
        return cached.data;
      }
      this.cache.delete(cacheKey);
    }

    const data = await this.request(endpoint, { method: 'GET' });
    
    if (clientCache) {
      this.cache.set(cacheKey, { data, timestamp: Date.now() });
    }

    return data;
  }

  async post(endpoint, body, options = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
      ...options
    });
  }

  async put(endpoint, body, options = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
      ...options
    });
  }

  async delete(endpoint, options = {}) {
    return this.request(endpoint, {
      method: 'DELETE',
      ...options
    });
  }
}

const apiClient = new APIClient();

// 4. CUSTOM HOOKS FOR DATA FETCHING WITH CACHE OPTIMIZATION

// Market data hook with intelligent caching
export const useMarketData = (symbols, refreshInterval = 60000) => {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let interval;
    
    const fetchData = async () => {
      try {
        setLoading(true);
        // Backend will serve from Redis cache if available (1min TTL)
        const response = await apiClient.get(
          `/api/market/prices?symbols=${symbols.join(',')}`,
          { 
            clientCache: true, 
            cacheTTL: 30000 // 30s client cache for frequently accessed data
          }
        );
        setData(response);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    
    // Refresh data at specified interval
    if (refreshInterval > 0) {
      interval = setInterval(fetchData, refreshInterval);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [symbols.join(','), refreshInterval]);

  return { data, loading, error, refetch: fetchData };
};

// Portfolio simulation with caching awareness
export const usePortfolioSimulation = () => {
  const [simulations, setSimulations] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const runSimulation = async (portfolio, parameters) => {
    const simulationKey = `${JSON.stringify(portfolio)}-${JSON.stringify(parameters)}`;
    
    // Check if we already have this simulation
    if (simulations[simulationKey] && !parameters.forceRefresh) {
      return simulations[simulationKey];
    }

    setLoading(true);
    try {
      // Backend will check Redis cache (10min TTL) before recalculating
      const result = await apiClient.post('/api/portfolio/simulate', {
        portfolio,
        parameters,
        cacheKey: simulationKey
      });

      setSimulations(prev => ({
        ...prev,
        [simulationKey]: result
      }));

      setError(null);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { runSimulation, simulations, loading, error };
};

// AI behavioral nudge with rate limit handling
export const useAIBehavioralNudge = () => {
  const [nudges, setNudges] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [rateLimited, setRateLimited] = useState(false);

  const generateNudge = async (userProfile, currentPortfolio) => {
    setLoading(true);
    setRateLimited(false);
    
    try {
      // AI service has 10 requests/hour limit + 1hr cache
      const nudge = await apiClient.post('/api/ai/behavioral-nudge', {
        userProfile,
        currentPortfolio
      });

      setNudges(prev => [nudge, ...prev.slice(0, 4)]); // Keep last 5 nudges
      setError(null);
      return nudge;
    } catch (err) {
      if (err.message.includes('Rate limited')) {
        setRateLimited(true);
        setError('You\'ve reached the hourly limit for AI recommendations. Try again later.');
      } else {
        setError(err.message);
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { generateNudge, nudges, loading, error, rateLimited };
};

// 5. COMPONENT EXAMPLES WITH CACHING INTEGRATION

// Real-time market data component
export const MarketDataWidget = ({ symbols }) => {
  const { data, loading, error } = useMarketData(symbols, 60000);

  if (loading) return <div>Loading market data...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="market-data">
      {Object.entries(data).map(([symbol, price]) => (
        <div key={symbol} className="price-item">
          <span>{symbol}</span>
          <span className={price.change >= 0 ? 'positive' : 'negative'}>
            ${price.current} ({price.change > 0 ? '+' : ''}{price.change}%)
          </span>
        </div>
      ))}
    </div>
  );
};

// Portfolio simulation component
export const PortfolioSimulator = ({ portfolio }) => {
  const { runSimulation, loading, error } = usePortfolioSimulation();
  const [results, setResults] = useState(null);

  const handleSimulation = async () => {
    try {
      const simulation = await runSimulation(portfolio, {
        timeframe: '1year',
        iterations: 1000,
        confidenceInterval: 95
      });
      setResults(simulation);
    } catch (err) {
      console.error('Simulation failed:', err);
    }
  };

  return (
    <div className="portfolio-simulator">
      <button onClick={handleSimulation} disabled={loading}>
        {loading ? 'Running Simulation...' : 'Run Portfolio Simulation'}
      </button>
      
      {error && <div className="error">{error}</div>}
      
      {results && (
        <div className="simulation-results">
          <h3>Simulation Results</h3>
          <p>Expected Return: {results.expectedReturn}%</p>
          <p>Risk (VaR 95%): {results.valueAtRisk}%</p>
          <p>Sharpe Ratio: {results.sharpeRatio}</p>
        </div>
      )}
    </div>
  );
};

// AI nudge component with rate limit handling
export const AIBehavioralNudgeWidget = ({ userProfile, portfolio }) => {
  const { generateNudge, nudges, loading, error, rateLimited } = useAIBehavioralNudge();

  const handleGenerateNudge = async () => {
    if (rateLimited) return;
    
    try {
      await generateNudge(userProfile, portfolio);
    } catch (err) {
      console.error('Nudge generation failed:', err);
    }
  };

  return (
    <div className="ai-nudge-widget">
      <button 
        onClick={handleGenerateNudge} 
        disabled={loading || rateLimited}
        className={rateLimited ? 'rate-limited' : ''}
      >
        {loading ? 'Generating...' : 
         rateLimited ? 'Rate Limited (Try Later)' : 
         'Get AI Investment Advice'}
      </button>
      
      {error && <div className="error">{error}</div>}
      
      {nudges.length > 0 && (
        <div className="nudge-history">
          <h3>Recent AI Recommendations</h3>
          {nudges.map((nudge, index) => (
            <div key={index} className="nudge-item">
              <p>{nudge.recommendation}</p>
              <small>Generated: {new Date(nudge.timestamp).toLocaleString()}</small>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default apiClient;