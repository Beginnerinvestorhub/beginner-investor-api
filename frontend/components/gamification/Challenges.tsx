import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../../hooks/useAuth';

interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'monthly' | 'achievement';
  target: number;
  progress: number;
  reward: {
    points: number;
    badge?: string;
  };
  expiresAt?: Date;
  completed: boolean;
}

export default function Challenges() {
  const { user } = useAuth();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchChallenges = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data } = await axios.get(
        `/api/gamification/challenges/${user.uid}`
      );
      setChallenges(data);
    } catch (error) {
      console.error('Failed to fetch challenges:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchChallenges();
  }, [fetchChallenges]);

  const claimReward = async (challengeId: string) => {
    try {
      await axios.post(`/api/gamification/challenges/${challengeId}/claim`, {
        userId: user?.uid,
      });
      fetchChallenges(); // Refresh challenges
    } catch (error) {
      console.error('Failed to claim reward:', error);
    }
  };

  if (loading) {
    return <div className="animate-pulse bg-gray-200 h-64 rounded-lg"></div>;
  }

  const activeChallenges = challenges.filter(c => !c.completed);
  const completedChallenges = challenges.filter(c => c.completed);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Challenges</h2>

      {/* Active Challenges */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">
          Active Challenges
        </h3>
        <div className="space-y-4">
          {activeChallenges.map(challenge => (
            <div
              key={challenge.id}
              className="border border-gray-200 rounded-lg p-4"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-semibold text-gray-800">
                    {challenge.title}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {challenge.description}
                  </p>
                </div>
                <span
                  className={`px-2 py-1 text-xs rounded-full ${
                    challenge.type === 'daily'
                      ? 'bg-green-100 text-green-800'
                      : challenge.type === 'weekly'
                        ? 'bg-blue-100 text-blue-800'
                        : challenge.type === 'monthly'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {challenge.type}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="mb-3">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>
                    Progress: {challenge.progress}/{challenge.target}
                  </span>
                  <span>
                    {Math.round((challenge.progress / challenge.target) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                    // eslint-disable-next-line react/forbid-dom-props
                    style={{
                      width: `${Math.min((challenge.progress / challenge.target) * 100, 100)}%`,
                    }}
                  ></div>
                </div>
              </div>

              {/* Reward */}
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  Reward:{' '}
                  <span className="font-semibold text-indigo-600">
                    {challenge.reward.points} points
                  </span>
                  {challenge.reward.badge && (
                    <span className="ml-2 text-yellow-600">
                      + {challenge.reward.badge} badge
                    </span>
                  )}
                </div>
                {challenge.progress >= challenge.target && (
                  <button
                    onClick={() => claimReward(challenge.id)}
                    className="px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700"
                  >
                    Claim Reward
                  </button>
                )}
              </div>

              {challenge.expiresAt && (
                <p className="text-xs text-red-500 mt-2">
                  Expires: {new Date(challenge.expiresAt).toLocaleDateString()}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Completed Challenges */}
      {completedChallenges.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-4">
            Recently Completed
          </h3>
          <div className="space-y-2">
            {completedChallenges.slice(0, 3).map(challenge => (
              <div
                key={challenge.id}
                className="bg-green-50 border border-green-200 rounded-lg p-3"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium text-green-800">
                      {challenge.title}
                    </h4>
                    <p className="text-sm text-green-600">Completed!</p>
                  </div>
                  <div className="text-sm text-green-700">
                    +{challenge.reward.points} points
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeChallenges.length === 0 && completedChallenges.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No challenges available right now.</p>
          <p className="text-sm">Check back later for new challenges!</p>
        </div>
      )}
    </div>
  );
}
