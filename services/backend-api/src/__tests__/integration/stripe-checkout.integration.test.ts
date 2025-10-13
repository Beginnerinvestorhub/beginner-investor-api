// services/backend-api/src/__tests__/integration/stripe-checkout.integration.test.ts

import request from "supertest";
import { app } from "../../index";
import { prisma } from "../../config/prisma";
import { SubscriptionTier } from "@prisma/client";

// Mock Firebase Admin SDK
jest.mock("firebase-admin", () => ({
  auth: jest.fn(() => ({
    verifyIdToken: jest.fn().mockResolvedValue({
      uid: "test_user_123",
      email: "test@example.com",
      email_verified: true,
    }),
  })),
  firestore: jest.fn(),
  messaging: jest.fn(),
}));

// Mock Stripe
jest.mock("stripe", () => {
  return jest.fn().mockImplementation(() => ({
    checkout: {
      sessions: {
        create: jest.fn().mockResolvedValue({
          id: "cs_test_123",
          url: "https://checkout.stripe.com/test",
          amount_total: 999,
          currency: "usd",
        }),
        retrieve: jest.fn().mockResolvedValue({
          id: "cs_test_123",
          payment_status: "paid",
          subscription: "sub_test_123",
        }),
      },
    },
    customers: {
      create: jest.fn().mockResolvedValue({ id: "cus_test_123" }),
      retrieve: jest.fn().mockResolvedValue({ id: "cus_test_123" }),
    },
    webhooks: {
      constructEvent: jest.fn().mockReturnValue({
        id: "evt_test_123",
        type: "checkout.session.completed",
        data: {
          object: {
            id: "cs_test_123",
            metadata: { userId: "test_user_123", tier: "BASIC" },
            payment_intent: "pi_test_123",
            amount_total: 999,
            currency: "usd",
          },
        },
      }),
    },
  }));
});

// Mock environment variables
process.env.STRIPE_SECRET_KEY = "sk_test_mock_key";
process.env.STRIPE_WEBHOOK_SECRET = "whsec_mock_secret";
process.env.STRIPE_PRICE_ID_BASIC = "price_basic_123";
process.env.STRIPE_PRICE_ID_PREMIUM = "price_premium_123";
process.env.STRIPE_PRICE_ID_ENTERPRISE = "price_enterprise_123";
process.env.STRIPE_SUCCESS_URL = "http://localhost:3001/success";
process.env.STRIPE_CANCEL_URL = "http://localhost:3001/cancel";

