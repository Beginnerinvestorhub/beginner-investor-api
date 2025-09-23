"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.challengesRouter = void 0;
const express_1 = require("express");
const database_1 = require("../config/database");
exports.challengesRouter = (0, express_1.Router)();
// Sample challenges data - in production, this would come from database
const CHALLENGE_TEMPLATES = [
    {
        id: 'daily_login',
        title: 'Daily Check-in',
        description: 'Log in to the platform every day',
        type: 'daily',
        target: 1,
        reward: { points: 10 }
    },
    {
        id: 'complete_risk_assessment',
        title: 'Know Your Risk',
        description: 'Complete the risk assessment tool',
        type: 'achievement',
        target: 1,
        reward: { points: 100, badge: 'Risk Aware' }
    },
    {
        id: 'weekly_lessons',
        title: 'Learning Streak',
        description: 'Complete 3 lessons this week',
        type: 'weekly',
        target: 3,
        reward: { points: 200, badge: 'Dedicated Learner' }
    },
    {
        id: 'portfolio_tracker',
        title: 'Track Your Progress',
        description: 'Use the portfolio monitor 5 times',
        type: 'achievement',
        target: 5,
        reward: { points: 150 }
    }
];
// Get user's challenges
exports.challengesRouter.get('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const client = await database_1.pool.connect();
        // Get user's current progress for various activities
        const progressQuery = await client.query(`
      SELECT 
        COUNT(CASE WHEN event_type = 'DAILY_LOGIN' AND created_at >= CURRENT_DATE THEN 1 END) as daily_logins,
        COUNT(CASE WHEN event_type = 'RISK_ASSESSMENT_COMPLETED' THEN 1 END) as risk_assessments,
        COUNT(CASE WHEN event_type = 'LESSON_COMPLETED' AND created_at >= DATE_TRUNC('week', CURRENT_DATE) THEN 1 END) as weekly_lessons,
        COUNT(CASE WHEN event_type = 'PORTFOLIO_VIEW' THEN 1 END) as portfolio_views
      FROM gamification_events 
      WHERE user_id = $1
    `, [userId]);
        const progress = progressQuery.rows[0];
        // Get completed challenges
        const completedQuery = await client.query(`
      SELECT challenge_id FROM user_challenges WHERE user_id = $1 AND completed = true
    `, [userId]);
        const completedChallenges = new Set(completedQuery.rows.map(row => row.challenge_id));
        client.release();
        // Generate challenges with current progress
        const challenges = CHALLENGE_TEMPLATES.map(template => {
            let currentProgress = 0;
            switch (template.id) {
                case 'daily_login':
                    currentProgress = parseInt(progress.daily_logins) || 0;
                    break;
                case 'complete_risk_assessment':
                    currentProgress = parseInt(progress.risk_assessments) || 0;
                    break;
                case 'weekly_lessons':
                    currentProgress = parseInt(progress.weekly_lessons) || 0;
                    break;
                case 'portfolio_tracker':
                    currentProgress = parseInt(progress.portfolio_views) || 0;
                    break;
            }
            return Object.assign(Object.assign({}, template), { progress: Math.min(currentProgress, template.target), completed: completedChallenges.has(template.id), expiresAt: template.type === 'daily' ? new Date(Date.now() + 24 * 60 * 60 * 1000) :
                    template.type === 'weekly' ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) :
                        undefined });
        });
        res.json(challenges);
    }
    catch (error) {
        console.error('Error fetching challenges:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Claim challenge reward
exports.challengesRouter.post('/:challengeId/claim', async (req, res) => {
    try {
        const { challengeId } = req.params;
        const { userId } = req.body;
        if (!userId) {
            return res.status(400).json({ error: 'User ID required' });
        }
        const challenge = CHALLENGE_TEMPLATES.find(c => c.id === challengeId);
        if (!challenge) {
            return res.status(404).json({ error: 'Challenge not found' });
        }
        const client = await database_1.pool.connect();
        // Check if already claimed
        const existingClaim = await client.query('SELECT id FROM user_challenges WHERE user_id = $1 AND challenge_id = $2', [userId, challengeId]);
        if (existingClaim.rows.length > 0) {
            client.release();
            return res.status(400).json({ error: 'Challenge already claimed' });
        }
        // Mark challenge as completed
        await client.query('INSERT INTO user_challenges (user_id, challenge_id, completed, completed_at) VALUES ($1, $2, true, NOW())', [userId, challengeId]);
        // Award points
        await client.query('INSERT INTO user_progress (user_id, points, xp) VALUES ($1, $2, $3) ON CONFLICT (user_id) DO UPDATE SET points = user_progress.points + $2, xp = user_progress.xp + $3', [userId, challenge.reward.points, challenge.reward.points]);
        // Award badge if applicable
        if (challenge.reward.badge) {
            await client.query('INSERT INTO user_badges (user_id, badge_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [userId, challenge.reward.badge.toLowerCase().replace(/\s+/g, '_')]);
        }
        client.release();
        res.json({
            success: true,
            pointsAwarded: challenge.reward.points,
            badgeAwarded: challenge.reward.badge
        });
    }
    catch (error) {
        console.error('Error claiming challenge reward:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
