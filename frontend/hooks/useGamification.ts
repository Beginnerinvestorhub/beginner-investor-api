// Gamification hook for managing user progress, badges, and achievements

import { useState, useEffect, useCallback } from 'react';
import { 
  UserProgress, 
  Badge, 
  Achievement, 
  GamificationEvent,
  AchievementType 
} from '../types/gamification';
import { 
  BADGE_DEFINITIONS, 
  LEVEL_THRESHOLDS, 
  POINT_VALUES,
  ACHIEVEMENT_DEFINITIONS 
} from '../config/badges';
import { useAuth } from './useAuth';
import axios from 'axios';

interface UseGamificationReturn {
  userProgress: UserProgress | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  trackEvent: (eventType: string, data?: any) => Promise<void>;
  awardPoints: (points: number, reason: string) => Promise<void>;
  unlockBadge: (badgeId: string) => Promise<void>;
  updateStreak: (streakType: 'login' | 'learning') => Promise<void>;
  
  // Utilities
  calculateLevel: (totalPoints: number) => number;
  getProgressToNextLevel: (totalPoints: number) => { current: number; next: number; progress: number };
  checkAchievements: (eventType: string, currentStats: any) => Promise<Achievement[]>;
  
  // UI Helpers
  showNotification: (type: 'badge' | 'achievement' | 'points', data: any) => void;
}

