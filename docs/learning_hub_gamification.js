// Learning Hub with Gamification + AI Behavioral Nudge Integration
// Complete AI-Powered Learning & Behavioral System

// 1. GAMIFICATION SYSTEM CORE
class GamificationEngine {
  constructor(redisClient, database) {
    this.redis = redisClient;
    this.db = database;
    this.pointsSystem = {
      lesson_completed: 10,
      quiz_passed: 15,
      simulation_run: 5,
      daily_login: 2,
      streak_bonus: 5,
      perfect_quiz: 25,
      portfolio_created: 20,
      risk_assessment: 8,
      behavioral_nudge_acted: 12,
      nudge_goal_achieved: 30,
      good_decision_made: 20,
      bias_overcome: 25
    };
  }

  // Award points with streak multipliers
  async awardPoints(userId, action, metadata = {}) {
    const basePoints = this.pointsSystem[action] || 0;
    const userStreak = await this.getUserStreak(userId);
    
    // Streak bonus (max 3x multiplier)
    const streakMultiplier = Math.min(1 + (userStreak / 10), 3);
    const totalPoints = Math.floor(basePoints * streakMultiplier);
    
    // Update user points
    const userKey = `user:${userId}:points`;
    const currentPoints = await this.redis.get(userKey) || 0;
    const newTotal = parseInt(currentPoints) + totalPoints;
    
    await this.redis.setEx(userKey, 86400 * 30, newTotal); // Cache for 30 days
    
    // Track achievement
    await this.checkAchievements(userId, action, newTotal, metadata);
    
    // Update database
    await this.db.query(`
      INSERT INTO user_points (user_id, action, points, streak_multiplier, created_at)
      VALUES ($1, $2, $3, $4, NOW())
    `, [userId, action, totalPoints, streakMultiplier]);
    
    return { points: totalPoints, totalPoints: newTotal, streakMultiplier };
  }

  // Level calculation with behavioral bonuses
  async getUserLevel(userId) {
    const cacheKey = `user:${userId}:level`;
    const cached = await this.redis.get(cacheKey);
    
    if (cached) return JSON.parse(cached);
    
    const totalPoints = await this.redis.get(`user:${userId}:points`) || 0;
    const behavioralBonus = await this.getBehavioralBonus(userId);
    const adjustedPoints = parseInt(totalPoints) + behavioralBonus;
    
    const level = Math.floor(adjustedPoints / 100) + 1; // 100 points per level
    const progressToNext = adjustedPoints % 100;
    
    const levelData = {
      level,
      points: parseInt(totalPoints),
      behavioralBonus,
      totalPoints: adjustedPoints,
      progressToNext,
      pointsNeeded: 100 - progressToNext
    };
    
    await this.redis.setEx(cacheKey, 3600, JSON.stringify(levelData)); // Cache for 1 hour
    return levelData;
  }

  // Behavioral bonus calculation
  async getBehavioralBonus(userId) {
    const behavioralData = await this.redis.get(`user:${userId}:behavioral_score`);
    if (!behavioralData) return 0;
    
    const { goodDecisions, biasesOvercome, goalsAchieved } = JSON.parse(behavioralData);
    return (goodDecisions * 2) + (biasesOvercome * 5) + (goalsAchieved * 10);
  }
}

// 2. AI BEHAVIORAL NUDGE ENGINE
class BehavioralNudgeEngine {
  constructor(openAIClient, redisClient, gamificationEngine) {
    this.openai = openAIClient;
    this.redis = redisClient;
    this.gamification = gamificationEngine;
    
    this.behavioralBiases = {
      loss_aversion: 'tendency to prefer avoiding losses over acquiring gains',
      overconfidence: 'overestimating one\'s knowledge or ability',
      anchoring: 'relying too heavily on first piece of information',
      confirmation_bias: 'searching for information that confirms existing beliefs',
      herd_mentality: 'following the crowd without independent analysis',
      recency_bias: 'giving more weight to recent events',
      fear_of_missing_out: 'anxiety about missing profitable opportunities'
    };
  }

