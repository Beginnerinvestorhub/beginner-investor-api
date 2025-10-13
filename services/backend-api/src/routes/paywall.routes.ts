import { Router } from "express";
import { SubscriptionTier } from "@prisma/client";
import { PaywallService } from "../services/paywall/paywall.service";
import { stripeService } from "../services/paywall/stripe.service";
import { requireAuth } from "../middleware/auth.middleware";

const router = Router();
const paywallService = new PaywallService();

// Get current user's subscription
router.get("/subscription", requireAuth, async (req, res) => {
  try {
    const userId = req.user?.uid;
    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const subscription = await paywallService.getUserSubscription(userId);

    res.json({
      subscription,
      hasActiveSubscription: !!subscription,
    });
  } catch (error) {
    console.error("Failed to get subscription:", error);
    res.status(500).json({ error: "Failed to get subscription" });
  }
});

// Create checkout session for new subscription
router.post("/subscribe/checkout", requireAuth, async (req, res) => {
  try {
    const { tier = "STARTER", billingInterval = "month" } = req.body;
    const userId = req.user?.uid;

    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const session = await paywallService.createCheckoutSession(
      userId,
      tier as SubscriptionTier,
      billingInterval,
    );

    res.json({
      success: true,
      sessionId: session.sessionId,
      url: session.url,
    });
  } catch (error) {
    console.error("Failed to create checkout session:", error);
    res.status(500).json({ error: "Failed to create checkout session" });
  }
});

// Retrieve checkout session status
router.get("/session/:sessionId", requireAuth, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user?.uid;

    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const sessionData = await stripeService.retrieveSession(sessionId);

    res.json({
      session: sessionData.session,
      paymentStatus: sessionData.paymentStatus,
      subscriptionId: sessionData.subscriptionId,
    });
  } catch (error) {
    console.error("Failed to retrieve session:", error);
    res.status(500).json({ error: "Failed to retrieve session" });
  }
});

// Handle webhooks from payment processor
router.post("/webhooks/payment", async (req, res) => {
  const sig = req.headers["stripe-signature"];
  const payload = req.body;

  try {
    if (!sig) {
      return res.status(400).json({ error: "Missing Stripe signature" });
    }

    // Verify webhook signature
    const event = stripeService.verifyWebhookSignature(
      JSON.stringify(payload),
      sig,
    );

    // Process the event
    await paywallService.handleWebhookEvent(event);

    res.json({ received: true, eventType: event.type, eventId: event.id });
  } catch (err) {
    console.error("Webhook error:", err);
    return res.status(400).json({
      error: `Webhook Error: ${err.message}`,
      code: "WEBHOOK_ERROR",
    });
  }
});

// Create refund for a payment (admin only)
router.post("/refund/:paymentId", requireAuth, async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { amount } = req.body; // Optional partial refund amount in dollars
    const userId = req.user?.uid;

    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    // TODO: Add admin role check here
    // if (!req.user.roles?.includes('admin')) {
    //   return res.status(403).json({ error: 'Admin access required' });
    // }

    const refund = await paywallService.createRefund(paymentId, amount);

    res.json({
      success: true,
      refundId: refund.id,
      amount: refund.amount / 100, // Convert from cents to dollars
      status: refund.status,
    });
  } catch (error) {
    console.error("Failed to create refund:", error);
    res.status(500).json({ error: "Failed to create refund" });
  }
});

// Create customer portal session for billing management
router.post("/create-portal-session", requireAuth, async (req, res) => {
  try {
    const { session_id } = req.body;
    const userId = req.user?.uid;

    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    if (!session_id) {
      return res.status(400).json({ error: "Session ID required" });
    }

    // Get user subscription to find customer ID
    const subscription = await paywallService.getUserSubscription(userId);
    if (!subscription?.stripeCustomerId) {
      return res.status(404).json({ error: "No subscription found" });
    }

    // Create customer portal session
    const portalSession = await stripeService.createPortalSession(
      subscription.stripeCustomerId,
    );

    res.json({
      success: true,
      url: portalSession.url,
    });
  } catch (error) {
    console.error("Failed to create portal session:", error);
    res.status(500).json({ error: "Failed to create portal session" });
  }
});
// Cancel subscription
router.post("/subscription/cancel", requireAuth, async (req, res) => {
  try {
    const userId = req.user?.uid;
    const { subscriptionId, cancelAtPeriodEnd = true } = req.body;

    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    if (!subscriptionId) {
      return res.status(400).json({ error: "Subscription ID required" });
    }

    const subscription = await paywallService.cancelSubscription(
      subscriptionId,
      cancelAtPeriodEnd,
    );

    res.json({
      success: true,
      subscriptionId: subscription.id,
      status: subscription.status,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    });
  } catch (error) {
    console.error("Failed to cancel subscription:", error);
    res.status(500).json({ error: "Failed to cancel subscription" });
  }
});

// Example of a protected route
router.get(
  "/premium-content",
  requireAuth,
  requireSubscription(SubscriptionTier.PREMIUM),
  (req, res) => {
    res.json({
      content: "This is premium content!",
      message: "You have access to premium content.",
    });
  },
);

export default router;
