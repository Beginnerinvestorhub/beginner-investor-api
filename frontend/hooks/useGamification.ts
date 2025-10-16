// Gamification hook for managing user progress, badges, and achievements

import { useState, useEffect, useCallback } from 'react';
import {
  UserProgress,
  Badge,
  Achievement,
  StreakData,
  UserStats,
} from '../types/gamification';
import {
  BADGE_DEFINITIONS,
  LEVEL_THRESHOLDS,
  ACHIEVEMENT_DEFINITIONS,
} from '../config/badges';
import { useAuth } from './useAuth';
import axios from 'axios';

interface UseGamificationReturn {
  userProgress: UserProgress | null;
  loading: boolean;
  error: string | null;

  // Actions
  trackEvent: (eventType: string, data?: Record<string, unknown>) => Promise<void>;
  awardPoints: (points: number, reason: string) => Promise<void>;
  unlockBadge: (badgeId: string) => Promise<void>;
  updateStreak: (streakType: 'login' | 'learning') => Promise<void>;

  // Utilities
  calculateLevel: (totalPoints: number) => number;
  getProgressToNextLevel: (totalPoints: number) => {
    current: number;
    next: number;
    progress: number;
  };
  checkAchievements: (
    eventType: string,
    currentStats: Record<string, unknown>
  ) => Promise<Achievement[]>;

  // UI Helpers
  showNotification: (
    type: 'badge' | 'achievement' | 'points',
    data: Record<string, unknown>
  ) => void;
}

