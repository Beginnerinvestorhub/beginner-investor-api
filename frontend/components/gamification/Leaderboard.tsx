import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../../hooks/useAuth';

interface LeaderboardEntry {
  userId: string;
  displayName: string;
  points: number;
  level: number;
  rank: number;
}

export default function Leaderboard() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'all'>('week');

  const fetchLeaderboard = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(
        `/api/gamification/leaderboard?timeframe=${timeframe}`
      );
      setEntries(data);
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
    } finally {
      setLoading(false);
    }
  }, [timeframe]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  if (loading) {
    return <div className="animate-pulse bg-gray-200 h-64 rounded-lg"></div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Leaderboard</h2>
        <select
          value={timeframe}
          onChange={e =>
            setTimeframe(e.target.value as 'week' | 'month' | 'all')
          }
          className="px-3 py-1 border border-gray-300 rounded-md text-sm"
        >
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="all">All Time</option>
        </select>
      </div>

      <div className="space-y-3">
        {entries.map((entry, index) => (
          <div
            key={entry.userId}
            className={`flex items-center justify-between p-3 rounded-lg ${
              entry.userId === user?.uid
                ? 'bg-indigo-50 border-2 border-indigo-200'
                : 'bg-gray-50'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  index === 0
                    ? 'bg-yellow-400 text-yellow-900'
                    : index === 1
                      ? 'bg-gray-300 text-gray-700'
                      : index === 2
                        ? 'bg-orange-400 text-orange-900'
                        : 'bg-gray-200 text-gray-600'
                }`}
              >
                {entry.rank}
              </div>
              <div>
                <p className="font-semibold text-gray-800">
                  {entry.displayName || `User ${entry.userId.slice(0, 8)}`}
                  {entry.userId === user?.uid && (
                    <span className="text-indigo-600 ml-1">(You)</span>
                  )}
                </p>
                <p className="text-sm text-gray-500">Level {entry.level}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold text-indigo-600">
                {entry.points.toLocaleString()} pts
              </p>
            </div>
          </div>
        ))}
      </div>

      {entries.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No leaderboard data available yet.</p>
          <p className="text-sm">Start using the platform to see rankings!</p>
        </div>
      )}
    </div>
  );
}
