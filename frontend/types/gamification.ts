export interface Badge {

  points: number;
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  isUnlocked: boolean;
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
}

export interface UserProgress {
  totalPoints: number;
  level: number;
  badges: Badge[];
  streaks: StreakData;
  stats: UserStats;
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

export interface LeaderboardEntry {
  userId: string;
  username: string;
  level: number;
  totalPoints: number;
  badgesCount: number;
  avatar?: string;
}
