"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GamificationService = void 0;
// Gamification service for database operations
const database_1 = require("../config/database");
class GamificationService {
    // Get user progress with all related data
    static async getUserProgress(userId) {
        const client = await database_1.pool.connect();
        try {
            // Get or create user progress
            let progressResult = await client.query('SELECT * FROM user_progress WHERE user_id = $1', [userId]);
            if (progressResult.rows.length === 0) {
                // Create new user progress
                await client.query(`
          INSERT INTO user_progress (user_id, total_points, level, experience_points, experience_to_next_level)
          VALUES ($1, 0, 1, 0, 100)
        `, [userId]);
                await client.query(`
          INSERT INTO user_stats (user_id, tools_used, favorite_tools)
          VALUES ($1, '[]'::jsonb, '[]'::jsonb)
        `, [userId]);
                progressResult = await client.query('SELECT * FROM user_progress WHERE user_id = $1', [userId]);
            }
            const progress = progressResult.rows[0];
            // Get user badges
            const badgesResult = await client.query(`
        SELECT b.*, ub.unlocked_at,
               CASE WHEN ub.user_id IS NOT NULL THEN true ELSE false END as is_unlocked
        FROM badges b
        LEFT JOIN user_badges ub ON b.id = ub.badge_id AND ub.user_id = $1
        WHERE b.is_active = true
        ORDER BY b.category, b.rarity, b.name
      `, [userId]);
            const badges = badgesResult.rows.map((row) => ({
                id: row.id,
                name: row.name,
                description: row.description,
                icon: row.icon,
                category: row.category,
                points: row.points,
                rarity: row.rarity,
                isUnlocked: row.is_unlocked,
                unlockedAt: row.unlocked_at
            }));
            // Get user achievements
            const achievementsResult = await client.query(`
        SELECT a.*, ua.progress, ua.is_completed, ua.completed_at
        FROM achievements a
        LEFT JOIN user_achievements ua ON a.id = ua.achievement_id AND ua.user_id = $1
        WHERE a.is_active = true
        ORDER BY a.name
      `, [userId]);
            const achievements = achievementsResult.rows.map((row) => ({
                id: row.id,
                name: row.name,
                description: row.description,
                type: row.type,
                progress: row.progress || 0,
                target: row.target,
                isCompleted: row.is_completed || false,
                completedAt: row.completed_at,
                rewardPoints: row.reward_points,
                rewardBadgeId: row.reward_badge_id
            }));
            // Get user stats
            const statsResult = await client.query('SELECT * FROM user_stats WHERE user_id = $1', [userId]);
            const stats = statsResult.rows[0] ? {
                toolsUsed: statsResult.rows[0].tools_used || [],
                assessmentsCompleted: statsResult.rows[0].assessments_completed || 0,
                portfoliosCreated: statsResult.rows[0].portfolios_created || 0,
                educationModulesCompleted: statsResult.rows[0].education_modules_completed || 0,
                totalTimeSpent: statsResult.rows[0].total_time_spent || 0,
                averageSessionTime: statsResult.rows[0].average_session_time || 0,
                favoriteTools: statsResult.rows[0].favorite_tools || []
            } : {
                toolsUsed: [],
                assessmentsCompleted: 0,
                portfoliosCreated: 0,
                educationModulesCompleted: 0,
                totalTimeSpent: 0,
                averageSessionTime: 0,
                favoriteTools: []
            };
            return {
                progress: {
                    userId: progress.user_id,
                    totalPoints: progress.total_points,
                    level: progress.level,
                    experiencePoints: progress.experience_points,
                    experienceToNextLevel: progress.experience_to_next_level,
                    loginStreak: progress.login_streak,
                    learningStreak: progress.learning_streak,
                    lastLoginDate: progress.last_login_date,
                    lastLearningDate: progress.last_learning_date
                },
                badges,
                achievements,
                stats
            };
        }
        finally {
            client.release();
        }
    }
    // Award points to user
    static async awardPoints(userId, points, reason) {
        const client = await database_1.pool.connect();
        try {
            await client.query('BEGIN');
            // Get current progress
            const currentResult = await client.query('SELECT total_points, level FROM user_progress WHERE user_id = $1', [userId]);
            if (currentResult.rows.length === 0) {
                throw new Error('User progress not found');
            }
            const currentPoints = currentResult.rows[0].total_points;
            const currentLevel = currentResult.rows[0].level;
            const newTotalPoints = currentPoints + points;
            // Calculate new level
            const levelThresholds = [0, 100, 250, 450, 700, 1000, 1350, 1750, 2200, 2700, 3250, 3850, 4500, 5200, 5950, 6750, 7600, 8500, 9450, 10500];
            let newLevel = 1;
            for (let i = 0; i < levelThresholds.length; i++) {
                if (newTotalPoints >= levelThresholds[i]) {
                    newLevel = i + 1;
                }
                else {
                    break;
                }
            }
            const leveledUp = newLevel > currentLevel;
            const nextLevelThreshold = levelThresholds[newLevel] || levelThresholds[levelThresholds.length - 1];
            // Update user progress
            await client.query(`
        UPDATE user_progress 
        SET total_points = $1, level = $2, experience_points = $1, 
            experience_to_next_level = $3, updated_at = CURRENT_TIMESTAMP
        WHERE user_id = $4
      `, [newTotalPoints, newLevel, nextLevelThreshold, userId]);
            // Log the event
            await client.query(`
        INSERT INTO gamification_events (user_id, event_type, event_data, points_awarded)
        VALUES ($1, 'POINTS_AWARDED', $2, $3)
      `, [userId, JSON.stringify({ reason }), points]);
            await client.query('COMMIT');
            return {
                newTotalPoints,
                leveledUp,
                newLevel
            };
        }
        catch (error) {
            await client.query('ROLLBACK');
            throw error;
        }
        finally {
            client.release();
        }
    }
    // Unlock badge for user
    static async unlockBadge(userId, badgeId) {
        const client = await database_1.pool.connect();
        try {
            await client.query('BEGIN');
            // Check if badge already unlocked
            const existingResult = await client.query('SELECT id FROM user_badges WHERE user_id = $1 AND badge_id = $2', [userId, badgeId]);
            if (existingResult.rows.length > 0) {
                await client.query('ROLLBACK');
                return false; // Already unlocked
            }
            // Get badge info
            const badgeResult = await client.query('SELECT * FROM badges WHERE id = $1 AND is_active = true', [badgeId]);
            if (badgeResult.rows.length === 0) {
                await client.query('ROLLBACK');
                throw new Error('Badge not found');
            }
            const badge = badgeResult.rows[0];
            // Unlock badge
            await client.query('INSERT INTO user_badges (user_id, badge_id) VALUES ($1, $2)', [userId, badgeId]);
            // Award badge points
            await this.awardPointsInTransaction(client, userId, badge.points, `Badge: ${badge.name}`);
            // Log the event
            await client.query(`
        INSERT INTO gamification_events (user_id, event_type, event_data, badge_unlocked)
        VALUES ($1, 'BADGE_UNLOCKED', $2, $3)
      `, [userId, JSON.stringify({ badgeName: badge.name }), badgeId]);
            await client.query('COMMIT');
            return true;
        }
        catch (error) {
            await client.query('ROLLBACK');
            throw error;
        }
        finally {
            client.release();
        }
    }
    // Update user streak
    static async updateStreak(userId, streakType) {
        const client = await database_1.pool.connect();
        try {
            const today = new Date().toDateString();
            const column = streakType === 'login' ? 'login_streak' : 'learning_streak';
            const dateColumn = streakType === 'login' ? 'last_login_date' : 'last_learning_date';
            // Get current streak info
            const currentResult = await client.query(`SELECT ${column}, ${dateColumn} FROM user_progress WHERE user_id = $1`, [userId]);
            if (currentResult.rows.length === 0) {
                throw new Error('User progress not found');
            }
            const currentStreak = currentResult.rows[0][column] || 0;
            const lastDate = currentResult.rows[0][dateColumn];
            let newStreak = 1;
            if (lastDate) {
                const lastDateString = new Date(lastDate).toDateString();
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                const yesterdayString = yesterday.toDateString();
                if (lastDateString === yesterdayString) {
                    // Consecutive day
                    newStreak = currentStreak + 1;
                }
                else if (lastDateString === today) {
                    // Same day, no change
                    return currentStreak;
                }
                // If gap > 1 day, streak resets to 1
            }
            // Update streak
            await client.query(`
        UPDATE user_progress 
        SET ${column} = $1, ${dateColumn} = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
        WHERE user_id = $2
      `, [newStreak, userId]);
            return newStreak;
        }
        finally {
            client.release();
        }
    }
    // Track gamification event
    static async trackEvent(userId, eventType, eventData) {
        var _a;
        const client = await database_1.pool.connect();
        try {
            await client.query('BEGIN');
            let pointsAwarded = 0;
            let statsUpdate = {};
            // Handle different event types
            switch (eventType) {
                case 'COMPLETE_RISK_ASSESSMENT':
                    pointsAwarded = 50;
                    statsUpdate = { assessments_completed: 'assessments_completed + 1' };
                    break;
                case 'USE_TOOL':
                    const toolId = eventData.toolId;
                    // Check if first time using this tool
                    const toolsResult = await client.query('SELECT tools_used FROM user_stats WHERE user_id = $1', [userId]);
                    const currentTools = ((_a = toolsResult.rows[0]) === null || _a === void 0 ? void 0 : _a.tools_used) || [];
                    const isFirstTime = !currentTools.includes(toolId);
                    pointsAwarded = isFirstTime ? 25 : 10;
                    if (isFirstTime) {
                        await client.query(`
              UPDATE user_stats 
              SET tools_used = tools_used || $1::jsonb, updated_at = CURRENT_TIMESTAMP
              WHERE user_id = $2
            `, [JSON.stringify([toolId]), userId]);
                    }
                    break;
                case 'CREATE_PORTFOLIO':
                    pointsAwarded = 75;
                    statsUpdate = { portfolios_created: 'portfolios_created + 1' };
                    break;
                case 'DAILY_LOGIN':
                    pointsAwarded = 10;
                    await this.updateStreak(userId, 'login');
                    break;
                case 'COMPLETE_EDUCATION':
                    pointsAwarded = 30;
                    statsUpdate = { education_modules_completed: 'education_modules_completed + 1' };
                    await this.updateStreak(userId, 'learning');
                    break;
            }
            // Update stats if needed
            if (Object.keys(statsUpdate).length > 0) {
                const updateFields = Object.entries(statsUpdate)
                    .map(([key, value]) => `${key} = ${value}`)
                    .join(', ');
                await client.query(`
          UPDATE user_stats 
          SET ${updateFields}, updated_at = CURRENT_TIMESTAMP
          WHERE user_id = $1
        `, [userId]);
            }
            // Award points
            if (pointsAwarded > 0) {
                await this.awardPointsInTransaction(client, userId, pointsAwarded, eventType);
            }
            // Log the event
            await client.query(`
        INSERT INTO gamification_events (user_id, event_type, event_data, points_awarded)
        VALUES ($1, $2, $3, $4)
      `, [userId, eventType, JSON.stringify(eventData), pointsAwarded]);
            await client.query('COMMIT');
        }
        catch (error) {
            await client.query('ROLLBACK');
            throw error;
        }
        finally {
            client.release();
        }
    }
    // Helper method to award points within a transaction
    static async awardPointsInTransaction(client, userId, points, reason) {
        // Get current progress
        const currentResult = await client.query('SELECT total_points, level FROM user_progress WHERE user_id = $1', [userId]);
        if (currentResult.rows.length === 0) {
            throw new Error('User progress not found');
        }
        const currentPoints = currentResult.rows[0].total_points;
        const newTotalPoints = currentPoints + points;
        // Calculate new level
        const levelThresholds = [0, 100, 250, 450, 700, 1000, 1350, 1750, 2200, 2700, 3250, 3850, 4500, 5200, 5950, 6750, 7600, 8500, 9450, 10500];
        let newLevel = 1;
        for (let i = 0; i < levelThresholds.length; i++) {
            if (newTotalPoints >= levelThresholds[i]) {
                newLevel = i + 1;
            }
            else {
                break;
            }
        }
        const nextLevelThreshold = levelThresholds[newLevel] || levelThresholds[levelThresholds.length - 1];
        // Update user progress
        await client.query(`
      UPDATE user_progress 
      SET total_points = $1, level = $2, experience_points = $1, 
          experience_to_next_level = $3, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $4
    `, [newTotalPoints, newLevel, nextLevelThreshold, userId]);
    }
    // Get leaderboard
    static async getLeaderboard(period = 'all_time', limit = 10) {
        const client = await database_1.pool.connect();
        try {
            const result = await client.query(`
        SELECT 
          up.user_id,
          up.total_points,
          up.level,
          COUNT(ub.badge_id) as badges_count,
          ROW_NUMBER() OVER (ORDER BY up.total_points DESC) as rank
        FROM user_progress up
        LEFT JOIN user_badges ub ON up.user_id = ub.user_id
        GROUP BY up.user_id, up.total_points, up.level
        ORDER BY up.total_points DESC
        LIMIT $1
      `, [limit]);
            return result.rows;
        }
        finally {
            client.release();
        }
    }
}
exports.GamificationService = GamificationService;