  // Generate personalized behavioral nudge
  async generateBehavioralNudge(userId, context) {
    const cacheKey = `nudge:${userId}:${JSON.stringify(context)}`;
    const cached = await this.redis.get(cacheKey);
    
    if (cached) return JSON.parse(cached);
    
    const [userProfile, behavioralHistory, currentBiases] = await Promise.all([
      this.getUserProfile(userId),
      this.getBehavioralHistory(userId),
      this.detectCurrentBiases(userId, context)
    ]);
    
    const prompt = this.buildNudgePrompt(userProfile, behavioralHistory, currentBiases, context);
    
    const aiResponse = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7
    });
    
    const nudge = this.parseNudgeResponse(aiResponse.choices[0].message.content);
    
    // Add gamification elements
    nudge.pointsReward = this.calculateNudgeReward(nudge.urgency, nudge.complexity);
    nudge.challengeElement = await this.createNudgeChallenge(nudge);
    
    // Cache for 30 minutes
    await this.redis.setEx(cacheKey, 1800, JSON.stringify(nudge));
    
    // Track nudge generation
    await this.trackNudgeGenerated(userId, nudge);
    
    return nudge;
  }

  buildNudgePrompt(userProfile, behavioralHistory, currentBiases, context) {
    return `
      Create a personalized behavioral nudge for an investor with:
      
      Profile: ${JSON.stringify(userProfile)}
      Previous biases shown: ${behavioralHistory.join(', ')}
      Currently detected biases: ${currentBiases.join(', ')}
      Current context: ${JSON.stringify(context)}
      
      Generate a nudge that:
      1. Addresses the specific bias without being preachy
      2. Provides actionable guidance
      3. Uses positive psychology principles
      4. Includes a specific measurable goal
      5. Connects to learning opportunities
      6. Suggests gamified challenges
      
      Format as JSON with: title, message, biasAddressed, actionableSteps, goal, learningResource, urgency (1-5), complexity (1-5), expectedOutcome.
    `;
  }

  // Bias detection based on user behavior
  async detectCurrentBiases(userId, context) {
    const recentActions = await this.getRecentUserActions(userId);
    const detectedBiases = [];
    
    // Loss aversion detection
    if (this.detectLossAversion(recentActions, context)) {
      detectedBiases.push('loss_aversion');
    }
    
    // Overconfidence detection
    if (this.detectOverconfidence(recentActions, context)) {
      detectedBiases.push('overconfidence');
    }
    
    // FOMO detection
    if (this.detectFOMO(recentActions, context)) {
      detectedBiases.push('fear_of_missing_out');
    }
    
    // Herd mentality detection
    if (this.detectHerdMentality(recentActions, context)) {
      detectedBiases.push('herd_mentality');
    }
    
    return detectedBiases;
  }

  // Track nudge effectiveness
  async trackNudgeAction(userId, nudgeId, action) {
    const nudge = await this.getNudgeById(nudgeId);
    if (!nudge) return;
    
    const actionData = {
      nudgeId,
      userId,
      action, // 'viewed', 'dismissed', 'acted', 'completed'
      timestamp: new Date().toISOString(),
      context: nudge.context
    };
    
    await this.redis.lpush(`nudge_actions:${userId}`, JSON.stringify(actionData));
    await this.redis.expire(`nudge_actions:${userId}`, 86400 * 30); // 30 days
    
    // Award points based on action
    if (action === 'acted') {
      await this.gamification.awardPoints(userId, 'behavioral_nudge_acted', { nudgeId });
    } else if (action === 'completed') {
      await this.gamification.awardPoints(userId, 'nudge_goal_achieved', { nudgeId });
      await this.updateBehavioralScore(userId, nudge.biasAddressed, 'improved');
    }
    
    return actionData;
  }

  // Update user's behavioral improvement score
  async updateBehavioralScore(userId, biasType, improvement) {
    const scoreKey = `user:${userId}:behavioral_score`;
    const currentScore = await this.redis.get(scoreKey);
    
    const score = currentScore ? JSON.parse(currentScore) : {
      goodDecisions: 0,
      biasesOvercome: 0,
      goalsAchieved: 0,
      improvements: {}
    };
    
    if (improvement === 'improved') {
      score.biasesOvercome += 1;
      score.improvements[biasType] = (score.improvements[biasType] || 0) + 1;
    }
    
    await this.redis.setEx(scoreKey, 86400 * 30, JSON.stringify(score));
    
    // Check for behavioral improvement achievements
    if (score.biasesOvercome >= 5) {
      await this.gamification.awardBadge(userId, 'BIAS_BUSTER', 'Overcame 5 behavioral biases');
    }
    
    return score;
  }
}