export function useGamification(userId: string): UseGamificationReturn {
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // API base URL
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

  // Create axios instance with auth headers
  const createApiClient = useCallback(async () => {
    if (!user) return null;
    const token = await user.getIdToken();
    return axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
  }, [user, API_BASE_URL]);

  // Load data from backend API
  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  const loadUserData = async () => {
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
          experiencePoints: 0,
          experienceToNextLevel: LEVEL_THRESHOLDS[1],
          badges: [],
          streaks: {
            loginStreak: 0,
            learningStreak: 0
          },
          achievements: [],
          stats: {
            toolsUsed: [],
            assessmentsCompleted: 0,
            portfoliosCreated: 0,
            educationModulesCompleted: 0,
            totalTimeSpent: 0,
            averageSessionTime: 0,
            favoriteTools: []
          }
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
  };

  const saveUserData = async (progress: UserProgress) => {
    try {
      const apiClient = await createApiClient();
      if (apiClient) {
        await apiClient.post('/api/gamification/save-user-data', progress);
      }
      
      // Keep localStorage as backup
      try {
        localStorage.setItem(`gamification_${userId}`, JSON.stringify(progress));
      } catch (error) {
        console.error('Error saving user data to localStorage:', error);
      }
    } catch (err) {
      console.error('Failed to save user progress:', err);
    }
  };

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

  const getProgressToNextLevel = useCallback((totalPoints: number) => {
    const currentLevel = calculateLevel(totalPoints);
    const currentThreshold = LEVEL_THRESHOLDS[currentLevel - 1] || 0;
    const nextThreshold = LEVEL_THRESHOLDS[currentLevel] || LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];
    
    const progress = nextThreshold > currentThreshold 
      ? ((totalPoints - currentThreshold) / (nextThreshold - currentThreshold)) * 100
      : 100;

    return {
      current: currentLevel,
      next: currentLevel + 1,
      progress: Math.min(progress, 100)
    };
  }, [calculateLevel]);

  const awardPoints = useCallback(async (points: number, reason: string) => {
    if (!userProgress) return;

    const newTotalPoints = userProgress.totalPoints + points;
    const newLevel = calculateLevel(newTotalPoints);
    const leveledUp = newLevel > userProgress.level;

    const updatedProgress: UserProgress = {
      ...userProgress,
      totalPoints: newTotalPoints,
      level: newLevel,
      experiencePoints: newTotalPoints,
      experienceToNextLevel: LEVEL_THRESHOLDS[newLevel] || LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1]
    };

    setUserProgress(updatedProgress);
    await saveUserData(updatedProgress);

    // Show notification
    showNotification('points', { points, reason, leveledUp, newLevel });

    // Check for level-based achievements
    if (leveledUp) {
      await checkLevelAchievements(newLevel, updatedProgress);
    }
  }, [userProgress, calculateLevel]);

  const unlockBadge = useCallback(async (badgeId: string) => {
    if (!userProgress) return;

    const badgeDefinition = BADGE_DEFINITIONS[badgeId];
    if (!badgeDefinition) return;

    // Check if badge is already unlocked
    if (userProgress.badges.some(b => b.id === badgeId)) return;

    const newBadge: Badge = {
      ...badgeDefinition,
      isUnlocked: true,
      unlockedAt: new Date()
    };

    const updatedProgress: UserProgress = {
      ...userProgress,
      badges: [...userProgress.badges, newBadge],
      totalPoints: userProgress.totalPoints + badgeDefinition.points
    };

    setUserProgress(updatedProgress);
    await saveUserData(updatedProgress);

    // Show notification
    showNotification('badge', newBadge);
  }, [userProgress]);

  const updateStreak = useCallback(async (streakType: 'login' | 'learning') => {
    if (!userProgress) return;

    const today = new Date().toDateString();
    const lastDate = streakType === 'login' 
      ? userProgress.streaks.lastLoginDate?.toDateString()
      : userProgress.streaks.lastLearningDate?.toDateString();

    let newStreak = 1;
    
    if (lastDate) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      if (lastDate === yesterday.toDateString()) {
        // Consecutive day
        newStreak = (streakType === 'login' 
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
        [streakType === 'login' ? 'loginStreak' : 'learningStreak']: newStreak,
        [streakType === 'login' ? 'lastLoginDate' : 'lastLearningDate']: new Date()
      }
    };

    setUserProgress(updatedProgress);
    await saveUserData(updatedProgress);

    // Check streak achievements
    await checkStreakAchievements(streakType, newStreak, updatedProgress);
  }, [userProgress]);

  const checkAchievements = useCallback(async (eventType: string, currentStats: any): Promise<Achievement[]> => {
    if (!userProgress) return [];

    const newAchievements: Achievement[] = [];

    // Check each achievement definition
    Object.values(ACHIEVEMENT_DEFINITIONS).forEach(achievementDef => {
      // Skip if already completed
      if (userProgress.achievements.some(a => a.id === achievementDef.id && a.isCompleted)) {
        return;
      }

      let progress = 0;
      
      // Calculate progress based on achievement type
      switch (achievementDef.id) {
        case 'first_risk_assessment':
          progress = currentStats.assessmentsCompleted || 0;
          break;
        case 'tools_explorer':
          progress = (currentStats.toolsUsed || []).length;
          break;
        case 'portfolio_creator':
          progress = currentStats.portfoliosCreated || 0;
          break;
        case 'login_streak_7':
          progress = userProgress.streaks.loginStreak;
          break;
        case 'esg_user':
          progress = (currentStats.toolsUsed || []).includes('esg-screener') ? 1 : 0;
          break;
      }

      const isCompleted = progress >= achievementDef.target;
      
      if (isCompleted) {
        const achievement: Achievement = {
          id: achievementDef.id,
          name: achievementDef.name,
          description: achievementDef.description,
          type: achievementDef.id as AchievementType,
          progress: achievementDef.target,
          target: achievementDef.target,
          isCompleted: true,
          completedAt: new Date(),
          reward: achievementDef.reward
        };

        newAchievements.push(achievement);
      }
    });

    return newAchievements;
  }, [userProgress]);

  const checkLevelAchievements = async (newLevel: number, progress: UserProgress) => {
    // Check for level-based badge unlocks
    if (newLevel >= 10) {
      await unlockBadge('PLATINUM_INVESTOR');
    }
  };

  const checkStreakAchievements = async (streakType: string, streak: number, progress: UserProgress) => {
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

  const trackEvent = useCallback(async (eventType: string, data: any = {}) => {
    if (!userProgress) return;

    let pointsToAward = 0;
    let updatedStats = { ...userProgress.stats };

    // Award points and update stats based on event type
    switch (eventType) {
      case 'COMPLETE_RISK_ASSESSMENT':
        pointsToAward = POINT_VALUES.COMPLETE_RISK_ASSESSMENT;
        updatedStats.assessmentsCompleted += 1;
        break;
      
      case 'USE_TOOL':
        const toolId = data.toolId;
        const isFirstTime = !updatedStats.toolsUsed.includes(toolId);
        pointsToAward = isFirstTime ? POINT_VALUES.USE_TOOL_FIRST_TIME : POINT_VALUES.USE_TOOL_REPEAT;
        
        if (isFirstTime) {
          updatedStats.toolsUsed.push(toolId);
        }
        break;
      
      case 'CREATE_PORTFOLIO':
        pointsToAward = POINT_VALUES.CREATE_PORTFOLIO;
        updatedStats.portfoliosCreated += 1;
        break;
      
      case 'DAILY_LOGIN':
        pointsToAward = POINT_VALUES.DAILY_LOGIN;
        await updateStreak('login');
        break;
      
      case 'COMPLETE_EDUCATION':
        pointsToAward = POINT_VALUES.COMPLETE_EDUCATION_MODULE;
        updatedStats.educationModulesCompleted += 1;
        await updateStreak('learning');
        break;
    }

    // Update user progress with new stats
    const updatedProgress: UserProgress = {
      ...userProgress,
      stats: updatedStats
    };
    
    setUserProgress(updatedProgress);
    await saveUserData(updatedProgress);

    // Award points
    if (pointsToAward > 0) {
      await awardPoints(pointsToAward, eventType);
    }

    // Check for achievements
    const newAchievements = await checkAchievements(eventType, updatedStats);
    
    // Process new achievements
    for (const achievement of newAchievements) {
      const finalProgress: UserProgress = {
        ...updatedProgress,
        achievements: [...updatedProgress.achievements, achievement]
      };
      
      setUserProgress(finalProgress);
      await saveUserData(finalProgress);
      
      // Award achievement rewards
      if (achievement.reward.points > 0) {
        await awardPoints(achievement.reward.points, `Achievement: ${achievement.name}`);
      }
      
      if (achievement.reward.badge) {
        await unlockBadge(achievement.reward.badge);
      }
      
      showNotification('achievement', achievement);
    }
  }, [userProgress, awardPoints, unlockBadge, updateStreak, checkAchievements]);

  const showNotification = useCallback((type: 'badge' | 'achievement' | 'points', data: any) => {
    // In a real app, this would trigger a toast notification or modal
    console.log(`🎉 Gamification Notification [${type.toUpperCase()}]:`, data);
    
    // You can integrate with react-hot-toast or another notification system here
    // Example: toast.success(`🎉 ${data.name} unlocked!`);
  }, []);

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
    showNotification
  };
}
