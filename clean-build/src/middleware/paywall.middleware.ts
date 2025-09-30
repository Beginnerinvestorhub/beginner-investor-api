import { Request, Response, NextFunction } from 'express';
import { SubscriptionTier } from '@prisma/client';
import { paywallService } from '../services/paywall/paywall.service';

export const requireSubscription = (requiredTier: SubscriptionTier = SubscriptionTier.BASIC) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // @ts-ignore - user is attached to request by auth middleware
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const hasAccess = await paywallService.hasAccess(userId, requiredTier);
      
      if (!hasAccess) {
        return res.status(403).json({
          error: 'Subscription required',
          requiredTier,
          upgradeUrl: '/api/subscribe/upgrade'
        });
      }

      next();
    } catch (error) {
      console.error('Paywall middleware error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  };
};

// Middleware to check if user has access to a specific feature
export const checkFeatureAccess = (feature: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // @ts-ignore - user is attached to request by auth middleware
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      // In a real implementation, you would check feature access based on subscription
      // This is a simplified example
      const hasAccess = await paywallService.hasAccess(userId, SubscriptionTier.BASIC);
      
      if (!hasAccess) {
        return res.status(403).json({
          error: `Feature '${feature}' requires a subscription`,
          feature,
          upgradeUrl: '/api/subscribe/upgrade'
        });
      }

      next();
    } catch (error) {
      console.error('Feature access check failed:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  };
};