// 3. INTEGRATED LEARNING HUB WITH BEHAVIORAL NUDGES
class IntegratedLearningHub {
  constructor(redisClient, database, gamificationEngine, behavioralNudgeEngine, openAIClient) {
    this.redis = redisClient;
    this.db = database;
    this.gamification = gamificationEngine;
    this.behavioralNudge = behavioralNudgeEngine;
    this.openai = openAIClient;
  }

  // Personalized learning dashboard
  async getLearningDashboard(userId) {
    const cacheKey = `learning_dashboard:${userId}`;
    const cached = await this.redis.get(cacheKey);
    
    if (cached) return JSON.parse(cached);
    
    const [
      userLevel,
      currentNudges,
      learningProgress,
      recommendedLessons,
      behavioralInsights,
      upcomingChallenges
    ] = await Promise.all([
      this.gamification.getUserLevel(userId),
      this.getCurrentNudges(userId),
      this.getLearningProgress(userId),
      this.getRecommendedLessons(userId),
      this.getBehavioralInsights(userId),
      this.getUpcomingChallenges(userId)
    ]);
    
    const dashboard = {
      userLevel,
      currentNudges,
      learningProgress,
      recommendedLessons,
      behavioralInsights,
      upcomingChallenges,
      generatedAt: new Date().toISOString()
    };
    
    // Cache for 15 minutes
    await this.redis.setEx(cacheKey, 900, JSON.stringify(dashboard));
    
    return dashboard;
  }

