// Simplified gamification hook with backend API integration
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import axios from 'axios';

// Types
interface UserProgress {
  userId: string;
  totalPoints: number;
  level: number;
  experiencePoints: number;
  experienceToNextLevel: number;
  loginStreak: number;
  learningStreak: number;
  lastLoginDate?: Date;
  lastLearningDate?: Date;
}

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  points: number;
  rarity: string;
  isUnlocked: boolean;
  unlockedAt?: Date;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  type: string;
  progress: number;
  target: number;
  isCompleted: boolean;
  completedAt?: Date;
  rewardPoints: number;
  rewardBadgeId?: string;
}

interface GamificationNotification {
  id: string;
  type: 'badge' | 'achievement' | 'points' | 'level';
  title: string;
  message: string;
  badge?: Badge;
  points?: number;
  timestamp: Date;
}

interface UseGamificationReturn {
  userProgress: UserProgress | null;
  badges: Badge[];
  achievements: Achievement[];
  notifications: GamificationNotification[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  trackEvent: (eventType: string, eventData?: any) => Promise<void>;
  awardPoints: (points: number, reason: string) => Promise<void>;
  unlockBadge: (badgeId: string) => Promise<void>;
  updateStreak: (streakType: 'login' | 'learning') => Promise<void>;
  dismissNotification: (notificationId: string) => void;
  refreshData: () => Promise<void>;
}

export const useGamificationAPI = (): UseGamificationReturn => {
  const { user } = useAuth();
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [notifications, setNotifications] = useState<GamificationNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // API configuration
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

  // Create authenticated API client
  const createApiClient = useCallback(async () => {
    if (!user) {
      throw new Error('User not authenticated');
    }
    const token = await user.getIdToken();
    return axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
  }, [user, API_BASE_URL]);

  // Load user gamification data from API
  const loadUserData = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const apiClient = await createApiClient();
      if (!apiClient) {
        setError('Authentication required');
        return;
      }
      const response = await apiClient.get('/api/gamification/progress');
      
      if (response.data) {
        const { progress, badges: userBadges, achievements: userAchievements } = response.data;
        
        setUserProgress({
          ...progress,
          lastLoginDate: progress.lastLoginDate ? new Date(progress.lastLoginDate) : undefined,
          lastLearningDate: progress.lastLearningDate ? new Date(progress.lastLearningDate) : undefined,
        });
        
        setBadges(userBadges || []);
        setAchievements(userAchievements || []);
      }
    } catch (err: any) {
      console.error('Error loading gamification data:', err);
      setError(err.response?.data?.error || 'Failed to load gamification data');
      
      // Fallback to localStorage if available
      try {
        const savedData = localStorage.getItem(`gamification_${user.uid}`);
        if (savedData) {
          const data = JSON.parse(savedData);
          setUserProgress(data.progress || null);
          setBadges(data.badges || []);
          setAchievements(data.achievements || []);
        }
      } catch (localError) {
        console.error('Error loading from localStorage:', localError);
      }
    } finally {
      setIsLoading(false);
    }
  }, [user, createApiClient]);

  // Save data to localStorage as backup
  const saveToLocalStorage = useCallback(() => {
    if (!user || !userProgress) return;
    
    try {
      const data = {
        progress: userProgress,
        badges,
        achievements,
        timestamp: new Date().toISOString(),
      };
      localStorage.setItem(`gamification_${user.uid}`, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }, [user, userProgress, badges, achievements]);

  // Track gamification event
  const trackEvent = useCallback(async (eventType: string, eventData?: any) => {
    if (!user) {
      console.warn('Cannot track event: user not authenticated');
      return;
    }

    try {
      const apiClient = await createApiClient();
      if (!apiClient) return;
      const response = await apiClient.post('/api/gamification/track-event', {
        eventType,
        eventData: eventData || {},
      });

      if (response.data?.success && response.data?.data) {
        const { progress, badges: updatedBadges, achievements: updatedAchievements } = response.data.data;
        
        // Check for level up
        const leveledUp = progress.level > (userProgress?.level || 0);
        const pointsAwarded = progress.totalPoints - (userProgress?.totalPoints || 0);
        
        // Update state
        setUserProgress({
          ...progress,
          lastLoginDate: progress.lastLoginDate ? new Date(progress.lastLoginDate) : undefined,
          lastLearningDate: progress.lastLearningDate ? new Date(progress.lastLearningDate) : undefined,
        });
        setBadges(updatedBadges || []);
        setAchievements(updatedAchievements || []);

        // Check for newly unlocked badges
        const newlyUnlocked = updatedBadges?.filter((badge: Badge) => 
          badge.isUnlocked && !badges.find(b => b.id === badge.id && b.isUnlocked)
        ) || [];

        // Show notifications
        if (leveledUp) {
          showNotification({
            id: `level-up-${Date.now()}`,
            type: 'level',
            title: 'Level Up!',
            message: `Congratulations! You reached Level ${progress.level}!`,
            timestamp: new Date(),
          });
        }

        if (pointsAwarded > 0) {
          showNotification({
            id: `points-${Date.now()}`,
            type: 'points',
            title: 'Points Earned!',
            message: `You earned ${pointsAwarded} points!`,
            points: pointsAwarded,
            timestamp: new Date(),
          });
        }

        newlyUnlocked.forEach((badge: Badge) => {
          showNotification({
            id: `badge-${badge.id}-${Date.now()}`,
            type: 'badge',
            title: 'Badge Unlocked!',
            message: `You earned the "${badge.name}" badge!`,
            badge,
            points: badge.points,
            timestamp: new Date(),
          });
        });

        // Save to localStorage as backup
        saveToLocalStorage();
      }
    } catch (err: any) {
      console.error('Error tracking event:', err);
      setError(err.response?.data?.error || 'Failed to track event');
    }
  }, [user, createApiClient, userProgress, badges, saveToLocalStorage]);

  // Award points manually
  const awardPoints = useCallback(async (points: number, reason: string) => {
    if (!user) return;

    try {
      const apiClient = await createApiClient();
      if (!apiClient) throw new Error('Failed to create API client');
      const response = await apiClient.post('/api/gamification/award-points', {
        points,
        reason,
      });

      if (response.data?.success) {
        const { newTotalPoints, leveledUp, newLevel } = response.data.data;
        
        setUserProgress(prev => prev ? {
          ...prev,
          totalPoints: newTotalPoints,
          level: newLevel,
          experiencePoints: newTotalPoints,
        } : null);

        if (leveledUp) {
          showNotification({
            id: `level-up-${Date.now()}`,
            type: 'level',
            title: 'Level Up!',
            message: `Congratulations! You reached Level ${newLevel}!`,
            timestamp: new Date(),
          });
        }

        showNotification({
          id: `points-${Date.now()}`,
          type: 'points',
          title: 'Points Awarded!',
          message: `You earned ${points} points for ${reason}!`,
          points,
          timestamp: new Date(),
        });
      }
    } catch (err: any) {
      console.error('Error awarding points:', err);
      setError(err.response?.data?.error || 'Failed to award points');
    }
  }, [user, createApiClient]);

  // Unlock badge manually
  const unlockBadge = useCallback(async (badgeId: string) => {
    if (!user) return;

    try {
      const apiClient = await createApiClient();
      if (!apiClient) return;
      const response = await apiClient.post('/api/gamification/unlock-badge', {
        badgeId,
      });

      if (response.data?.success) {
        // Refresh data to get updated badges
        await loadUserData();
        
        const badge = badges.find(b => b.id === badgeId);
        if (badge) {
          showNotification({
            id: `badge-${badgeId}-${Date.now()}`,
            type: 'badge',
            title: 'Badge Unlocked!',
            message: `You earned the "${badge.name}" badge!`,
            badge,
            points: badge.points,
            timestamp: new Date(),
          });
        }
      }
    } catch (err: any) {
      console.error('Error unlocking badge:', err);
      setError(err.response?.data?.error || 'Failed to unlock badge');
    }
  }, [user, createApiClient, badges, loadUserData]);

  // Update streak
  const updateStreak = useCallback(async (streakType: 'login' | 'learning') => {
    if (!user) return;

    try {
      const apiClient = await createApiClient();
      if (!apiClient) return;
      const response = await apiClient.put('/api/gamification/streak', {
        streakType,
      });

      if (response.data?.success) {
        const { newStreak } = response.data;
        
        setUserProgress(prev => prev ? {
          ...prev,
          [streakType === 'login' ? 'loginStreak' : 'learningStreak']: newStreak,
        } : null);

        // Check for streak milestones
        if (newStreak === 7 || newStreak === 30 || newStreak % 50 === 0) {
          showNotification({
            id: `streak-${streakType}-${newStreak}-${Date.now()}`,
            type: 'achievement',
            title: 'Streak Milestone!',
            message: `Amazing! You've maintained a ${newStreak}-day ${streakType} streak!`,
            timestamp: new Date(),
          });
        }
      }
    } catch (err: any) {
      console.error('Error updating streak:', err);
      setError(err.response?.data?.error || 'Failed to update streak');
    }
  }, [user, createApiClient]);

  // Show notification
  const showNotification = useCallback((notification: GamificationNotification) => {
    setNotifications(prev => [notification, ...prev.slice(0, 4)]); // Keep max 5 notifications
    
    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      dismissNotification(notification.id);
    }, 5000);
  }, []);

  // Dismiss notification
  const dismissNotification = useCallback((notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  }, []);

  // Refresh data
  const refreshData = useCallback(async () => {
    await loadUserData();
  }, [loadUserData]);

  // Load data on mount and when user changes
  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  // Save to localStorage when data changes
  useEffect(() => {
    if (!isLoading && userProgress) {
      saveToLocalStorage();
    }
  }, [userProgress, badges, achievements, isLoading, saveToLocalStorage]);

  return {
    userProgress,
    badges,
    achievements,
    notifications,
    isLoading,
    error,
    trackEvent,
    awardPoints,
    unlockBadge,
    updateStreak,
    dismissNotification,
    refreshData,
  };
};
