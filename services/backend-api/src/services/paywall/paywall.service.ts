import { PrismaClient, SubscriptionTier } from '@prisma/client';
import BaseService  from '../base.service';
import { prisma } from '../../config/prisma'; // use singleton

export class PaywallService extends BaseService {
  constructor(cacheTtl?: number) {
    super(cacheTtl);
  }

  async getUserSubscription(userId: string) {
    const key = this.generateCacheKey(`subscription:${userId}`);
    return this.getCachedOrFetch(key, () =>
      prisma.subscription.findUnique({
        where: { userId },
        include: { tier: true }
      })
    );
  }

  async hasAccess(userId: string, requiredTier: SubscriptionTier): Promise<boolean> {
    const subscription = await this.getUserSubscription(userId);
    if (!subscription || !subscription.tier?.name) return false;

    const tierOrder: SubscriptionTier[] = [
      SubscriptionTier.FREE,
      SubscriptionTier.BASIC,
      SubscriptionTier.PREMIUM,
      SubscriptionTier.ENTERPRISE,
    ];

    const userTierIndex = tierOrder.indexOf(subscription.tier.name);
    const requiredTierIndex = tierOrder.indexOf(requiredTier);

    return userTierIndex >= 0 && userTierIndex >= requiredTierIndex;
  }

  async createCheckoutSession(_userId: string, _tier: SubscriptionTier) {
    // TODO: integrate with Stripe (or other)
    return {
      sessionId: `cs_${Math.random().toString(36).substring(2, 15)}`,
      url: 'https://checkout.stripe.com/...',
    };
  }

  async handleWebhookEvent(event: any) {
    switch (event.type) {
      case 'checkout.session.completed':
        // TODO: Update user's subscription in DB
        break;
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        // TODO: Update or cancel subscription
        break;
    }
  }
}

export const paywallService = new PaywallService();