  // Behavioral insights for learning optimization
  async getBehavioralInsights(userId) {
    const behavioralData = await this.behavioralNudge.getUserProfile(userId);
    const learningPatterns = await this.analyzeLearningPatterns(userId);
    
    const prompt = `
      Analyze user's behavioral and learning patterns:
      Behavioral profile: ${JSON.stringify(behavioralData)}
      Learning patterns: ${JSON.stringify(learning// Learning Hub with Gamification - AI-Powered System
// Integrated with AI Microservice Engine

// 1. GAMIFICATION SYSTEM CORE
class GamificationEngine {
  constructor(redisClient, database) {
    this.redis = redisClient;
    this.db = database;
    this.pointsSystem = {
      lesson_completed: 10,
      quiz_passed: 15,
      simulation_run: 5,
      daily_login: 2,
      streak_bonus: 5,
      perfect_quiz: 25,
      portfolio_created: 20,
      risk_assessment: 8,
      behavioral_nudge_acted: 12
    };
  }

  // Award points with streak multipliers
  async awardPoints(userId, action, metadata = {}) {
    const basePoints = this.pointsSystem[action] || 0;
    const userStreak = await this.getUserStreak(userId);
    
    // Streak bonus (max 3x multiplier)
    const streakMultiplier = Math.min(1 + (userStreak / 10), 3);
    const totalPoints = Math.floor(basePoints * streakMultiplier);
    
    // Update user points
    const userKey = `user:${userId}:points`;
    const currentPoints = await this.redis.get(userKey) || 0;
    const newTotal = parseInt(currentPoints) + totalPoints;
    
    await this.redis.setEx(userKey, 86400 * 30, newTotal); // Cache for 30 days
    
    // Track achievement
    await this.checkAchievements(userId, action, newTotal, metadata);
    
    // Update database
    await this.db.query(`
      INSERT INTO user_points (user_id, action, points, streak_multiplier, created_at)
      VALUES ($1, $2, $3, $4, NOW())
    `, [userId, action, totalPoints, streakMultiplier]);
    
    return { points: totalPoints, totalPoints: newTotal, streakMultiplier };
  }

  // Level calculation
  async getUserLevel(userId) {
    const cacheKey = `user:${userId}:level`;
    const cached = await this.redis.get(cacheKey);
    
    if (cached) return JSON.parse(cached);
    
    const totalPoints = await this.redis.get(`user:${userId}:points`) || 0;
    const level = Math.floor(totalPoints / 100) + 1; // 100 points per level
    const progressToNext = totalPoints % 100;
    
    const levelData = {
      level,
      points: parseInt(totalPoints),
      progressToNext,
      pointsNeeded: 100 - progressToNext
    };
    
    await this.redis.setEx(cacheKey, 3600, JSON.stringify(levelData)); // Cache for 1 hour
    return levelData;
  }

  // Achievement system
  async checkAchievements(userId, action, totalPoints, metadata) {
    const achievements = [];
    
    // Point-based achievements
    if (totalPoints >= 1000 && !(await this.hasAchievement(userId, 'POINT_MASTER'))) {
      achievements.push('POINT_MASTER');
    }
    
    // Action-based achievements
    if (action === 'lesson_completed') {
      const completedLessons = await this.getCompletedLessonsCount(userId);
      if (completedLessons >= 10 && !(await this.hasAchievement(userId, 'LEARNING_ENTHUSIAST'))) {
        achievements.push('LEARNING_ENTHUSIAST');
      }
    }
    
    // Award achievements
    for (const achievement of achievements) {
      await this.awardAchievement(userId, achievement);
    }
    
    return achievements;
  }

  // Badge system
  async awardBadge(userId, badgeType, reason) {
    const badgeKey = `user:${userId}:badges`;
    const badges = await this.redis.get(badgeKey);
    const userBadges = badges ? JSON.parse(badges) : [];
    
    const badge = {
      type: badgeType,
      reason,
      awardedAt: new Date().toISOString()
    };
    
    userBadges.push(badge);
    await this.redis.setEx(badgeKey, 86400 * 30, JSON.stringify(userBadges));
    
    return badge;
  }
}

// 2. AI-POWERED LEARNING PATH SYSTEM
class LearningPathEngine {
  constructor(openAIClient, redisClient, gamificationEngine) {
    this.openai = openAIClient;
    this.redis = redisClient;
    this.gamification = gamificationEngine;
  }

  // Generate personalized learning path
  async generateLearningPath(userId, userProfile, knowledgeLevel, goals) {
    const cacheKey = `learning_path:${userId}:${JSON.stringify(goals)}`;
    const cached = await this.redis.get(cacheKey);
    
    if (cached) return JSON.parse(cached);
    
    const prompt = this.buildLearningPathPrompt(userProfile, knowledgeLevel, goals);
    
    const aiResponse = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7
    });
    
    const learningPath = this.parseLearningPathResponse(aiResponse.choices[0].message.content);
    
    // Cache for 30 minutes
    await this.redis.setEx(cacheKey, 1800, JSON.stringify(learningPath));
    
    return learningPath;
  }

  buildLearningPathPrompt(userProfile, knowledgeLevel, goals) {
    return `
      Create a personalized investment learning path for a user with the following profile:
      
      Knowledge Level: ${knowledgeLevel} (Beginner/Intermediate/Advanced)
      Goals: ${goals.join(', ')}
      Risk Tolerance: ${userProfile.riskTolerance}
      Age: ${userProfile.age}
      Investment Timeline: ${userProfile.investmentTimeline}
      
      Generate a structured learning path with:
      1. 5-7 progressive lessons
      2. Interactive quizzes for each lesson
      3. Practical simulations to reinforce concepts
      4. Estimated time to complete each module
      5. Prerequisites for each lesson
      
      Format as JSON with lesson titles, descriptions, estimated_minutes, difficulty, and prerequisites.
    `;
  }

  // Adaptive content recommendation
  async getNextRecommendation(userId) {
    const userProgress = await this.getUserProgress(userId);
    const userLevel = await this.gamification.getUserLevel(userId);
    
    const prompt = `
      Based on user progress: ${JSON.stringify(userProgress)}
      Current level: ${userLevel.level}
      
      Recommend the next best learning activity to maximize engagement and learning outcomes.
      Consider: difficulty progression, knowledge gaps, engagement patterns.
      
      Return JSON with: type, title, description, estimated_minutes, difficulty, reasoning.
    `;
    
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3
    });
    
    return JSON.parse(response.choices[0].message.content);
  }
}

// 3. INTERACTIVE LEARNING MODULES
class InteractiveLearningModule {
  constructor(redisClient, gamificationEngine, aiEngine) {
    this.redis = redisClient;
    this.gamification = gamificationEngine;
    this.ai = aiEngine;
  }

  // Lesson completion with AI-generated feedback
  async completeLesson(userId, lessonId, userAnswers, timeSpent) {
    const lesson = await this.getLessonContent(lessonId);
    const score = this.calculateLessonScore(lesson, userAnswers);
    
    // Award points based on performance
    const pointsAwarded = await this.gamification.awardPoints(userId, 'lesson_completed', {
      lessonId,
      score,
      timeSpent
    });
    
    // Generate AI feedback
    const feedback = await this.generateAIFeedback(lesson, userAnswers, score);
    
    // Update progress
    await this.updateUserProgress(userId, lessonId, score, timeSpent);
    
    // Check for badges
    if (score >= 90) {
      await this.gamification.awardBadge(userId, 'EXCELLENCE', `Perfect score on ${lesson.title}`);
    }
    
    return {
      score,
      pointsAwarded,
      feedback,
      nextRecommendation: await this.ai.getNextRecommendation(userId)
    };
  }

  // AI-generated quiz questions
  async generateQuiz(lessonId, difficulty = 'intermediate') {
    const cacheKey = `quiz:${lessonId}:${difficulty}`;
    const cached = await this.redis.get(cacheKey);
    
    if (cached) return JSON.parse(cached);
    
    const lessonContent = await this.getLessonContent(lessonId);
    
    const prompt = `
      Based on this lesson content: ${lessonContent.content}
      
      Generate 5 multiple-choice questions for ${difficulty} level:
      - Test understanding, not memorization
      - Include scenario-based questions
      - Provide explanations for correct answers
      - Mix question types (conceptual, calculation, application)
      
      Format as JSON array with: question, options, correctAnswer, explanation, difficulty.
    `;
    
    const aiResponse = await this.ai.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.4
    });
    
    const quiz = JSON.parse(aiResponse.choices[0].message.content);
    
    // Cache quiz for 24 hours
    await this.redis.setEx(cacheKey, 86400, JSON.stringify(quiz));
    
    return quiz;
  }

  // Portfolio simulation challenges
  async createSimulationChallenge(userId, userLevel) {
    const challengeTypes = [
      'build_diversified_portfolio',
      'rebalance_portfolio',
      'risk_management',
      'market_volatility_response',
      'retirement_planning'
    ];
    
    const challengeType = challengeTypes[Math.floor(Math.random() * challengeTypes.length)];
    
    const prompt = `
      Create a portfolio simulation challenge for level ${userLevel} investor:
      Challenge type: ${challengeType}
      
      Include:
      - Clear objectives and constraints
      - Initial conditions (market state, available funds, etc.)
      - Success criteria
      - Educational goals
      - Realistic market scenarios
      
      Format as JSON with: title, description, objectives, constraints, successCriteria, estimatedTime.
    `;
    
    const aiResponse = await this.ai.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.6
    });
    
    return JSON.parse(aiResponse.choices[0].message.content);
  }
}

// 4. SOCIAL LEARNING FEATURES
class SocialLearningFeatures {
  constructor(redisClient, gamificationEngine) {
    this.redis = redisClient;
    this.gamification = gamificationEngine;
  }

  // Leaderboard system
  async getLeaderboard(timeframe = 'weekly', limit = 50) {
    const leaderboardKey = `leaderboard:${timeframe}`;
    const cached = await this.redis.get(leaderboardKey);
    
    if (cached) return JSON.parse(cached);
    
    // Get top users from database
    const query = this.buildLeaderboardQuery(timeframe, limit);
    const users = await this.db.query(query);
    
    const leaderboard = users.rows.map((user, index) => ({
      rank: index + 1,
      userId: user.user_id,
      username: user.username,
      points: user.total_points,
      level: Math.floor(user.total_points / 100) + 1,
      badges: user.badge_count
    }));
    
    // Cache for 15 minutes
    await this.redis.setEx(leaderboardKey, 900, JSON.stringify(leaderboard));
    
    return leaderboard;
  }

  // Study groups and challenges
  async createStudyGroup(creatorId, groupName, description, maxMembers = 10) {
    const groupId = `group_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const group = {
      id: groupId,
      name: groupName,
      description,
      creatorId,
      members: [creatorId],
      maxMembers,
      createdAt: new Date().toISOString(),
      weeklyChallenge: null
    };
    
    await this.redis.setEx(`study_group:${groupId}`, 86400 * 30, JSON.stringify(group));
    
    // Award points to creator
    await this.gamification.awardPoints(creatorId, 'study_group_created', { groupId });
    
    return group;
  }