export function useGamification(userId: string): UseGamificationReturn {
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // API base URL
  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

  // Create axios instance with auth headers
  const createApiClient = useCallback(async () => {
    if (!user) return null;
    const token = await user.getIdToken();
    return axios.create({
      baseURL: API_BASE_URL,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
  }, [user, API_BASE_URL]);

  const saveUserData = useCallback(async (progress: UserProgress) => {
    try {
      const apiClient = await createApiClient();
      if (apiClient) {
        await apiClient.post('/api/gamification/save-user-data', progress);
      }

      // Keep localStorage as backup
      try {
        localStorage.setItem(
          `gamification_${userId}`,
          JSON.stringify(progress)
        );
      } catch (error) {
        console.error('Error saving user data to localStorage:', error);
      }
    } catch (err) {
      console.error('Failed to save user progress:', err);
    }
  }, [userId, createApiClient]);

  // Load data from backend API
  useEffect(() => {
    const loadUserData = async () => {
      if (user) {
        try {
          setLoading(true);

          const apiClient = await createApiClient();
          if (!apiClient) {
            setError('Authentication required');
            return;
          }
          const response = await apiClient.get('/api/gamification/user-data');

          if (response.data?.data) {
            const progress = response.data.data;

            setUserProgress(progress);
          } else {
            // Initialize new user progress
            const initialProgress: UserProgress = {
              userId,
              totalPoints: 0,
              level: 1,
              badges: [],
              streaks: {
                loginStreak: 0,
                learningStreak: 0,
              },
              stats: {
                toolsUsed: [],
                assessmentsCompleted: 0,
                portfoliosCreated: 0,
                educationModulesCompleted: 0,
              },
            };

            setUserProgress(initialProgress);
            await saveUserData(initialProgress);
          }
        } catch (err) {
          setError('Failed to load user progress');
          console.error('Gamification load error:', err);
        } finally {
          setLoading(false);
        }
      }
    };

    loadUserData();
  }, [user, userId, createApiClient, saveUserData]);

  const calculateLevel = useCallback((totalPoints: number): number => {
    let level = 1;
    for (let i = 0; i < LEVEL_THRESHOLDS.length; i++) {
      if (totalPoints >= LEVEL_THRESHOLDS[i]) {
        level = i + 1;
      } else {
        break;
      }
    }
    return Math.min(level, LEVEL_THRESHOLDS.length);
  }, []);

  const getProgressToNextLevel = useCallback(
    (totalPoints: number) => {
      const currentLevel = calculateLevel(totalPoints);
      const currentThreshold = LEVEL_THRESHOLDS[currentLevel - 1] || 0;
      const nextThreshold =
        LEVEL_THRESHOLDS[currentLevel] ||
        LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];

      const progress =
        nextThreshold > currentThreshold
          ? ((totalPoints - currentThreshold) /
              (nextThreshold - currentThreshold)) *
            100
          : 100;

      return {
        current: currentLevel,
        next: currentLevel + 1,
        progress: Math.min(progress, 100),
      };
    },
    [calculateLevel]
  );

  const showNotification = useCallback(
    (type: 'badge' | 'achievement' | 'points', data: Record<string, unknown>) => {
      // In a real app, this would trigger a toast notification or modal
      console.log(
        `🎉 Gamification Notification [${type.toUpperCase()}]:`,
        data
      );

      // You can integrate with react-hot-toast or another notification system here
      // Example: toast.success(`🎉 ${data.name} unlocked!`);
    },
    []
  );

  const checkLevelAchievements = async (
    newLevel: number
  ) => {
    // Check for level-based badge unlocks
    if (newLevel >= 10) {
      await unlockBadge('PLATINUM_INVESTOR');
    }
  };

  const checkStreakAchievements = async (
    streakType: string,
    streak: number
  ) => {
    if (streakType === 'login' && streak >= 7) {
      await unlockBadge('DAILY_VISITOR');
    }
    if (streakType === 'login' && streak >= 30) {
      await unlockBadge('WEEKLY_WARRIOR');
    }
    if (streakType === 'learning' && streak >= 14) {
      await unlockBadge('LEARNING_STREAK');
    }
  };

  const awardPoints = useCallback(
    async (points: number, reason: string) => {
      if (!userProgress) return;

      const newTotalPoints = userProgress.totalPoints + points;
      const newLevel = calculateLevel(newTotalPoints);
      const leveledUp = newLevel > userProgress.level;

      const updatedProgress: UserProgress = {
        ...userProgress,
        totalPoints: newTotalPoints,
        level: newLevel,
        experiencePoints: newTotalPoints,
        experienceToNextLevel:
          LEVEL_THRESHOLDS[newLevel] ||
          LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1],
      };

      setUserProgress(updatedProgress);
      await saveUserData(updatedProgress);

      // Show notification
      showNotification('points', { points, reason, leveledUp, newLevel });

      // Check for level-based achievements
      if (leveledUp) {
        await checkLevelAchievements(newLevel);
      }
    },
    [userProgress, calculateLevel, saveUserData, showNotification, checkLevelAchievements]
  );

  const unlockBadge = useCallback(
    async (badgeId: string) => {
      if (!userProgress) return;

      const badgeDefinition = BADGE_DEFINITIONS[badgeId];
      if (!badgeDefinition) return;

      // Check if badge is already unlocked
      if (userProgress.badges.some(b => b.id === badgeId)) return;

      const newBadge: Badge = {
        ...badgeDefinition,
        isUnlocked: true,
        unlockedAt: new Date(),
      };

      const updatedProgress: UserProgress = {
        ...userProgress,
        badges: [...userProgress.badges, newBadge],
        totalPoints: userProgress.totalPoints + badgeDefinition.points,
      };

      setUserProgress(updatedProgress);
      await saveUserData(updatedProgress);

      // Show notification
      showNotification('badge', newBadge as unknown as Record<string, unknown>);
    },
    [userProgress]
  );

  const updateStreak = useCallback(
    async (streakType: 'login' | 'learning') => {
      if (!userProgress) return;

      const today = new Date().toDateString();
      const lastDate =
        streakType === 'login'
          ? userProgress.streaks.lastLoginDate
          : userProgress.streaks.lastLearningDate;

      let newStreak = 1;

      if (lastDate) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        if (lastDate === yesterday.toDateString()) {
          // Consecutive day
          newStreak =
            (streakType === 'login'
              ? userProgress.streaks.loginStreak
              : userProgress.streaks.learningStreak) + 1;
        } else if (lastDate === today) {
          // Same day, no change
          return;
        }
        // If gap > 1 day, streak resets to 1
      }

      const updatedProgress: UserProgress = {
        ...userProgress,
        streaks: {
          ...userProgress.streaks,
          [streakType === 'login' ? 'loginStreak' : 'learningStreak']:
            newStreak,
          [streakType === 'login' ? 'lastLoginDate' : 'lastLearningDate']:
            new Date(),
        },
      };

      setUserProgress(updatedProgress);
      await saveUserData(updatedProgress);

      // Check streak achievements
      await checkStreakAchievements(streakType, newStreak);
    },
    [userProgress]
  );

  const checkAchievements = useCallback(
    async (eventType: string, currentStats: Record<string, unknown>): Promise<Achievement[]> => {
      if (!userProgress) return [];

      const newAchievements: Achievement[] = [];

      // Check each achievement definition
      Object.values(ACHIEVEMENT_DEFINITIONS).forEach(achievementDef => {
        // Skip if already completed
        if (
          (userProgress as UserProgress & { achievements: Achievement[] }).achievements.some(
            a => a.id === achievementDef.id && a.isCompleted
          )
        ) {
          return;
        }

        let progress = 0;

        // Calculate progress based on achievement type
        switch (achievementDef.id) {
          case 'first_risk_assessment':
            progress = (currentStats as { assessmentsCompleted?: number }).assessmentsCompleted || 0;
            break;
          case 'tools_explorer':
            progress = (currentStats as { toolsUsed?: string[] }).toolsUsed?.length || 0;
            break;
          case 'portfolio_creator':
            progress = (currentStats as { portfoliosCreated?: number }).portfoliosCreated || 0;
            break;
          case 'login_streak_7':
            progress = (userProgress as UserProgress & { streaks: { loginStreak: number } }).streaks.loginStreak;
            break;
          case 'esg_user':
            progress = (currentStats as { toolsUsed?: string[] }).toolsUsed?.includes('esg-screener') ? 1 : 0;
            break;
        }

        const isCompleted = progress >= achievementDef.target;

        if (isCompleted) {
          const achievement: Achievement = {
            id: achievementDef.id,
            name: achievementDef.name,
            title: achievementDef.name,
            description: achievementDef.description,
            points: achievementDef.reward.points || 0,
            reward: achievementDef.reward.points || 0,
            badge: achievementDef.reward.badge,
          };

          newAchievements.push(achievement);
        }
      });

      return newAchievements;
    },
    [userProgress]
  );

  return {
    userProgress,
    loading,
    error,
    trackEvent,
    awardPoints,
    unlockBadge,
    updateStreak,
    calculateLevel,
    getProgressToNextLevel,
    checkAchievements,
    showNotification,
  };
}
