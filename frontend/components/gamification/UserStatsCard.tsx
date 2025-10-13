// User stats card component showing level, points, and achievements

import React from 'react';
import { UserProgress } from '../../types/gamification';
import ProgressBar from './ProgressBar';
import BadgeCard from './BadgeCard';

interface UserStatsCardProps {
  userProgress: UserProgress;
  compact?: boolean;
  className?: string;
}

export default function UserStatsCard({
  userProgress,
  compact = false,
  className = '',
}: UserStatsCardProps) {
  const { totalPoints, level, badges, streaks, stats } = userProgress;

  // Calculate level progress
  const currentLevelPoints =
    level > 1
      ? [0, 100, 250, 450, 700, 1000, 1350, 1750, 2200, 2700, 3250][
          level - 1
        ] || 0
      : 0;
  const nextLevelPoints =
    [100, 250, 450, 700, 1000, 1350, 1750, 2200, 2700, 3250, 4000][level - 1] ||
    4000;
  const progressToNext = totalPoints - currentLevelPoints;
  const pointsNeeded = nextLevelPoints - currentLevelPoints;

  const unlockedBadges = badges.filter(b => b.isUnlocked);
  const recentBadges = unlockedBadges
    .sort(
      (a, b) =>
        new Date(b.unlockedAt!).getTime() - new Date(a.unlockedAt!).getTime()
    )
    .slice(0, 3);

  if (compact) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-4 ${className}`}>
        <div className="flex items-center justify-between">
          {/* Level and points */}
          <div className="flex items-center space-x-3">
            <div className="bg-indigo-100 rounded-full w-12 h-12 flex items-center justify-center">
              <span className="text-indigo-800 font-bold text-lg">{level}</span>
            </div>
            <div>
              <div className="font-semibold text-gray-900">
                {totalPoints} pts
              </div>
              <div className="text-sm text-gray-500">Level {level}</div>
            </div>
          </div>

          {/* Recent badges */}
          <div className="flex space-x-1">
            {recentBadges.map(badge => (
              <BadgeCard
                key={badge.id}
                badge={badge}
                size="small"
                showDetails={false}
                className="w-8 h-8"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl shadow-lg p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Your Progress</h2>
        <div className="bg-indigo-100 rounded-full px-4 py-2">
          <span className="text-indigo-800 font-bold">Level {level}</span>
        </div>
      </div>

      {/* Level progress */}
      <div className="mb-6">
        <ProgressBar
          current={progressToNext}
          max={pointsNeeded}
          label={`Level ${level} → ${level + 1}`}
          color="purple"
          height="large"
        />
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{totalPoints}</div>
          <div className="text-sm text-blue-500">Total Points</div>
        </div>

        <div className="text-center p-3 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">
            {unlockedBadges.length}
          </div>
          <div className="text-sm text-green-500">Badges Earned</div>
        </div>

        <div className="text-center p-3 bg-purple-50 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">
            {streaks.loginStreak}
          </div>
          <div className="text-sm text-purple-500">Login Streak</div>
        </div>

        <div className="text-center p-3 bg-yellow-50 rounded-lg">
          <div className="text-2xl font-bold text-yellow-600">
            {stats.toolsUsed.length}
          </div>
          <div className="text-sm text-yellow-500">Tools Used</div>
        </div>
      </div>

      {/* Recent achievements */}
      {recentBadges.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Recent Badges
          </h3>
          <div className="flex space-x-3 overflow-x-auto pb-2">
            {recentBadges.map(badge => (
              <BadgeCard
                key={badge.id}
                badge={badge}
                size="medium"
                className="flex-shrink-0"
              />
            ))}
          </div>
        </div>
      )}

      {/* Quick stats */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
          <div>
            <span className="font-medium">Risk Assessments:</span>{' '}
            {stats.assessmentsCompleted}
          </div>
          <div>
            <span className="font-medium">Portfolios Created:</span>{' '}
            {stats.portfoliosCreated}
          </div>
          <div>
            <span className="font-medium">Learning Streak:</span>{' '}
            {streaks.learningStreak} days
          </div>
          <div>
            <span className="font-medium">Education Modules:</span>{' '}
            {stats.educationModulesCompleted}
          </div>
        </div>
      </div>
    </div>
  );
}
