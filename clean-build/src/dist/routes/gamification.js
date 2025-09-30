"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Gamification API routes
const express_1 = __importDefault(require("express"));
const gamificationService_1 = require("../services/gamificationService");
const requireAuth_1 = require("../utils/requireAuth");
const router = express_1.default.Router();
// All routes require authentication
router.use((0, requireAuth_1.requireAuth)());
// GET /api/gamification/progress - Get user's complete gamification data
router.get('/progress', async (req, res) => {
    var _a, _b;
    try {
        const userId = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.uid) || ((_b = req.user) === null || _b === void 0 ? void 0 : _b.sub);
        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        const data = await gamificationService_1.GamificationService.getUserProgress(userId);
        if (!data) {
            return res.status(404).json({ error: 'User progress not found' });
        }
        res.json(data);
    }
    catch (error) {
        console.error('Error fetching user progress:', error);
        res.status(500).json({ error: 'Failed to fetch user progress' });
    }
});
// POST /api/gamification/track-event - Track a gamification event
router.post('/track-event', async (req, res) => {
    var _a, _b;
    try {
        const userId = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.uid) || ((_b = req.user) === null || _b === void 0 ? void 0 : _b.sub);
        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        const { eventType, eventData } = req.body;
        if (!eventType) {
            return res.status(400).json({ error: 'Event type is required' });
        }
        await gamificationService_1.GamificationService.trackEvent(userId, eventType, eventData || {});
        // Get updated progress to return
        const updatedData = await gamificationService_1.GamificationService.getUserProgress(userId);
        res.json({
            success: true,
            message: 'Event tracked successfully',
            data: updatedData
        });
    }
    catch (error) {
        console.error('Error tracking event:', error);
        res.status(500).json({ error: 'Failed to track event' });
    }
});
// POST /api/gamification/award-points - Award points to user
router.post('/award-points', async (req, res) => {
    var _a, _b;
    try {
        const userId = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.uid) || ((_b = req.user) === null || _b === void 0 ? void 0 : _b.sub);
        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        const { points, reason } = req.body;
        if (!points || points <= 0) {
            return res.status(400).json({ error: 'Valid points amount is required' });
        }
        const result = await gamificationService_1.GamificationService.awardPoints(userId, points, reason || 'Manual award');
        res.json({
            success: true,
            message: 'Points awarded successfully',
            data: result
        });
    }
    catch (error) {
        console.error('Error awarding points:', error);
        res.status(500).json({ error: 'Failed to award points' });
    }
});
// POST /api/gamification/unlock-badge - Unlock a badge for user
router.post('/unlock-badge', async (req, res) => {
    var _a, _b;
    try {
        const userId = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.uid) || ((_b = req.user) === null || _b === void 0 ? void 0 : _b.sub);
        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        const { badgeId } = req.body;
        if (!badgeId) {
            return res.status(400).json({ error: 'Badge ID is required' });
        }
        const unlocked = await gamificationService_1.GamificationService.unlockBadge(userId, badgeId);
        if (!unlocked) {
            return res.status(409).json({ error: 'Badge already unlocked' });
        }
        res.json({
            success: true,
            message: 'Badge unlocked successfully',
            badgeId
        });
    }
    catch (error) {
        console.error('Error unlocking badge:', error);
        res.status(500).json({ error: 'Failed to unlock badge' });
    }
});
// PUT /api/gamification/streak - Update user streak
router.put('/streak', async (req, res) => {
    var _a, _b;
    try {
        const userId = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.uid) || ((_b = req.user) === null || _b === void 0 ? void 0 : _b.sub);
        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        const { streakType } = req.body;
        if (!streakType || !['login', 'learning'].includes(streakType)) {
            return res.status(400).json({ error: 'Valid streak type (login or learning) is required' });
        }
        const newStreak = await gamificationService_1.GamificationService.updateStreak(userId, streakType);
        res.json({
            success: true,
            message: 'Streak updated successfully',
            streakType,
            newStreak
        });
    }
    catch (error) {
        console.error('Error updating streak:', error);
        res.status(500).json({ error: 'Failed to update streak' });
    }
});
// GET /api/gamification/leaderboard - Get leaderboard
router.get('/leaderboard', async (req, res) => {
    try {
        const period = req.query.period || 'all_time';
        const limit = parseInt(req.query.limit) || 10;
        if (limit > 100) {
            return res.status(400).json({ error: 'Limit cannot exceed 100' });
        }
        const leaderboard = await gamificationService_1.GamificationService.getLeaderboard(period, limit);
        res.json({
            success: true,
            data: leaderboard,
            period,
            limit
        });
    }
    catch (error) {
        console.error('Error fetching leaderboard:', error);
        res.status(500).json({ error: 'Failed to fetch leaderboard' });
    }
});
// GET /api/gamification/badges - Get all available badges
router.get('/badges', async (req, res) => {
    var _a, _b;
    try {
        const userId = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.uid) || ((_b = req.user) === null || _b === void 0 ? void 0 : _b.sub);
        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        const data = await gamificationService_1.GamificationService.getUserProgress(userId);
        if (!data) {
            return res.status(404).json({ error: 'User data not found' });
        }
        res.json({
            success: true,
            badges: data.badges
        });
    }
    catch (error) {
        console.error('Error fetching badges:', error);
        res.status(500).json({ error: 'Failed to fetch badges' });
    }
});
// GET /api/gamification/achievements - Get user achievements
router.get('/achievements', async (req, res) => {
    var _a, _b;
    try {
        const userId = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.uid) || ((_b = req.user) === null || _b === void 0 ? void 0 : _b.sub);
        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        const data = await gamificationService_1.GamificationService.getUserProgress(userId);
        if (!data) {
            return res.status(404).json({ error: 'User data not found' });
        }
        res.json({
            success: true,
            achievements: data.achievements
        });
    }
    catch (error) {
        console.error('Error fetching achievements:', error);
        res.status(500).json({ error: 'Failed to fetch achievements' });
    }
});
// GET /api/gamification/stats - Get user statistics
router.get('/stats', async (req, res) => {
    var _a, _b;
    try {
        const userId = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.uid) || ((_b = req.user) === null || _b === void 0 ? void 0 : _b.sub);
        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        const data = await gamificationService_1.GamificationService.getUserProgress(userId);
        if (!data) {
            return res.status(404).json({ error: 'User data not found' });
        }
        res.json({
            success: true,
            progress: data.progress,
            stats: data.stats
        });
    }
    catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
});
exports.default = router;
