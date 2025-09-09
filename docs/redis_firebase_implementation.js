// Redis Caching & Rate Limiting + Firebase Auth Implementation

// 1. REDIS CLIENT SETUP
const redis = require('redis');

class RedisManager {
  constructor() {
    this.client = redis.createClient({
      url: process.env.REDIS_URL
    });
    
    this.client.on('error', (err) => {
      console.error('Redis Client Error:', err);
    });
    
    this.client.connect();
  }

  // CACHING METHODS
  async cache(key, data, ttl = 300) {
    try {
      await this.client.setEx(key, ttl, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('Cache set error:', error);
      return false;
    }
  }

  async getCache(key) {
    try {
      const data = await this.client.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  async deleteCache(pattern) {
    try {
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        await this.client.del(keys);
      }
      return true;
    } catch (error) {
      console.error('Cache delete error:', error);
      return false;
    }
  }

  // RATE LIMITING METHODS
  async checkRateLimit(key, maxRequests = 100, windowSeconds = 900) {
    try {
      const current = await this.client.incr(key);
      
      if (current === 1) {
        await this.client.expire(key, windowSeconds);
      }
      
      return {
        allowed: current <= maxRequests,
        remaining: Math.max(0, maxRequests - current),
        resetTime: await this.client.ttl(key)
      };
    } catch (error) {
      console.error('Rate limit check error:', error);
      return { allowed: true, remaining: maxRequests, resetTime: windowSeconds };
    }
  }
}

// 2. FIREBASE AUTH SETUP
const admin = require('firebase-admin');

class FirebaseAuth {
  constructor() {
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        }),
        projectId: process.env.FIREBASE_PROJECT_ID,
      });
    }
    this.auth = admin.auth();
  }

  async verifyToken(token) {
    try {
      const decodedToken = await this.auth.verifyIdToken(token);
      return {
        valid: true,
        uid: decodedToken.uid,
        email: decodedToken.email,
        emailVerified: decodedToken.email_verified
      };
    } catch (error) {
      console.error('Token verification error:', error);
      return { valid: false, error: error.message };
    }
  }

  async createCustomToken(uid, additionalClaims = {}) {
    try {
      return await this.auth.createCustomToken(uid, additionalClaims);
    } catch (error) {
      console.error('Custom token creation error:', error);
      throw error;
    }
  }
}

// 3. MIDDLEWARE IMPLEMENTATIONS
const redisManager = new RedisManager();
const firebaseAuth = new FirebaseAuth();

// Authentication Middleware
const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No valid authorization token provided' });
    }

    const token = authHeader.substring(7);
    const verification = await firebaseAuth.verifyToken(token);
    
    if (!verification.valid) {
      return res.status(401).json({ error: 'Invalid token', details: verification.error });
    }

    req.user = verification;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ error: 'Authentication failed' });
  }
};

// Rate Limiting Middleware
const rateLimitMiddleware = (maxRequests = 100, windowSeconds = 900) => {
  return async (req, res, next) => {
    try {
      const clientId = req.user?.uid || req.ip;
      const key = `rate_limit:${clientId}`;
      
      const result = await redisManager.checkRateLimit(key, maxRequests, windowSeconds);
      
      // Add rate limit headers
      res.set({
        'X-RateLimit-Limit': maxRequests,
        'X-RateLimit-Remaining': result.remaining,
        'X-RateLimit-Reset': new Date(Date.now() + result.resetTime * 1000).toISOString()
      });

      if (!result.allowed) {
        return res.status(429).json({
          error: 'Rate limit exceeded',
          retryAfter: result.resetTime
        });
      }

      next();
    } catch (error) {
      console.error('Rate limit middleware error:', error);
      next(); // Continue on error
    }
  };
};

// Caching Middleware
const cacheMiddleware = (ttl = 300, keyGenerator = null) => {
  return async (req, res, next) => {
    try {
      const cacheKey = keyGenerator ? 
        keyGenerator(req) : 
        `cache:${req.method}:${req.originalUrl}:${req.user?.uid || 'anonymous'}`;
      
      const cachedData = await redisManager.getCache(cacheKey);
      
      if (cachedData) {
        res.set('X-Cache', 'HIT');
        return res.json(cachedData);
      }
      
      // Override res.json to cache the response
      const originalJson = res.json;
      res.json = function(data) {
        res.set('X-Cache', 'MISS');
        redisManager.cache(cacheKey, data, ttl);
        originalJson.call(this, data);
      };
      
      next();
    } catch (error) {
      console.error('Cache middleware error:', error);
      next();
    }
  };
};