describe("Stripe Checkout Integration", () => {
  let testUserId: string;
  let authToken: string;

  beforeAll(async () => {
    // Create test user
    const testUser = await prisma.user.create({
      data: {
        id: "test_user_123",
        email: "test@example.com",
        firebaseUid: "test_user_123",
      },
    });

    testUserId = testUser.id;

    // Mock Firebase ID token
    authToken = "mock_firebase_token";
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.payment.deleteMany({ where: { userId: testUserId } });
    await prisma.subscription.deleteMany({ where: { userId: testUserId } });
    await prisma.user.delete({ where: { id: testUserId } });
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Complete Checkout Flow", () => {
    it("should complete full checkout flow for one-time payment", async () => {
      // This test simulates the complete flow but doesn't actually process payments
      // In a real scenario, you'd need to mock the Stripe webhook processing

      // 1. Create checkout session
      const checkoutResponse = await request(app)
        .post("/api/v1/paywall/subscribe/checkout")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ tier: "BASIC" });

      expect(checkoutResponse.status).toBe(200);
      expect(checkoutResponse.body).toMatchObject({
        success: true,
        sessionId: "cs_test_123",
        url: "https://checkout.stripe.com/test",
      });

      // 2. Retrieve session status (simulating after payment)
      const sessionResponse = await request(app)
        .get(`/api/v1/paywall/session/cs_test_123`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(sessionResponse.status).toBe(200);
      expect(sessionResponse.body).toMatchObject({
        session: expect.objectContaining({
          id: "cs_test_123",
          payment_status: "paid",
        }),
        paymentStatus: "paid",
        subscriptionId: "sub_test_123",
      });

      // 3. Check user subscription (should be created by webhook)
      const subscriptionResponse = await request(app)
        .get("/api/v1/paywall/subscription")
        .set("Authorization", `Bearer ${authToken}`);

      expect(subscriptionResponse.status).toBe(200);
      expect(subscriptionResponse.body).toMatchObject({
        subscription: expect.objectContaining({
          userId: testUserId,
          status: "active",
        }),
        hasActiveSubscription: true,
      });
    });

    it("should complete subscription checkout flow", async () => {
      // 1. Create subscription checkout session
      const checkoutResponse = await request(app)
        .post("/api/v1/paywall/subscribe/checkout")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ tier: "PREMIUM" });

      expect(checkoutResponse.status).toBe(200);
      expect(checkoutResponse.body).toMatchObject({
        success: true,
        sessionId: "cs_test_123",
        url: "https://checkout.stripe.com/test",
      });

      // 2. Simulate webhook processing (in real scenario, this would be called by Stripe)
      const mockWebhookPayload = {
        id: "evt_test_123",
        type: "checkout.session.completed",
        data: {
          object: {
            id: "cs_test_123",
            metadata: { userId: testUserId, tier: "PREMIUM" },
            payment_intent: "pi_test_123",
            amount_total: 1999,
            currency: "usd",
          },
        },
      };

      const webhookResponse = await request(app)
        .post("/api/v1/paywall/webhooks/payment")
        .set("stripe-signature", "test_signature")
        .send(mockWebhookPayload);

      expect(webhookResponse.status).toBe(200);
      expect(webhookResponse.body).toMatchObject({
        received: true,
        eventType: "checkout.session.completed",
        eventId: "evt_test_123",
      });

      // 3. Verify subscription was created in database
      const subscriptionResponse = await request(app)
        .get("/api/v1/paywall/subscription")
        .set("Authorization", `Bearer ${authToken}`);

      expect(subscriptionResponse.status).toBe(200);
      expect(subscriptionResponse.body.hasActiveSubscription).toBe(true);
    });

    it("should handle failed payment gracefully", async () => {
      // 1. Create checkout session
      const checkoutResponse = await request(app)
        .post("/api/v1/paywall/subscribe/checkout")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ tier: "BASIC" });

      expect(checkoutResponse.status).toBe(200);

      // 2. Simulate failed payment webhook
      const mockFailedPaymentWebhook = {
        id: "evt_test_failed",
        type: "payment_intent.payment_failed",
        data: {
          object: {
            id: "pi_test_123",
            last_payment_error: {
              message: "Your card was declined.",
            },
          },
        },
      };

      const webhookResponse = await request(app)
        .post("/api/v1/paywall/webhooks/payment")
        .set("stripe-signature", "test_signature")
        .send(mockFailedPaymentWebhook);

      expect(webhookResponse.status).toBe(200);

      // 3. Check that no subscription was created
      const subscriptionResponse = await request(app)
        .get("/api/v1/paywall/subscription")
        .set("Authorization", `Bearer ${authToken}`);

      expect(subscriptionResponse.status).toBe(200);
      expect(subscriptionResponse.body.hasActiveSubscription).toBe(false);
    });

    it("should handle user canceling checkout", async () => {
      // 1. Create checkout session
      const checkoutResponse = await request(app)
        .post("/api/v1/paywall/subscribe/checkout")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ tier: "BASIC" });

      expect(checkoutResponse.status).toBe(200);

      // 2. User cancels (no webhook received)
      // In real scenario, user would be redirected to cancel URL

      // 3. Check that no subscription was created
      const subscriptionResponse = await request(app)
        .get("/api/v1/paywall/subscription")
        .set("Authorization", `Bearer ${authToken}`);

      expect(subscriptionResponse.status).toBe(200);
      expect(subscriptionResponse.body.hasActiveSubscription).toBe(false);
    });
  });

  describe("Subscription Management", () => {
    beforeEach(async () => {
      // Create a test subscription
      await prisma.subscription.create({
        data: {
          userId: testUserId,
          stripeSubscriptionId: "sub_test_123",
          stripeCustomerId: "cus_test_123",
          status: "active",
          tier: SubscriptionTier.PREMIUM,
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          cancelAtPeriodEnd: false,
        },
      });
    });

    it("should cancel subscription at period end", async () => {
      // Mock Stripe subscription update
      const mockStripe = require("stripe");
      mockStripe.subscriptions = {
        update: jest.fn().mockResolvedValue({
          id: "sub_test_123",
          status: "active",
          cancel_at_period_end: true,
        }),
      };

      const cancelResponse = await request(app)
        .post("/api/v1/paywall/subscription/cancel")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          subscriptionId: "sub_test_123",
          cancelAtPeriodEnd: true,
        });

      expect(cancelResponse.status).toBe(200);
      expect(cancelResponse.body).toMatchObject({
        success: true,
        subscriptionId: "sub_test_123",
        status: "active",
        cancelAtPeriodEnd: true,
      });

      // Verify database was updated
      const subscription = await prisma.subscription.findUnique({
        where: { stripeSubscriptionId: "sub_test_123" },
      });

      expect(subscription?.cancelAtPeriodEnd).toBe(true);
    });

    it("should cancel subscription immediately", async () => {
      // Mock Stripe subscription update
      const mockStripe = require("stripe");
      mockStripe.subscriptions = {
        update: jest.fn().mockResolvedValue({
          id: "sub_test_123",
          status: "canceled",
          cancel_at_period_end: false,
        }),
      };

      const cancelResponse = await request(app)
        .post("/api/v1/paywall/subscription/cancel")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          subscriptionId: "sub_test_123",
          cancelAtPeriodEnd: false,
        });

      expect(cancelResponse.status).toBe(200);
      expect(cancelResponse.body.status).toBe("canceled");

      // Verify database was updated
      const subscription = await prisma.subscription.findUnique({
        where: { stripeSubscriptionId: "sub_test_123" },
      });

      expect(subscription?.status).toBe("canceled");
    });
  });

  describe("Premium Content Access", () => {
    it("should allow access to premium content with valid subscription", async () => {
      // Create premium subscription
      await prisma.subscription.create({
        data: {
          userId: testUserId,
          stripeSubscriptionId: "sub_premium_123",
          stripeCustomerId: "cus_test_123",
          status: "active",
          tier: SubscriptionTier.PREMIUM,
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          cancelAtPeriodEnd: false,
        },
      });

      const response = await request(app)
        .get("/api/v1/paywall/premium-content")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        content: "This is premium content!",
        message: "You have access to premium content.",
      });
    });

    it("should deny access to premium content without subscription", async () => {
      // Ensure no subscription exists
      await prisma.subscription.deleteMany({ where: { userId: testUserId } });

      const response = await request(app)
        .get("/api/v1/paywall/premium-content")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(403);
      expect(response.body).toMatchObject({
        error: "Insufficient subscription tier",
      });
    });

    it("should deny access to premium content with basic subscription", async () => {
      // Create basic subscription (not premium)
      await prisma.subscription.deleteMany({ where: { userId: testUserId } });
      await prisma.subscription.create({
        data: {
          userId: testUserId,
          stripeSubscriptionId: "sub_basic_123",
          stripeCustomerId: "cus_test_123",
          status: "active",
          tier: SubscriptionTier.BASIC,
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          cancelAtPeriodEnd: false,
        },
      });

      const response = await request(app)
        .get("/api/v1/paywall/premium-content")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(403);
      expect(response.body).toMatchObject({
        error: "Insufficient subscription tier",
      });
    });
  });

  describe("Error Handling", () => {
    it("should handle missing authentication", async () => {
      const response = await request(app)
        .post("/api/v1/paywall/subscribe/checkout")
        .send({ tier: "BASIC" });

      expect(response.status).toBe(401);
      expect(response.body).toMatchObject({
        error: "User not authenticated",
      });
    });

    it("should handle invalid subscription tier", async () => {
      const response = await request(app)
        .post("/api/v1/paywall/subscribe/checkout")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ tier: "INVALID_TIER" });

      expect(response.status).toBe(500);
      expect(response.body).toMatchObject({
        error: "Failed to create checkout session",
      });
    });

    it("should handle invalid session ID", async () => {
      const response = await request(app)
        .get("/api/v1/paywall/session/invalid_session_id")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(500);
      expect(response.body).toMatchObject({
        error: "Failed to retrieve session",
      });
    });

    it("should handle missing subscription ID for cancellation", async () => {
      const response = await request(app)
        .post("/api/v1/paywall/subscription/cancel")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ cancelAtPeriodEnd: true });

      expect(response.status).toBe(400);
      expect(response.body).toMatchObject({
        error: "Subscription ID required",
      });
    });

    it("should handle webhook with missing signature", async () => {
      const response = await request(app)
        .post("/api/v1/paywall/webhooks/payment")
        .send({ type: "test" });

      expect(response.status).toBe(400);
      expect(response.body).toMatchObject({
        error: "Missing Stripe signature",
      });
    });

    it("should handle webhook with invalid signature", async () => {
      const response = await request(app)
        .post("/api/v1/paywall/webhooks/payment")
        .set("stripe-signature", "invalid_signature")
        .send({ type: "test" });

      expect(response.status).toBe(400);
      expect(response.body).toMatchObject({
        error: "Webhook signature verification failed",
      });
    });
  });

  describe("Refund Processing", () => {
    beforeEach(async () => {
      // Create a test payment
      await prisma.payment.create({
        data: {
          userId: testUserId,
          stripeSessionId: "cs_test_123",
          stripePaymentIntentId: "pi_test_123",
          amount: 999,
          currency: "usd",
          status: "COMPLETED",
          tier: SubscriptionTier.BASIC,
        },
      });
    });

    it("should create refund for completed payment", async () => {
      // Mock Stripe refund creation
      const mockStripe = require("stripe");
      mockStripe.refunds = {
        create: jest.fn().mockResolvedValue({
          id: "re_test_123",
          amount: 999,
          status: "succeeded",
        }),
      };

      const response = await request(app)
        .post(`/api/v1/paywall/refund/payment_123`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({ amount: 9.99 });

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        success: true,
        refundId: "re_test_123",
        amount: 9.99,
        status: "succeeded",
      });
    });

    it("should reject refund for non-existent payment", async () => {
      const response = await request(app)
        .post("/api/v1/paywall/refund/non_existent_payment")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(500);
      expect(response.body).toMatchObject({
        error: "Failed to create refund",
      });
    });
  });
});
