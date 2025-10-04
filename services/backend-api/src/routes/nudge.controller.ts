import { Request, Response } from 'express';

export const getNudges = async (_req: Request, res: Response) => {
  try {
    // TODO: Implement nudge logic
    res.json({ message: 'Nudges endpoint - coming soon' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createNudge = async (_req: Request, res: Response) => {
  try {
    // TODO: Implement nudge creation
    res.json({ message: 'Create nudge - coming soon' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};