// 4. SERVICE-SPECIFIC IMPLEMENTATIONS

// Market Data Service - Cache with short TTL
class MarketDataCache {
  static async getStockPrice(symbol) {
    const key = `market:price:${symbol}`;
    const cached = await redisManager.getCache(key);
    
    if (cached) {
      return cached;
    }
    
    // Fetch from external API
    const price = await fetchExternalPrice(symbol);
    
    // Cache for 1 minute
    await redisManager.cache(key, price, 60);
    
    return price;
  }
  
  static async invalidateSymbol(symbol) {
    await redisManager.deleteCache(`market:price:${symbol}`);
  }
}

// AI Service - Cache AI responses
class AIResponseCache {
  static async getCachedResponse(prompt, model = 'gpt-4') {
    const key = `ai:response:${Buffer.from(prompt).toString('base64')}:${model}`;
    return await redisManager.getCache(key);
  }
  
  static async cacheResponse(prompt, response, model = 'gpt-4') {
    const key = `ai:response:${Buffer.from(prompt).toString('base64')}:${model}`;
    // Cache AI responses for 1 hour
    await redisManager.cache(key, response, 3600);
  }
}

// Portfolio Simulation Cache
class PortfolioSimulationCache {
  static async getCachedSimulation(portfolioHash, parameters) {
    const key = `simulation:${portfolioHash}:${Buffer.from(JSON.stringify(parameters)).toString('base64')}`;
    return await redisManager.getCache(key);
  }
  
  static async cacheSimulation(portfolioHash, parameters, result) {
    const key = `simulation:${portfolioHash}:${Buffer.from(JSON.stringify(parameters)).toString('base64')}`;
    // Cache simulations for 10 minutes
    await redisManager.cache(key, result, 600);
  }
}

// Risk Calculation Cache
class RiskCalculationCache {
  static async getCachedRisk(portfolioHash, timeframe) {
    const key = `risk:${portfolioHash}:${timeframe}`;
    return await redisManager.getCache(key);
  }
  
  static async cacheRisk(portfolioHash, timeframe, result) {
    const key = `risk:${portfolioHash}:${timeframe}`;
    // Cache risk calculations for 30 minutes
    await redisManager.cache(key, result, 1800);
  }
}

// 5. EXAMPLE ROUTE IMPLEMENTATIONS

// Backend API with auth, rate limiting, and caching
app.get('/api/portfolio/:id', 
  authMiddleware,
  rateLimitMiddleware(50, 300), // 50 requests per 5 minutes
  cacheMiddleware(300), // Cache for 5 minutes
  async (req, res) => {
    try {
      const portfolio = await getPortfolioFromDB(req.params.id, req.user.uid);
      res.json(portfolio);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch portfolio' });
    }
  }
);

// AI Service with caching
app.post('/api/ai/behavioral-nudge',
  authMiddleware,
  rateLimitMiddleware(10, 3600), // 10 AI requests per hour
  async (req, res) => {
    try {
      const { userProfile, currentPortfolio } = req.body;
      const prompt = generateBehavioralNudgePrompt(userProfile, currentPortfolio);
      
      // Check cache first
      let response = await AIResponseCache.getCachedResponse(prompt);
      
      if (!response) {
        response = await callOpenAI(prompt);
        await AIResponseCache.cacheResponse(prompt, response);
      }
      
      res.json({ nudge: response, cached: !!response });
    } catch (error) {
      res.status(500).json({ error: 'AI service error' });
    }
  }
);

module.exports = {
  RedisManager,
  FirebaseAuth,
  authMiddleware,
  rateLimitMiddleware,
  cacheMiddleware,
  MarketDataCache,
  AIResponseCache,
  PortfolioSimulationCache,
  RiskCalculationCache
};