  // Peer learning sessions
  async scheduleStudySession(groupId, sessionTopic, scheduledFor) {
    const session = {
      id: `session_${Date.now()}`,
      groupId,
      topic: sessionTopic,
      scheduledFor,
      attendees: [],
      status: 'scheduled',
      createdAt: new Date().toISOString()
    };
    
    await this.redis.setEx(`study_session:${session.id}`, 86400 * 7, JSON.stringify(session));
    
    return session;
  }
}

// 5. PROGRESS TRACKING AND ANALYTICS
class LearningAnalytics {
  constructor(redisClient, database) {
    this.redis = redisClient;
    this.db = database;
  }

  // Comprehensive user progress
  async getUserAnalytics(userId) {
    const cacheKey = `analytics:${userId}`;
    const cached = await this.redis.get(cacheKey);
    
    if (cached) return JSON.parse(cached);
    
    const [
      totalProgress,
      weeklyActivity,
      strengthsWeaknesses,
      learningStreak
    ] = await Promise.all([
      this.getTotalProgress(userId),
      this.getWeeklyActivity(userId),
      this.analyzeStrengthsWeaknesses(userId),
      this.getLearningStreak(userId)
    ]);
    
    const analytics = {
      totalProgress,
      weeklyActivity,
      strengthsWeaknesses,
      learningStreak,
      generatedAt: new Date().toISOString()
    };
    
    // Cache for 1 hour
    await this.redis.setEx(cacheKey, 3600, JSON.stringify(analytics));
    
    return analytics;
  }

