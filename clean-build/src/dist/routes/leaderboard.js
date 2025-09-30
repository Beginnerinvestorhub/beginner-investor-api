"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.leaderboardRouter = void 0;
const express_1 = require("express");
const database_1 = require("../config/database");
exports.leaderboardRouter = (0, express_1.Router)();
// Get leaderboard data
exports.leaderboardRouter.get('/', async (req, res) => {
    try {
        const { timeframe = 'week' } = req.query;
        const client = await database_1.pool.connect();
        let dateFilter = '';
        if (timeframe === 'week') {
            dateFilter = "AND up.updated_at >= NOW() - INTERVAL '7 days'";
        }
        else if (timeframe === 'month') {
            dateFilter = "AND up.updated_at >= NOW() - INTERVAL '30 days'";
        }
        const result = await client.query(`
      SELECT 
        up.user_id,
        up.points,
        up.level,
        ROW_NUMBER() OVER (ORDER BY up.points DESC) as rank
      FROM user_progress up
      WHERE up.points > 0 ${dateFilter}
      ORDER BY up.points DESC
      LIMIT 50
    `);
        const leaderboard = result.rows.map((row, index) => ({
            userId: row.user_id,
            displayName: null, // Could be enhanced with user profiles
            points: parseInt(row.points),
            level: parseInt(row.level),
            rank: index + 1
        }));
        client.release();
        res.json(leaderboard);
    }
    catch (error) {
        console.error('Error fetching leaderboard:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Get user's leaderboard position
exports.leaderboardRouter.get('/position/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { timeframe = 'week' } = req.query;
        const client = await database_1.pool.connect();
        let dateFilter = '';
        if (timeframe === 'week') {
            dateFilter = "AND up.updated_at >= NOW() - INTERVAL '7 days'";
        }
        else if (timeframe === 'month') {
            dateFilter = "AND up.updated_at >= NOW() - INTERVAL '30 days'";
        }
        const result = await client.query(`
      WITH ranked_users AS (
        SELECT 
          up.user_id,
          up.points,
          up.level,
          ROW_NUMBER() OVER (ORDER BY up.points DESC) as rank
        FROM user_progress up
        WHERE up.points > 0 ${dateFilter}
      )
      SELECT * FROM ranked_users WHERE user_id = $1
    `, [userId]);
        client.release();
        if (result.rows.length === 0) {
            return res.json({ rank: null, points: 0, level: 1 });
        }
        const userPosition = result.rows[0];
        res.json({
            rank: parseInt(userPosition.rank),
            points: parseInt(userPosition.points),
            level: parseInt(userPosition.level)
        });
    }
    catch (error) {
        console.error('Error fetching user position:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
