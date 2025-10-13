// Badge definitions and configuration for the investment platform

import { Badge, BadgeCategory, BadgeRarity } from '../types/gamification';

export const BADGE_DEFINITIONS: Record<
  string,
  Omit<Badge, 'isUnlocked' | 'unlockedAt'>
> = {
  // Education Badges
  FIRST_STEPS: {
    id: 'first_steps',
    name: 'First Steps',
    description: 'Complete your first risk assessment',
    icon: '🎯',
    category: BadgeCategory.EDUCATION,
    points: 100,
    rarity: BadgeRarity.COMMON,
  },

  KNOWLEDGE_SEEKER: {
    id: 'knowledge_seeker',
    name: 'Knowledge Seeker',
    description: 'Use 5 different investment tools',
    icon: '📚',
    category: BadgeCategory.EDUCATION,
    points: 250,
    rarity: BadgeRarity.RARE,
  },

  INVESTMENT_GURU: {
    id: 'investment_guru',
    name: 'Investment Guru',
    description: 'Master all investment tools',
    icon: '🧠',
    category: BadgeCategory.EDUCATION,
    points: 500,
    rarity: BadgeRarity.EPIC,
  },

  // Investment Badges
  PORTFOLIO_BUILDER: {
    id: 'portfolio_builder',
    name: 'Portfolio Builder',
    description: 'Create your first portfolio',
    icon: '💼',
    category: BadgeCategory.INVESTMENT,
    points: 150,
    rarity: BadgeRarity.COMMON,
  },

  DIVERSIFICATION_MASTER: {
    id: 'diversification_master',
    name: 'Diversification Master',
    description: 'Create a well-diversified portfolio',
    icon: '📊',
    category: BadgeCategory.INVESTMENT,
    points: 300,
    rarity: BadgeRarity.RARE,
  },

  ESG_CHAMPION: {
    id: 'esg_champion',
    name: 'ESG Champion',
    description: 'Use ESG screening for sustainable investing',
    icon: '🌱',
    category: BadgeCategory.INVESTMENT,
    points: 200,
    rarity: BadgeRarity.RARE,
  },

  FRACTIONAL_PIONEER: {
    id: 'fractional_pioneer',
    name: 'Fractional Pioneer',
    description: 'Calculate fractional shares for affordable investing',
    icon: '🔢',
    category: BadgeCategory.INVESTMENT,
    points: 150,
    rarity: BadgeRarity.COMMON,
  },

  // Engagement Badges
  DAILY_VISITOR: {
    id: 'daily_visitor',
    name: 'Daily Visitor',
    description: 'Log in for 7 consecutive days',
    icon: '📅',
    category: BadgeCategory.ENGAGEMENT,
    points: 200,
    rarity: BadgeRarity.RARE,
  },

  WEEKLY_WARRIOR: {
    id: 'weekly_warrior',
    name: 'Weekly Warrior',
    description: 'Maintain a 30-day login streak',
    icon: '🔥',
    category: BadgeCategory.ENGAGEMENT,
    points: 400,
    rarity: BadgeRarity.EPIC,
  },

  LEARNING_STREAK: {
    id: 'learning_streak',
    name: 'Learning Streak',
    description: 'Complete learning activities for 14 days',
    icon: '⚡',
    category: BadgeCategory.ENGAGEMENT,
    points: 350,
    rarity: BadgeRarity.EPIC,
  },

  // Milestone Badges
  CENTURY_CLUB: {
    id: 'century_club',
    name: 'Century Club',
    description: 'Earn 1,000 total points',
    icon: '💯',
    category: BadgeCategory.MILESTONE,
    points: 100,
    rarity: BadgeRarity.RARE,
  },

  PLATINUM_INVESTOR: {
    id: 'platinum_investor',
    name: 'Platinum Investor',
    description: 'Reach Level 10',
    icon: '💎',
    category: BadgeCategory.MILESTONE,
    points: 1000,
    rarity: BadgeRarity.LEGENDARY,
  },

  EARLY_ADOPTER: {
    id: 'early_adopter',
    name: 'Early Adopter',
    description: 'One of the first 100 users',
    icon: '🚀',
    category: BadgeCategory.MILESTONE,
    points: 500,
    rarity: BadgeRarity.LEGENDARY,
  },

  // Social Badges
  COMMUNITY_HELPER: {
    id: 'community_helper',
    name: 'Community Helper',
    description: 'Share your achievements',
    icon: '🤝',
    category: BadgeCategory.SOCIAL,
    points: 150,
    rarity: BadgeRarity.COMMON,
  },

  REFERRAL_CHAMPION: {
    id: 'referral_champion',
    name: 'Referral Champion',
    description: 'Invite 5 friends to join',
    icon: '👥',
    category: BadgeCategory.SOCIAL,
    points: 300,
    rarity: BadgeRarity.RARE,
  },
};