  // Learning path optimization suggestions
  async generateOptimizationSuggestions(userId) {
    const analytics = await this.getUserAnalytics(userId);
    
    const suggestions = [];
    
    // Time-based suggestions
    if (analytics.weeklyActivity.averageSessionTime < 15) {
      suggestions.push({
        type: 'time_optimization',
        suggestion: 'Try longer study sessions (20-30 minutes) for better retention',
        impact: 'medium'
      });
    }
    
    // Performance-based suggestions
    if (analytics.strengthsWeaknesses.weakAreas.length > 0) {
      suggestions.push({
        type: 'content_focus',
        suggestion: `Focus on improving: ${analytics.strengthsWeaknesses.weakAreas.join(', ')}`,
        impact: 'high'
      });
    }
    
    // Engagement suggestions
    if (analytics.learningStreak.current < 3) {
      suggestions.push({
        type: 'engagement',
        suggestion: 'Build a daily learning habit - start with just 10 minutes',
        impact: 'high'
      });
    }
    
    return suggestions;
  }
}

// 6. API ROUTES FOR LEARNING HUB
const express = require('express');
const router = express.Router();

// Initialize systems
const gamification = new GamificationEngine(redisClient, database);
const learningPath = new LearningPathEngine(openAIClient, redisClient, gamification);
const learningModule = new InteractiveLearningModule(redis