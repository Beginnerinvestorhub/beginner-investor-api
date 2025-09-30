import express from 'express';
import { getConnection } from '../database/connection';
import { getRedisClient } from '../redis/client';

const router = express.Router();

router.get('/health', async (req, res) => {
  try {
    // Check database connection
    const dbConnection = await getConnection();
    await dbConnection.query('SELECT 1');

    // Check Redis connection
    const redisClient = getRedisClient();
    await redisClient.ping();

    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'connected',
        redis: 'connected'
      }
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

export default router;