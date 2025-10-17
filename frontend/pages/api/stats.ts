import type { NextApiRequest, NextApiResponse } from 'next';

interface StatsData {
  portfoliosBuilt: number;
  simulationsRun: number;
  simulatedValue: number;
  userSatisfaction: number;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<StatsData | { error: string }>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // For now, return static data - replace with actual database queries
    // In a real app, you'd fetch from your database or cache
    const stats: StatsData = {
      portfoliosBuilt: 12847, // Replace with actual query
      simulationsRun: 45392,  // Replace with actual query
      simulatedValue: 2100000, // Replace with actual query
      userSatisfaction: 95    // Replace with actual query
    };

    res.status(200).json(stats);
  } catch (error) {
    console.error('Stats API error:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
}
