import { NextResponse } from 'next/server';

// Mock ESG data for development
// In production, this would fetch from a real ESG data provider
const mockESGData = [
  { name: 'Apple Inc.', sector: 'Technology', esg: 78, flagged: false, marketCap: 2800 },
  { name: 'Microsoft Corp.', sector: 'Technology', esg: 82, flagged: false, marketCap: 2400 },
  { name: 'Tesla Inc.', sector: 'Automotive', esg: 65, flagged: true, marketCap: 800 },
  { name: 'Johnson & Johnson', sector: 'Healthcare', esg: 85, flagged: false, marketCap: 450 },
  { name: 'Procter & Gamble', sector: 'Consumer Goods', esg: 79, flagged: false, marketCap: 350 },
  { name: 'Exxon Mobil', sector: 'Energy', esg: 45, flagged: true, marketCap: 400 },
  { name: 'Chevron Corp.', sector: 'Energy', esg: 42, flagged: true, marketCap: 280 },
  { name: 'Walmart Inc.', sector: 'Retail', esg: 68, flagged: false, marketCap: 380 },
  { name: 'Amazon.com Inc.', sector: 'Technology', esg: 71, flagged: false, marketCap: 1300 },
  { name: 'Alphabet Inc.', sector: 'Technology', esg: 76, flagged: false, marketCap: 1600 },
  { name: 'Meta Platforms', sector: 'Technology', esg: 69, flagged: true, marketCap: 750 },
  { name: 'Coca-Cola Co.', sector: 'Consumer Goods', esg: 74, flagged: false, marketCap: 250 },
  { name: 'PepsiCo Inc.', sector: 'Consumer Goods', esg: 77, flagged: false, marketCap: 220 },
  { name: 'Nike Inc.', sector: 'Consumer Goods', esg: 72, flagged: false, marketCap: 180 },
  { name: 'Starbucks Corp.', sector: 'Consumer Services', esg: 81, flagged: false, marketCap: 120 },
  { name: 'McDonald\'s Corp.', sector: 'Consumer Services', esg: 66, flagged: false, marketCap: 190 },
  { name: 'Boeing Co.', sector: 'Aerospace', esg: 58, flagged: true, marketCap: 120 },
  { name: 'Lockheed Martin', sector: 'Aerospace', esg: 55, flagged: true, marketCap: 110 },
  { name: 'Pfizer Inc.', sector: 'Healthcare', esg: 83, flagged: false, marketCap: 280 },
  { name: 'Merck & Co.', sector: 'Healthcare', esg: 80, flagged: false, marketCap: 220 }
];

// Simple in-memory rate limiting
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(clientIP: string): boolean {
  const now = Date.now();
  const windowMs = 60000; // 1 minute
  const maxRequests = 100; // 100 requests per minute

  const clientData = rateLimitMap.get(clientIP);

  if (!clientData || now > clientData.resetTime) {
    rateLimitMap.set(clientIP, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (clientData.count >= maxRequests) {
    return false;
  }

  clientData.count++;
  return true;
}

export async function GET(req: Request) {
  try {
    // Get client IP for rate limiting
    const clientIP = req.headers.get('x-forwarded-for')?.split(',')[0] ||
                     req.headers.get('x-real-ip') ||
                     'unknown';

    // Check rate limit
    if (!checkRateLimit(clientIP)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': '100',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(Date.now() + 60000).toISOString(),
          }
        }
      );
    }

    // Simulate some processing time for realism
    await new Promise(resolve => setTimeout(resolve, 100));

    // In a real implementation, you would fetch from an external ESG data provider
    // For example:
    // const response = await fetch('https://api.esg-data-provider.com/stocks', {
    //   headers: {
    //     'Authorization': `Bearer ${process.env.ESG_API_KEY}`,
    //     'Content-Type': 'application/json'
    //   }
    // });
    // const data = await response.json();

    // For now, return mock data
    const stocks = mockESGData.map(stock => ({
      ...stock,
      // Add some randomization for demo purposes
      esg: Math.max(0, Math.min(100, stock.esg + (Math.random() - 0.5) * 10)),
      marketCap: stock.marketCap + (Math.random() - 0.5) * 50
    }));

    return NextResponse.json({
      stocks,
      lastUpdated: new Date().toISOString(),
      source: 'mock-data' // In production, this would be the actual data source
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Cache-Control': 'public, max-age=300', // Cache for 5 minutes
        'X-RateLimit-Limit': '100',
        'X-RateLimit-Remaining': Math.max(0, 100 - (rateLimitMap.get(clientIP)?.count || 0)).toString(),
        'X-RateLimit-Reset': new Date(Date.now() + 60000).toISOString(),
      }
    });

  } catch (error) {
    console.error('ESG Proxy API Error:', error);

    return NextResponse.json(
      { error: 'Internal server error while fetching ESG data' },
      {
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        }
      }
    );
  }
}

// Handle preflight requests
export async function OPTIONS() {
  return NextResponse.json({}, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    }
  });
}
