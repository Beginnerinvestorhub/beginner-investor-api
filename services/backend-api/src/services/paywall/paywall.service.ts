import { SubscriptionTier } from "@prisma/client";
import BaseService from "../base.service";
import { prisma } from "../../config/prisma";
import { stripeService } from "./stripe.service";

export class PaywallService extends BaseService {
  constructor(cacheTtl?: number) {
    super(cacheTtl);
  }

  async getUserSubscription(userId: string) {
    const key = this.generateCacheKey(`subscription:${userId}`);
    return this.getCachedOrFetch(key, () =>
      prisma.subscription.findUnique({
        where: { userId },
        include: { tier: true },
      }),
    );
  }

  async hasAccess(
    userId: string,
    requiredTier: SubscriptionTier,
  ): Promise<boolean> {
    const subscription = await this.getUserSubscription(userId);
    if (!subscription || !subscription.tier?.name) return false;

    const tierOrder: SubscriptionTier[] = [
      SubscriptionTier.FREE,
      SubscriptionTier.STARTER,
      SubscriptionTier.PRO,
      SubscriptionTier.PREMIUM,
    ];

    const userTierIndex = tierOrder.indexOf(subscription.tier.name);
    const requiredTierIndex = tierOrder.indexOf(requiredTier);

    return userTierIndex >= 0 && userTierIndex >= requiredTierIndex;
  }

  async createCheckoutSession(
    userId: string,
    tier: SubscriptionTier,
    billingInterval: "month" | "year" = "month",
  ) {
    const successUrl = `${process.env.STRIPE_SUCCESS_URL || "http://localhost:3001/success"}?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${process.env.STRIPE_CANCEL_URL || "http://localhost:3001/cancel"}`;

    return stripeService.createCheckoutSession({
      userId,
      tier,
      successUrl,
      cancelUrl,
      billingInterval,
      metadata: {
        source: "beginner_investor_hub",
        timestamp: new Date().toISOString(),
      },
    });
  }

  async handleWebhookEvent(event: any) {
    return stripeService.handleWebhookEvent(event);
  }

  async retrieveSession(sessionId: string) {
    return stripeService.retrieveSession(sessionId);
  }

  async createRefund(paymentId: string, amount?: number) {
    return stripeService.createRefund(paymentId, amount);
  }

  async cancelSubscription(
    subscriptionId: string,
    cancelAtPeriodEnd: boolean = true,
  ) {
    return stripeService.cancelSubscription(subscriptionId, cancelAtPeriodEnd);
  }

  async listUserSubscriptions(userId: string) {
    // Get user to find their Stripe customer ID
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { stripeCustomerId: true },
    });

    if (!user?.stripeCustomerId) {
      return [];
    }

    return stripeService.listSubscriptions(user.stripeCustomerId);
  }

  async updateUserSubscription(
    subscriptionId: string,
    newTier: SubscriptionTier,
    billingInterval: "month" | "year" = "month",
  ) {
    // Get subscription to find current subscription item
    const subscription = await stripeService.retrieveSession(subscriptionId);
    if (!subscription.subscriptionId) {
      throw new Error("Subscription not found");
    }

    // Get current subscription details from Stripe
    const stripeSubscription = await stripe.subscriptions.retrieve(
      subscription.subscriptionId,
    );

    // Update subscription item with new price
    if (stripeSubscription.items.data.length > 0) {
      const subscriptionItemId = stripeSubscription.items.data[0].id;
      const newPriceId = this.getPriceIdForTierInternal(
        newTier,
        billingInterval,
      );

      if (!newPriceId) {
        throw new Error(`No price ID found for tier: ${newTier}`);
      }

      return stripeService.updateSubscriptionItem(
        subscriptionItemId,
        newPriceId,
      );
    }

    throw new Error("No subscription items found");
  }
}