// Level progression configuration
export const LEVEL_THRESHOLDS = [
  0, // Level 1
  100, // Level 2
  250, // Level 3
  450, // Level 4
  700, // Level 5
  1000, // Level 6
  1350, // Level 7
  1750, // Level 8
  2200, // Level 9
  2700, // Level 10
  3250, // Level 11
  3850, // Level 12
  4500, // Level 13
  5200, // Level 14
  5950, // Level 15
  6750, // Level 16
  7600, // Level 17
  8500, // Level 18
  9450, // Level 19
  10500, // Level 20
];

// Points awarded for different actions
export const POINT_VALUES = {
  COMPLETE_RISK_ASSESSMENT: 50,
  USE_TOOL_FIRST_TIME: 25,
  USE_TOOL_REPEAT: 10,
  CREATE_PORTFOLIO: 75,
  DAILY_LOGIN: 10,
  WEEKLY_LOGIN_BONUS: 50,
  COMPLETE_EDUCATION_MODULE: 30,
  SHARE_ACHIEVEMENT: 20,
  REFER_FRIEND: 100,
  MONTHLY_ACTIVE_BONUS: 200,
};

// Achievement definitions
export const ACHIEVEMENT_DEFINITIONS = {
  FIRST_RISK_ASSESSMENT: {
    id: 'first_risk_assessment',
    name: 'Risk Assessment Complete',
    description: 'Complete your first risk assessment',
    target: 1,
    reward: { points: 100, badge: 'FIRST_STEPS' },
  },

  TOOLS_EXPLORER: {
    id: 'tools_explorer',
    name: 'Tools Explorer',
    description: 'Try 5 different investment tools',
    target: 5,
    reward: { points: 250, badge: 'KNOWLEDGE_SEEKER' },
  },

  PORTFOLIO_CREATOR: {
    id: 'portfolio_creator',
    name: 'Portfolio Creator',
    description: 'Create your first portfolio',
    target: 1,
    reward: { points: 150, badge: 'PORTFOLIO_BUILDER' },
  },

  LOGIN_STREAK_7: {
    id: 'login_streak_7',
    name: '7-Day Streak',
    description: 'Log in for 7 consecutive days',
    target: 7,
    reward: { points: 200, badge: 'DAILY_VISITOR' },
  },

  ESG_USER: {
    id: 'esg_user',
    name: 'ESG Screening',
    description: 'Use ESG screening tool',
    target: 1,
    reward: { points: 200, badge: 'ESG_CHAMPION' },
  },
};

// Rarity colors for UI
export const RARITY_COLORS = {
  [BadgeRarity.COMMON]: {
    bg: 'bg-gray-100',
    text: 'text-gray-800',
    border: 'border-gray-300',
    glow: 'shadow-gray-200',
  },
  [BadgeRarity.RARE]: {
    bg: 'bg-blue-100',
    text: 'text-blue-800',
    border: 'border-blue-300',
    glow: 'shadow-blue-200',
  },
  [BadgeRarity.EPIC]: {
    bg: 'bg-purple-100',
    text: 'text-purple-800',
    border: 'border-purple-300',
    glow: 'shadow-purple-200',
  },
  [BadgeRarity.LEGENDARY]: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-800',
    border: 'border-yellow-300',
    glow: 'shadow-yellow-200',
  },
};
