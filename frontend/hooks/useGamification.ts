// Gamification hook for managing user progress, badges, and achievements

import { useState, useEffect, useCallback } from 'react';
import { UserProgress, Badge, Achievement, UserStats } from '../types/gamification'; // Added UserStats import for explicit typing
import {
  BADGE_DEFINITIONS,
  LEVEL_THRESHOLDS,
  ACHIEVEMENT_DEFINITIONS,
} from '../config/badges';
import { useAuth } from './useAuth';
import axios from 'axios';

// Utility to ensure consistent date strings for streak tracking
const getTodayDateString = (): string => new Date().toDateString();
const getYesterdayDateString = (): string => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday.toDateString();
};

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
    currentStats: UserStats // Use specific type here
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

  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

  // --- Utility & API Functions ---

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
        // Correct way to call save (no change needed here)
        await apiClient.post('/api/gamification/save-user-data', progress);
      }
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
      // Implementation placeholder
      console.log(
        `🎉 Gamification Notification [${type.toUpperCase()}]:`,
        data
      );
    },
    []
  );

  // --- Action Functions (Hoisted & Memoized) ---
  
  const unlockBadge = useCallback(
    async (badgeId: string) => {
      setUserProgress(currentProgress => {
        if (!currentProgress) return null;

        const badgeDefinition = BADGE_DEFINITIONS[badgeId];
        if (!badgeDefinition) return currentProgress;

        if (currentProgress.badges.some(b => b.id === badgeId)) return currentProgress;

        const newBadge: Badge = {
          ...badgeDefinition,
          isUnlocked: true,
          unlockedAt: new Date().toISOString(), 
        };

        const updatedProgress: UserProgress = {
          ...currentProgress,
          badges: [...currentProgress.badges, newBadge],
          totalPoints: currentProgress.totalPoints + badgeDefinition.points,
        };

        saveUserData(updatedProgress);
        showNotification('badge', newBadge as unknown as Record<string, unknown>);
        
        return updatedProgress;
      });
    },
    [saveUserData, showNotification]
  );

  const checkLevelAchievements = useCallback(async (newLevel: number) => {
    if (newLevel >= 10) {
      await unlockBadge('PLATINUM_INVESTOR');
    }
  }, [unlockBadge]);

  const checkStreakAchievements = useCallback(async (
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
  }, [unlockBadge]);

  const awardPoints = useCallback(
    async (points: number, reason: string) => {
      setUserProgress(currentProgress => {
        if (!currentProgress) return null;

        const newTotalPoints = currentProgress.totalPoints + points;
        const newLevel = calculateLevel(newTotalPoints);
        const leveledUp = newLevel > currentProgress.level;

        const updatedProgress: UserProgress = {
          ...currentProgress,
          totalPoints: newTotalPoints,
          level: newLevel,
          experiencePoints: newTotalPoints,
          experienceToNextLevel:
            LEVEL_THRESHOLDS[newLevel] ||
            LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1],
        };

        saveUserData(updatedProgress);
        showNotification('points', { points, reason, leveledUp, newLevel });

        if (leveledUp) {
          checkLevelAchievements(newLevel);
        }
        
        return updatedProgress;
      });
    },
    [calculateLevel, saveUserData, showNotification, checkLevelAchievements]
  );

  const updateStreak = useCallback(
    async (streakType: 'login' | 'learning') => {
      setUserProgress(currentProgress => {
        if (!currentProgress) return null;

        const today = getTodayDateString();
        const yesterday = getYesterdayDateString();
        
        const lastDate =
          streakType === 'login'
            ? currentProgress.streaks.lastLoginDate
            : currentProgress.streaks.lastLearningDate;

        let newStreak = 1;

        if (lastDate) {
          if (lastDate === yesterday) {
            newStreak =
              (streakType === 'login'
                ? currentProgress.streaks.loginStreak
                : currentProgress.streaks.learningStreak) + 1;
          } else if (lastDate === today) {
            return currentProgress;
          }
        }

        const updatedProgress: UserProgress = {
          ...currentProgress,
          streaks: {
            ...currentProgress.streaks,
            [streakType === 'login' ? 'loginStreak' : 'learningStreak']:
              newStreak,
            [streakType === 'login' ? 'lastLoginDate' : 'lastLearningDate']: today, 
          },
        };

        saveUserData(updatedProgress);
        checkStreakAchievements(streakType, newStreak);
        
        return updatedProgress;
      });
    },
    [saveUserData, checkStreakAchievements]
  );

  // FIX: Change currentStats type to UserStats for type safety
  const checkAchievements = useCallback(
    async (eventType: string, currentStats: UserStats): Promise<Achievement[]> => {
      if (!userProgress) return [];
      
      const newAchievements: Achievement[] = [];

      for (const achievementDef of Object.values(ACHIEVEMENT_DEFINITIONS)) {
        if (userProgress.badges.some((b: Badge) => b.id === achievementDef.id)) {
          continue;
        }

        let progress = 0;

        switch (achievementDef.id) {
          case 'first_risk_assessment':
            progress = currentStats.assessmentsCompleted;
            break;
          case 'tools_explorer':
            progress = currentStats.toolsUsed.length;
            break;
          case 'portfolio_creator':
            progress = currentStats.portfoliosCreated;
            break;
          case 'login_streak_7':
            // Direct access is safe now because UserProgress is available via closure
            progress = userProgress.streaks.loginStreak; 
            break;
          case 'esg_user':
            progress = currentStats.toolsUsed.includes('esg-screener') ? 1 : 0;
            break;
          default:
            continue;
        }

        if (progress >= achievementDef.target) {
          // Assuming achievementDef.reward is a complete definition object
          const reward = achievementDef.reward as { badge?: Badge, points?: number };
          const badge = reward.badge || BADGE_DEFINITIONS[achievementDef.id];
          
          if (!badge) {
            console.error(`Badge not found for achievement: ${achievementDef.id}`);
            continue;
          }

          const achievement: Achievement = {
            id: achievementDef.id,
            name: achievementDef.name,
            title: achievementDef.title,
            description: achievementDef.description,
            points: reward.points || badge.points || 0,
            reward: reward.points || badge.points || 0,
            badge: badge,
            unlockedAt: new Date().toISOString(),
          };

          newAchievements.push(achievement);
        }
      }
      return newAchievements;
    },
    [userProgress]
  );
  
  const trackEvent = useCallback(
    async (eventType: string, data: Record<string, unknown> = {}) => {
      if (!userProgress) return;
      
      try {
        // --- 1. Synchronously Calculate Next State (Stat Updates) ---
        
        const updatedStats: UserStats = {
          ...userProgress.stats,
          // Direct access is safe after UserStats is fixed
          pageViews: { ...userProgress.stats.pageViews }, 
          events: { ...userProgress.stats.events }
        };
        
        // Handle different event types
        if (eventType === 'page_view') {
          const page = (data.page as string) || 'unknown';
          updatedStats.pageViews[page] = (updatedStats.pageViews[page] || 0) + 1;
        } else {
           // Track custom events
           updatedStats.events[eventType] = (updatedStats.events[eventType] || 0) + 1;
        }

        let updatedProgress: UserProgress = {
          ...userProgress,
          stats: updatedStats,
          lastActivity: new Date().toISOString(), 
        };
        
        // --- 2. Asynchronously Check Achievements ---
        const newAchievements = await checkAchievements(eventType, updatedStats);
        
        // --- 3. Synchronously Update State and Asynchronously Save/Unlock ---
        
        if (newAchievements.length > 0) {
          const totalAchievementPoints = newAchievements.reduce((sum, a) => sum + (a.points || 0), 0);
          
          updatedProgress = {
            ...updatedProgress,
            totalPoints: updatedProgress.totalPoints + totalAchievementPoints
          };
          
          setUserProgress(updatedProgress);
          await saveUserData(updatedProgress);

          for (const achievement of newAchievements) {
              if (achievement.badge?.id) {
                  await unlockBadge(achievement.badge.id);
              }

              // FIX: Cast to match showNotification's type (Error 2345 fix)
              showNotification('achievement', achievement as unknown as Record<string, unknown>); 
          }
        } else {
             setUserProgress(updatedProgress);
             await saveUserData(updatedProgress);
        }

      } catch (error) {
        console.error('Error tracking event:', error);
      }
    },
    [userProgress, saveUserData, checkAchievements, showNotification, unlockBadge] 
  );

  // --- Data Loading Effect ---

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
            const progress = response.data.data as UserProgress;
            setUserProgress(progress);
          } else {
            // Initialize new user progress (now safe with fixed UserProgress/UserStats)
            const initialProgress: UserProgress = { 
              userId,
              totalPoints: 0,
              level: 1,
              experiencePoints: 0,
              experienceToNextLevel: LEVEL_THRESHOLDS[0] || 100,
              badges: [],
              streaks: {
                loginStreak: 0,
                learningStreak: 0,
                lastLoginDate: '',
                lastLearningDate: ''
              },
              stats: {
                toolsUsed: [],
                assessmentsCompleted: 0,
                portfoliosCreated: 0,
                educationModulesCompleted: 0,
                pageViews: {}, 
                events: {}
              },
              lastActivity: new Date().toISOString()
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

  // --- Return ---

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