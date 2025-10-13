// services/backend-api/src/services/paywall/stripe.service.ts

import Stripe from "stripe";
import { PrismaClient, SubscriptionTier, PaymentStatus } from "@prisma/client";
import { prisma } from "../../config/prisma";
import logger from "../../utils/logger";

// Validate required environment variables
const validateEnvironment = () => {
  const required = ["STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET"];
  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}`,
    );
  }
};

validateEnvironment();

// Initialize Stripe with secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});

// Types for Stripe integration
interface CreateCheckoutSessionParams {
  userId: string;
  tier: SubscriptionTier;
  successUrl: string;
  cancelUrl: string;
  billingInterval?: "month" | "year";
  metadata?: Record<string, string>;
}

interface WebhookEvent {
  id: string;
  type: string;
  data: {
    object: any;
  };
  created: number;
}

interface PaymentRecord {
  id: string;
  userId: string;
  stripeSessionId: string;
  stripePaymentIntentId?: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  tier: SubscriptionTier;
  createdAt: Date;
  updatedAt: Date;
}

interface SubscriptionRecord {
  id: string;
  userId: string;
  stripeSubscriptionId: string;
  stripeCustomerId: string;
  status: string;
  tier: SubscriptionTier;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class StripeService {
  private webhookEventIds = new Map<string, number>();
  private readonly WEBHOOK_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours
  private readonly WEBHOOK_CACHE_CLEANUP_THRESHOLD = 1000;

  /**
   * Create a Stripe checkout session for subscription
   */
  async createCheckoutSession(params: CreateCheckoutSessionParams): Promise<{
    sessionId: string;
    url: string;
  }> {
    try {
      const {
        userId,
        tier,
        successUrl,
        cancelUrl,
        billingInterval = "month",
        metadata = {},
      } = params;

      // Validate tier is not FREE
      if (tier === SubscriptionTier.FREE) {
        throw new Error("Cannot create checkout session for FREE tier");
      }

      // Get or create Stripe customer
      const customer = await this.getOrCreateCustomer(userId);

      // Get price ID for the tier and billing interval
      const priceId = this.getPriceIdForTier(tier, billingInterval);
      if (!priceId) {
        throw new Error(
          `No price ID configured for tier: ${tier} (${billingInterval})`,
        );
      }

      // Create idempotency key to prevent duplicate charges
      const idempotencyKey = `checkout_${userId}_${tier}_${billingInterval}`;

      // Create checkout session
      const session = await stripe.checkout.sessions.create(
        {
          customer: customer.id,
          payment_method_types: ["card"],
          line_items: [
            {
              price: priceId,
              quantity: 1,
            },
          ],
          mode: "subscription",
          success_url: successUrl,
          cancel_url: cancelUrl,
          metadata: {
            userId,
            tier,
            billingInterval,
            ...metadata,
          },
          subscription_data: {
            metadata: {
              userId,
              tier,
              billingInterval,
            },
          },
          // Enable automatic tax calculation
          automatic_tax: { enabled: true },
          // Allow promotion codes
          allow_promotion_codes: true,
          // Set billing address collection
          billing_address_collection: "required",
        },
        {
          idempotencyKey,
        },
      );

      // Log session creation
      logger.info("Stripe checkout session created", {
        sessionId: session.id,
        userId,
        tier,
        billingInterval,
        amount: session.amount_total,
        currency: session.currency,
      });

      return {
        sessionId: session.id,
        url: session.url!,
      };
    } catch (error: any) {
      logger.error("Failed to create checkout session:", error);
      throw new Error(`Failed to create checkout session: ${error.message}`);
    }
  }

  /**
   * Get or create a Stripe customer for a user
   */
  private async getOrCreateCustomer(userId: string): Promise<Stripe.Customer> {
    try {
      // Check if customer already exists in database
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { stripeCustomerId: true, email: true, name: true },
      });

      if (!user) {
        throw new Error(`User not found: ${userId}`);
      }

      // If customer ID exists, retrieve from Stripe
      if (user.stripeCustomerId) {
        try {
          const customer = await stripe.customers.retrieve(
            user.stripeCustomerId,
          );
          if (!customer.deleted) {
            return customer as Stripe.Customer;
          }
        } catch (error) {
          logger.warn(
            "Failed to retrieve existing customer, creating new one",
            {
              userId,
              stripeCustomerId: user.stripeCustomerId,
            },
          );
        }
      }

      // Create new customer
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name || undefined,
        metadata: {
          userId,
        },
      });

      // Update user with customer ID
      await prisma.user.update({
        where: { id: userId },
        data: { stripeCustomerId: customer.id },
      });

      logger.info("Stripe customer created", {
        userId,
        customerId: customer.id,
      });

      return customer;
    } catch (error: any) {
      logger.error("Failed to get or create customer:", error);
      throw new Error(`Failed to get or create customer: ${error.message}`);
    }
  }

  /**
   * Handle Stripe webhook events
   */
  async handleWebhookEvent(event: WebhookEvent): Promise<void> {
    try {
      // Check for duplicate webhook events with TTL cleanup
      const now = Date.now();

      if (this.webhookEventIds.has(event.id)) {
        logger.info("Duplicate webhook event ignored", { eventId: event.id });
        return;
      }

      this.webhookEventIds.set(event.id, now);

      // Clean up old event IDs periodically
      if (this.webhookEventIds.size > this.WEBHOOK_CACHE_CLEANUP_THRESHOLD) {
        this.cleanupWebhookCache(now);
      }

      logger.info("Processing webhook event", {
        eventId: event.id,
        eventType: event.type,
        created: new Date(event.created * 1000),
      });

      switch (event.type) {
        case "checkout.session.completed":
          await this.handleCheckoutSessionCompleted(event.data.object);
          break;

        case "customer.subscription.created":
        case "customer.subscription.updated":
          await this.handleSubscriptionUpdated(event.data.object);
          break;

        case "customer.subscription.deleted":
          await this.handleSubscriptionDeleted(event.data.object);
          break;

        case "payment_intent.succeeded":
          await this.handlePaymentIntentSucceeded(event.data.object);
          break;

        case "payment_intent.payment_failed":
          await this.handlePaymentIntentFailed(event.data.object);
          break;

        case "invoice.payment_succeeded":
          await this.handleInvoicePaymentSucceeded(event.data.object);
          break;

        case "invoice.payment_failed":
          await this.handleInvoicePaymentFailed(event.data.object);
          break;

        default:
          logger.info("Unhandled webhook event type", {
            eventType: event.type,
          });
      }
    } catch (error: any) {
      logger.error("Failed to process webhook event:", {
        eventId: event.id,
        eventType: event.type,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Clean up expired webhook event IDs from cache
   */
  private cleanupWebhookCache(currentTime: number): void {
    const expiredThreshold = currentTime - this.WEBHOOK_CACHE_TTL;

    for (const [eventId, timestamp] of this.webhookEventIds.entries()) {
      if (timestamp < expiredThreshold) {
        this.webhookEventIds.delete(eventId);
      }
    }

    logger.info("Webhook cache cleaned up", {
      remainingEvents: this.webhookEventIds.size,
    });
  }

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(
    payload: string | Buffer,
    signature: string,
  ): WebhookEvent {
    try {
      const event = stripe.webhooks.constructEvent(
        payload,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!,
      );
      return event as WebhookEvent;
    } catch (error: any) {
      logger.error("Webhook signature verification failed:", error);
      throw new Error(
        `Webhook signature verification failed: ${error.message}`,
      );
    }
  }

  /**
   * Retrieve checkout session details
   */
  async retrieveSession(sessionId: string): Promise<{
    session: Stripe.Checkout.Session;
    paymentStatus: string;
    subscriptionId?: string;
  }> {
    try {
      const session = await stripe.checkout.sessions.retrieve(sessionId, {
        expand: ["payment_intent", "subscription"],
      });

      return {
        session,
        paymentStatus: session.payment_status || "unknown",
        subscriptionId:
          typeof session.subscription === "string"
            ? session.subscription
            : session.subscription?.id,
      };
    } catch (error: any) {
      logger.error("Failed to retrieve session:", error);
      throw new Error(`Failed to retrieve session: ${error.message}`);
    }
  }

  /**
   * Retrieve subscription details by ID
   */
  async getSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
    try {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      return subscription;
    } catch (error: any) {
      logger.error("Failed to retrieve subscription:", error);
      throw new Error(`Failed to retrieve subscription: ${error.message}`);
    }
  }

  /**
   * Get price ID for a specific tier and billing interval
   */
  private getPriceIdForTier(
    tier: SubscriptionTier,
    billingInterval: "month" | "year" = "month",
  ): string | null {
    const priceMap: Record<
      SubscriptionTier,
      Record<"month" | "year", string>
    > = {
      [SubscriptionTier.FREE]: { month: "", year: "" },
      [SubscriptionTier.STARTER]: {
        month: process.env.STRIPE_PRICE_ID_STARTER_MONTHLY || "",
        year: process.env.STRIPE_PRICE_ID_STARTER_ANNUAL || "",
      },
      [SubscriptionTier.PRO]: {
        month: process.env.STRIPE_PRICE_ID_PRO_MONTHLY || "",
        year: process.env.STRIPE_PRICE_ID_PRO_ANNUAL || "",
      },
      [SubscriptionTier.PREMIUM]: {
        month: process.env.STRIPE_PRICE_ID_PREMIUM_MONTHLY || "",
        year: process.env.STRIPE_PRICE_ID_PREMIUM_ANNUAL || "",
      },
    };

    const priceId = priceMap[tier]?.[billingInterval];
    return priceId || null;
  }

  /**
   * Handle checkout session completed event
   */
  private async handleCheckoutSessionCompleted(
    session: Stripe.Checkout.Session,
  ): Promise<void> {
    try {
      const userId = session.metadata?.userId;
      const tier = session.metadata?.tier as SubscriptionTier;

      if (!userId || !tier) {
        logger.error("Missing userId or tier in session metadata", {
          sessionId: session.id,
        });
        return;
      }

      // Create payment record
      const payment = await prisma.payment.create({
        data: {
          userId,
          stripeSessionId: session.id,
          stripePaymentIntentId:
            typeof session.payment_intent === "string"
              ? session.payment_intent
              : session.payment_intent?.id || null,
          amount: session.amount_total || 0,
          currency: session.currency || "usd",
          status: PaymentStatus.COMPLETED,
          tier,
        },
      });

      logger.info("Payment record created", {
        paymentId: payment.id,
        userId,
        sessionId: session.id,
        amount: payment.amount,
      });

      // The subscription will be created by the customer.subscription.created event
    } catch (error: any) {
      logger.error("Failed to handle checkout session completed:", error);
      throw error;
    }
  }

  /**
   * Handle subscription created/updated event
   */
  private async handleSubscriptionUpdated(
    subscription: Stripe.Subscription,
  ): Promise<void> {
    try {
      const userId = subscription.metadata?.userId;
      const tier = subscription.metadata?.tier as SubscriptionTier;

      if (!userId) {
        logger.error("Missing userId in subscription metadata", {
          subscriptionId: subscription.id,
        });
        return;
      }

      // Upsert subscription record
      await prisma.subscription.upsert({
        where: { stripeSubscriptionId: subscription.id },
        update: {
          status: subscription.status,
          currentPeriodStart: new Date(
            subscription.current_period_start * 1000,
          ),
          currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
        },
        create: {
          userId,
          stripeSubscriptionId: subscription.id,
          stripeCustomerId:
            typeof subscription.customer === "string"
              ? subscription.customer
              : subscription.customer.id,
          status: subscription.status,
          tier: tier || SubscriptionTier.STARTER,
          currentPeriodStart: new Date(
            subscription.current_period_start * 1000,
          ),
          currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
        },
      });

      logger.info("Subscription record updated", {
        userId,
        subscriptionId: subscription.id,
        status: subscription.status,
        tier: tier || SubscriptionTier.STARTER,
      });
    } catch (error: any) {
      logger.error("Failed to handle subscription updated:", error);
      throw error;
    }
  }

  /**
   * Handle subscription deleted event
   */
  private async handleSubscriptionDeleted(
    subscription: Stripe.Subscription,
  ): Promise<void> {
    try {
      await prisma.subscription.update({
        where: { stripeSubscriptionId: subscription.id },
        data: {
          status: "canceled",
          cancelAtPeriodEnd: true,
        },
      });

      logger.info("Subscription canceled", {
        subscriptionId: subscription.id,
      });
    } catch (error: any) {
      logger.error("Failed to handle subscription deleted:", error);
      throw error;
    }
  }

  /**
   * Handle successful payment intent
   */
  private async handlePaymentIntentSucceeded(
    paymentIntent: Stripe.PaymentIntent,
  ): Promise<void> {
    try {
      // Update payment record status if not already completed
      const updated = await prisma.payment.updateMany({
        where: {
          stripePaymentIntentId: paymentIntent.id,
          status: { not: PaymentStatus.COMPLETED },
        },
        data: {
          status: PaymentStatus.COMPLETED,
        },
      });

      logger.info("Payment intent succeeded", {
        paymentIntentId: paymentIntent.id,
        amount: paymentIntent.amount,
        updatedRecords: updated.count,
      });
    } catch (error: any) {
      logger.error("Failed to handle payment intent succeeded:", error);
      throw error;
    }
  }

  /**
   * Handle failed payment intent
   */
  private async handlePaymentIntentFailed(
    paymentIntent: Stripe.PaymentIntent,
  ): Promise<void> {
    try {
      // Update payment record status
      const updated = await prisma.payment.updateMany({
        where: {
          stripePaymentIntentId: paymentIntent.id,
        },
        data: {
          status: PaymentStatus.FAILED,
        },
      });

      logger.warn("Payment intent failed", {
        paymentIntentId: paymentIntent.id,
        lastPaymentError: paymentIntent.last_payment_error?.message,
        updatedRecords: updated.count,
      });
    } catch (error: any) {
      logger.error("Failed to handle payment intent failed:", error);
      throw error;
    }
  }

  /**
   * Handle successful invoice payment
   */
  private async handleInvoicePaymentSucceeded(
    invoice: Stripe.Invoice,
  ): Promise<void> {
    try {
      // This handles recurring subscription payments
      if (invoice.subscription) {
        const subscriptionId =
          typeof invoice.subscription === "string"
            ? invoice.subscription
            : invoice.subscription.id;

        // Fetch the actual subscription from Stripe
        const subscription =
          await stripe.subscriptions.retrieve(subscriptionId);
        await this.handleSubscriptionUpdated(subscription);
      }

      logger.info("Invoice payment succeeded", {
        invoiceId: invoice.id,
        amount: invoice.amount_paid,
        subscriptionId: invoice.subscription,
      });
    } catch (error: any) {
      logger.error("Failed to handle invoice payment succeeded:", error);
      throw error;
    }
  }

  /**
   * Handle failed invoice payment
   */
  private async handleInvoicePaymentFailed(
    invoice: Stripe.Invoice,
  ): Promise<void> {
    try {
      logger.warn("Invoice payment failed", {
        invoiceId: invoice.id,
        amount: invoice.amount_due,
        subscriptionId: invoice.subscription,
        attemptCount: invoice.attempt_count,
      });

      // TODO: Implement retry logic or subscription suspension/cancellation
      // Consider notifying the user via email
    } catch (error: any) {
      logger.error("Failed to handle invoice payment failed:", error);
      throw error;
    }
  }

  /**
   * Create a refund for a payment
   */
  async createRefund(
    paymentId: string,
    amount?: number,
  ): Promise<Stripe.Refund> {
    try {
      const payment = await prisma.payment.findUnique({
        where: { id: paymentId },
      });

      if (!payment) {
        throw new Error("Payment not found");
      }

      if (payment.status !== PaymentStatus.COMPLETED) {
        throw new Error("Can only refund completed payments");
      }

      if (!payment.stripePaymentIntentId) {
        throw new Error("Payment has no associated payment intent");
      }

      const refund = await stripe.refunds.create({
        payment_intent: payment.stripePaymentIntentId,
        amount: amount ? Math.round(amount * 100) : undefined, // Convert to cents
        metadata: {
          paymentId: payment.id,
          userId: payment.userId,
        },
      });

      // Update payment status
      await prisma.payment.update({
        where: { id: paymentId },
        data: { status: PaymentStatus.REFUNDED },
      });

      logger.info("Refund created", {
        refundId: refund.id,
        paymentId: payment.id,
        amount: refund.amount,
      });

      return refund;
    } catch (error: any) {
      logger.error("Failed to create refund:", error);
      throw new Error(`Failed to create refund: ${error.message}`);
    }
  }

  /**
   * Cancel a subscription
   */
  async cancelSubscription(
    subscriptionId: string,
    cancelAtPeriodEnd: boolean = true,
  ): Promise<Stripe.Subscription> {
    try {
      const subscription = await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: cancelAtPeriodEnd,
      });

      // Update in database
      await prisma.subscription.update({
        where: { stripeSubscriptionId: subscriptionId },
        data: {
          cancelAtPeriodEnd: cancelAtPeriodEnd,
          status: cancelAtPeriodEnd ? subscription.status : "canceled",
        },
      });

      logger.info("Subscription cancellation updated", {
        subscriptionId,
        cancelAtPeriodEnd,
        status: subscription.status,
      });

      return subscription;
    } catch (error: any) {
      logger.error("Failed to cancel subscription:", error);
      throw new Error(`Failed to cancel subscription: ${error.message}`);
    }
  }

  /**
   * Create a customer portal session for billing management
   */
  async createPortalSession(
    customerId: string,
    returnUrl?: string,
  ): Promise<{ url: string }> {
    try {
      const portalSession = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url:
          returnUrl ||
          process.env.STRIPE_SUCCESS_URL ||
          "http://localhost:3000",
      });

      logger.info("Portal session created", {
        customerId,
        portalSessionId: portalSession.id,
        url: portalSession.url,
      });

      return { url: portalSession.url };
    } catch (error: any) {
      logger.error("Failed to create portal session:", error);
      throw new Error(`Failed to create portal session: ${error.message}`);
    }
  }

  /**
   * List all subscriptions for a customer
   */
  async listSubscriptions(customerId: string): Promise<Stripe.Subscription[]> {
    try {
      const subscriptions = await stripe.subscriptions.list({
        customer: customerId,
        status: "all", // Include active, canceled, incomplete, etc.
        limit: 100,
      });

      logger.info("Customer subscriptions retrieved", {
        customerId,
        subscriptionCount: subscriptions.data.length,
      });

      return subscriptions.data;
    } catch (error: any) {
      logger.error("Failed to list customer subscriptions:", error);
      throw new Error(`Failed to list subscriptions: ${error.message}`);
    }
  }

  /**
   * Get user's active subscription
   */
  async getUserActiveSubscription(
    userId: string,
  ): Promise<SubscriptionRecord | null> {
    try {
      const subscription = await prisma.subscription.findFirst({
        where: {
          userId,
          status: { in: ["active", "trialing"] },
        },
        orderBy: {
          currentPeriodEnd: "desc",
        },
      });

      return subscription;
    } catch (error: any) {
      logger.error("Failed to get user active subscription:", error);
      throw new Error(
        `Failed to get user active subscription: ${error.message}`,
      );
    }
  }

  /**
   * Check if user has access to a specific tier
   */
  async userHasAccessToTier(
    userId: string,
    requiredTier: SubscriptionTier,
  ): Promise<boolean> {
    try {
      const subscription = await this.getUserActiveSubscription(userId);

      if (!subscription) {
        return requiredTier === SubscriptionTier.FREE;
      }

      const tierHierarchy = {
        [SubscriptionTier.FREE]: 0,
        [SubscriptionTier.STARTER]: 1,
        [SubscriptionTier.PRO]: 2,
        [SubscriptionTier.PREMIUM]: 3,
      };

      return tierHierarchy[subscription.tier] >= tierHierarchy[requiredTier];
    } catch (error: any) {
      logger.error("Failed to check user tier access:", error);
      return false;
    }
  }
}

export const stripeService = new StripeService();
