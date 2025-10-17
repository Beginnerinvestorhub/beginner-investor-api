// --- Corrected ../types/gamification.ts ---

export interface Badge {
  points: number;
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  isUnlocked: boolean; // Required property
  unlockedAt?: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface StreakData {
  loginStreak: number;
  learningStreak: number;
  lastLoginDate?: string;
  lastLearningDate?: string;
}

export interface UserStats {
  assessmentsCompleted: number;
  portfoliosCreated: number;
  toolsUsed: string[];
  educationModulesCompleted: number;
  
  // FIXES for TypeScript Errors (2339)
  pageViews: Record<string, number>; // Required for tracking page views
  events: Record<string, number>;     // Required for tracking custom events
}

export interface UserProgress {
  totalPoints: number;
  level: number;
  badges: Badge[];
  streaks: StreakData;
  stats: UserStats;
  
  // FIXES for TypeScript Errors (2353)
  userId: string;
  experiencePoints: number;
  experienceToNextLevel: number;
  lastActivity: string; // Required for tracking last activity date
}

export interface Achievement {
  name: string;
  reward: string | number | Badge;
  id: string;
  title: string;
  description: string;
  points: number;
  badge?: Badge;
  unlockedAt?: string;
}

export enum BadgeCategory {
  EDUCATION = 'education',
  INVESTMENT = 'investment',
  ENGAGEMENT = 'engagement',
  MILESTONE = 'milestone',
  SOCIAL = 'social'
}

export enum BadgeRarity {
  COMMON = 'common',
  RARE = 'rare',
  EPIC = 'epic',
  LEGENDARY = 'legendary'
}