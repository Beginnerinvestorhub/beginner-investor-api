// services/backend-api/src/__tests__/unit/stripe.service.test.ts

import { StripeService } from "../../services/paywall/stripe.service";
import Stripe from "stripe";
import { prisma } from "../../config/prisma";
import { SubscriptionTier } from "@prisma/client";

// Mock Stripe
jest.mock("stripe", () => {
  return jest.fn().mockImplementation(() => ({
    checkout: {
      sessions: {
        create: jest.fn(),
        retrieve: jest.fn(),
      },
    },
    customers: {
      create: jest.fn(),
      retrieve: jest.fn(),
    },
    webhooks: {
      constructEvent: jest.fn(),
    },
    refunds: {
      create: jest.fn(),
    },
    subscriptions: {
      update: jest.fn(),
    },
  }));
});

// Mock Prisma
jest.mock("../../config/prisma", () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    payment: {
      create: jest.fn(),
      findUnique: jest.fn(),
      updateMany: jest.fn(),
    },
    subscription: {
      upsert: jest.fn(),
      update: jest.fn(),
      findUnique: jest.fn(),
    },
  },
}));

// Mock environment variables
process.env.STRIPE_SECRET_KEY = "sk_test_mock_key";
process.env.STRIPE_PRICE_ID_BASIC = "price_basic_123";
process.env.STRIPE_PRICE_ID_PREMIUM = "price_premium_123";
process.env.STRIPE_PRICE_ID_ENTERPRISE = "price_enterprise_123";
process.env.STRIPE_SUCCESS_URL = "http://localhost:3001/success";
process.env.STRIPE_CANCEL_URL = "http://localhost:3001/cancel";

describe("StripeService", () => {
  let stripeService: StripeService;
  let mockStripe: jest.Mocked<Stripe>;

  beforeEach(() => {
    stripeService = new StripeService();
    mockStripe = new Stripe("sk_test_mock_key") as jest.Mocked<Stripe>;
    jest.clearAllMocks();
  });

  describe("createCheckoutSession", () => {
    const mockParams = {
      userId: "user_123",
      tier: SubscriptionTier.BASIC,
      successUrl:
        "http://localhost:3001/success?session_id={CHECKOUT_SESSION_ID}",
      cancelUrl: "http://localhost:3001/cancel",
      metadata: { source: "test" },
    };

    it("should create checkout session with valid parameters", async () => {
      // Arrange
      const mockCustomer = { id: "cus_123" };
      const mockSession = {
        id: "cs_test_123",
        url: "https://checkout.stripe.com/test",
        amount_total: 999,
        currency: "usd",
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        stripeCustomerId: null,
        email: "test@example.com",
      });

      (mockStripe.customers.create as jest.Mock).mockResolvedValue(
        mockCustomer as any,
      );
      (mockStripe.checkout.sessions.create as jest.Mock).mockResolvedValue(
        mockSession as any,
      );

      // Act
      const result = await stripeService.createCheckoutSession(mockParams);

      // Assert
      expect(result.sessionId).toBe("cs_test_123");
      expect(result.url).toBe("https://checkout.stripe.com/test");
      expect(mockStripe.customers.create).toHaveBeenCalledWith({
        email: "test@example.com",
        metadata: { userId: "user_123" },
      });
      expect(mockStripe.checkout.sessions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          customer: "cus_123",
          payment_method_types: ["card"],
          mode: "subscription",
          success_url: mockParams.successUrl,
          cancel_url: mockParams.cancelUrl,
          metadata: expect.objectContaining({
            userId: "user_123",
            tier: "BASIC",
          }),
        }),
        expect.objectContaining({
          idempotencyKey: expect.stringMatching(
            /^checkout_user_123_BASIC_\d+$/,
          ),
        }),
      );
    });

    it("should include user metadata in session", async () => {
      // Arrange
      const mockCustomer = { id: "cus_123" };
      const mockSession = {
        id: "cs_test_123",
        url: "https://checkout.stripe.com/test",
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      (mockStripe.customers.create as jest.Mock).mockResolvedValue(
        mockCustomer as any,
      );
      (mockStripe.checkout.sessions.create as jest.Mock).mockResolvedValue(
        mockSession as any,
      );

      // Act
      await stripeService.createCheckoutSession(mockParams);

      // Assert
      expect(mockStripe.checkout.sessions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          metadata: expect.objectContaining({
            userId: "user_123",
            tier: "BASIC",
            source: "test",
            timestamp: expect.any(String),
          }),
        }),
        expect.any(Object),
      );
    });

    it("should handle invalid price ID", async () => {
      // Arrange
      const invalidParams = { ...mockParams, tier: SubscriptionTier.FREE };

      // Act & Assert
      await expect(
        stripeService.createCheckoutSession(invalidParams),
      ).rejects.toThrow("No price ID configured for tier: FREE");
    });

    it("should set correct success and cancel URLs", async () => {
      // Arrange
      const mockCustomer = { id: "cus_123" };
      const mockSession = {
        id: "cs_test_123",
        url: "https://checkout.stripe.com/test",
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      (mockStripe.customers.create as jest.Mock).mockResolvedValue(
        mockCustomer as any,
      );
      (mockStripe.checkout.sessions.create as jest.Mock).mockResolvedValue(
        mockSession as any,
      );

      // Act
      await stripeService.createCheckoutSession(mockParams);

      // Assert
      expect(mockStripe.checkout.sessions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          success_url: mockParams.successUrl,
          cancel_url: mockParams.cancelUrl,
        }),
        expect.any(Object),
      );
    });

    it("should apply idempotency key to prevent duplicates", async () => {
      // Arrange
      const mockCustomer = { id: "cus_123" };
      const mockSession = {
        id: "cs_test_123",
        url: "https://checkout.stripe.com/test",
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      (mockStripe.customers.create as jest.Mock).mockResolvedValue(
        mockCustomer as any,
      );
      (mockStripe.checkout.sessions.create as jest.Mock).mockResolvedValue(
        mockSession as any,
      );

      // Act
      await stripeService.createCheckoutSession(mockParams);

      // Assert
      expect(mockStripe.checkout.sessions.create).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({
          idempotencyKey: expect.stringMatching(
            /^checkout_user_123_BASIC_\d+$/,
          ),
        }),
      );
    });

    it("should reuse existing Stripe customer", async () => {
      // Arrange
      const existingCustomer = { id: "cus_existing" };
      const mockSession = {
        id: "cs_test_123",
        url: "https://checkout.stripe.com/test",
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        stripeCustomerId: "cus_existing",
        email: "test@example.com",
      });

      (mockStripe.customers.retrieve as jest.Mock).mockResolvedValue(
        existingCustomer as any,
      );
      (mockStripe.checkout.sessions.create as jest.Mock).mockResolvedValue(
        mockSession as any,
      );

      // Act
      await stripeService.createCheckoutSession(mockParams);

      // Assert
      expect(mockStripe.customers.retrieve).toHaveBeenCalledWith(
        "cus_existing",
      );
      expect(mockStripe.customers.create).not.toHaveBeenCalled();
      expect(mockStripe.checkout.sessions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          customer: "cus_existing",
        }),
        expect.any(Object),
      );
    });
  });

  describe("handleWebhook", () => {
    it("should verify webhook signature", async () => {
      // Arrange
      const mockEvent = {
        id: "evt_123",
        type: "checkout.session.completed",
        data: { object: { id: "cs_test_123" } },
        created: 1234567890,
      };

      (mockStripe.webhooks.constructEvent as jest.Mock).mockReturnValue(
        mockEvent,
      );

      // Act
      await stripeService.handleWebhookEvent(mockEvent);

      // Assert
      expect(mockStripe.webhooks.constructEvent).toHaveBeenCalledWith(
        JSON.stringify(mockEvent),
        "test_signature",
        process.env.STRIPE_WEBHOOK_SECRET,
      );
    });

    it("should handle checkout.session.completed event", async () => {
      // Arrange
      const mockSession = {
        id: "cs_test_123",
        metadata: { userId: "user_123", tier: "BASIC" },
        payment_intent: "pi_test_123",
        amount_total: 999,
        currency: "usd",
      };

      const mockEvent = {
        id: "evt_123",
        type: "checkout.session.completed",
        data: { object: mockSession },
        created: 1234567890,
      };

      (prisma.payment.create as jest.Mock).mockResolvedValue({
        id: "payment_123",
      });

      // Act
      await stripeService.handleWebhookEvent(mockEvent);

      // Assert
      expect(prisma.payment.create).toHaveBeenCalledWith({
        data: {
          userId: "user_123",
          stripeSessionId: "cs_test_123",
          stripePaymentIntentId: "pi_test_123",
          amount: 999,
          currency: "usd",
          status: "COMPLETED",
          tier: "BASIC",
        },
      });
    });

    it("should handle payment_intent.succeeded event", async () => {
      // Arrange
      const mockPaymentIntent = {
        id: "pi_test_123",
        amount: 999,
        status: "succeeded",
      };

      const mockEvent = {
        id: "evt_123",
        type: "payment_intent.succeeded",
        data: { object: mockPaymentIntent },
        created: 1234567890,
      };

      (prisma.payment.updateMany as jest.Mock).mockResolvedValue({ count: 1 });

      // Act
      await stripeService.handleWebhookEvent(mockEvent);

      // Assert
      expect(prisma.payment.updateMany).toHaveBeenCalledWith({
        where: {
          stripePaymentIntentId: "pi_test_123",
          status: { not: "COMPLETED" },
        },
        data: {
          status: "COMPLETED",
        },
      });
    });

    it("should handle payment_intent.payment_failed event", async () => {
      // Arrange
      const mockPaymentIntent = {
        id: "pi_test_123",
        amount: 999,
        status: "failed",
      };

      const mockEvent = {
        id: "evt_123",
        type: "payment_intent.payment_failed",
        data: { object: mockPaymentIntent },
        created: 1234567890,
      };

      (prisma.payment.updateMany as jest.Mock).mockResolvedValue({ count: 1 });

      // Act
      await stripeService.handleWebhookEvent(mockEvent);

      // Assert
      expect(prisma.payment.updateMany).toHaveBeenCalledWith({
        where: {
          stripePaymentIntentId: "pi_test_123",
        },
        data: {
          status: "FAILED",
        },
      });
    });

    it("should handle customer.subscription.created event", async () => {
      // Arrange
      const mockSubscription = {
        id: "sub_test_123",
        customer: "cus_123",
        status: "active",
        metadata: { userId: "user_123", tier: "BASIC" },
        current_period_start: 1234567890,
        current_period_end: 1234567890 + 30 * 24 * 60 * 60,
        cancel_at_period_end: false,
      };

      const mockEvent = {
        id: "evt_123",
        type: "customer.subscription.created",
        data: { object: mockSubscription },
        created: 1234567890,
      };

      (prisma.subscription.upsert as jest.Mock).mockResolvedValue({
        id: "subscription_123",
      });

      // Act
      await stripeService.handleWebhookEvent(mockEvent);

      // Assert
      expect(prisma.subscription.upsert).toHaveBeenCalledWith({
        where: { stripeSubscriptionId: "sub_test_123" },
        update: {
          status: "active",
          currentPeriodStart: expect.any(Date),
          currentPeriodEnd: expect.any(Date),
          cancelAtPeriodEnd: false,
        },
        create: {
          userId: "user_123",
          stripeSubscriptionId: "sub_test_123",
          stripeCustomerId: "cus_123",
          status: "active",
          tier: "BASIC",
          currentPeriodStart: expect.any(Date),
          currentPeriodEnd: expect.any(Date),
          cancelAtPeriodEnd: false,
        },
      });
    });

    it("should handle customer.subscription.deleted event", async () => {
      // Arrange
      const mockSubscription = {
        id: "sub_test_123",
      };

      const mockEvent = {
        id: "evt_123",
        type: "customer.subscription.deleted",
        data: { object: mockSubscription },
        created: 1234567890,
      };

      (prisma.subscription.update as jest.Mock).mockResolvedValue({
        id: "subscription_123",
      });

      // Act
      await stripeService.handleWebhookEvent(mockEvent);

      // Assert
      expect(prisma.subscription.update).toHaveBeenCalledWith({
        where: { stripeSubscriptionId: "sub_test_123" },
        data: {
          status: "canceled",
          cancelAtPeriodEnd: true,
        },
      });
    });

    it("should reject webhook with invalid signature", async () => {
      // Arrange
      const mockEvent = {
        id: "evt_123",
        type: "checkout.session.completed",
        data: { object: {} },
        created: 1234567890,
      };

      (mockStripe.webhooks.constructEvent as jest.Mock).mockImplementation(
        () => {
          throw new Error("Invalid signature");
        },
      );

      // Act & Assert
      await expect(stripeService.handleWebhookEvent(mockEvent)).rejects.toThrow(
        "Webhook signature verification failed",
      );
    });

    it("should handle duplicate webhook events (idempotency)", async () => {
      // Arrange
      const mockEvent = {
        id: "evt_123",
        type: "checkout.session.completed",
        data: { object: { id: "cs_test_123" } },
        created: 1234567890,
      };

      // Process the same event twice
      (prisma.payment.create as jest.Mock).mockResolvedValue({
        id: "payment_123",
      });

      // Act
      await stripeService.handleWebhookEvent(mockEvent);
      await stripeService.handleWebhookEvent(mockEvent); // Duplicate

      // Assert
      expect(prisma.payment.create).toHaveBeenCalledTimes(1); // Only once due to idempotency
    });
  });

  describe("retrieveSession", () => {
    it("should retrieve session details by ID", async () => {
      // Arrange
      const mockSession = {
        id: "cs_test_123",
        payment_status: "paid",
        subscription: "sub_test_123",
      };

      (mockStripe.checkout.sessions.retrieve as jest.Mock).mockResolvedValue(
        mockSession as any,
      );

      // Act
      const result = await stripeService.retrieveSession("cs_test_123");

      // Assert
      expect(result.session).toEqual(mockSession);
      expect(result.paymentStatus).toBe("paid");
      expect(result.subscriptionId).toBe("sub_test_123");
      expect(mockStripe.checkout.sessions.retrieve).toHaveBeenCalledWith(
        "cs_test_123",
        {
          expand: ["payment_intent", "subscription"],
        },
      );
    });

    it("should return payment status", async () => {
      // Arrange
      const mockSession = {
        id: "cs_test_123",
        payment_status: "unpaid",
      };

      (mockStripe.checkout.sessions.retrieve as jest.Mock).mockResolvedValue(
        mockSession as any,
      );

      // Act
      const result = await stripeService.retrieveSession("cs_test_123");

      // Assert
      expect(result.paymentStatus).toBe("unpaid");
    });

    it("should handle invalid session ID", async () => {
      // Arrange
      (mockStripe.checkout.sessions.retrieve as jest.Mock).mockRejectedValue(
        new Error("No such checkout session"),
      );

      // Act & Assert
      await expect(stripeService.retrieveSession("invalid_id")).rejects.toThrow(
        "Failed to retrieve session: No such checkout session",
      );
    });
  });

  describe("createRefund", () => {
    it("should create refund for completed payment", async () => {
      // Arrange
      const mockPayment = {
        id: "payment_123",
        userId: "user_123",
        stripePaymentIntentId: "pi_test_123",
        status: "COMPLETED",
      };

      const mockRefund = {
        id: "re_test_123",
        amount: 999,
        status: "succeeded",
      };

      (prisma.payment.findUnique as jest.Mock).mockResolvedValue(mockPayment);
      (mockStripe.refunds.create as jest.Mock).mockResolvedValue(
        mockRefund as any,
      );

      // Act
      const result = await stripeService.createRefund("payment_123");

      // Assert
      expect(result).toEqual(mockRefund);
      expect(mockStripe.refunds.create).toHaveBeenCalledWith({
        payment_intent: "pi_test_123",
        amount: undefined,
        metadata: {
          paymentId: "payment_123",
          userId: "user_123",
        },
      });
    });

    it("should create partial refund when amount specified", async () => {
      // Arrange
      const mockPayment = {
        id: "payment_123",
        userId: "user_123",
        stripePaymentIntentId: "pi_test_123",
        status: "COMPLETED",
      };

      (prisma.payment.findUnique as jest.Mock).mockResolvedValue(mockPayment);
      (mockStripe.refunds.create as jest.Mock).mockResolvedValue({
        id: "re_test_123",
      } as any);

      // Act
      await stripeService.createRefund("payment_123", 5.99);

      // Assert
      expect(mockStripe.refunds.create).toHaveBeenCalledWith({
        payment_intent: "pi_test_123",
        amount: 599, // Converted to cents
        metadata: expect.any(Object),
      });
    });

    it("should reject refund for non-completed payment", async () => {
      // Arrange
      const mockPayment = {
        id: "payment_123",
        status: "FAILED",
      };

      (prisma.payment.findUnique as jest.Mock).mockResolvedValue(mockPayment);

      // Act & Assert
      await expect(stripeService.createRefund("payment_123")).rejects.toThrow(
        "Can only refund completed payments",
      );
    });

    it("should reject refund for non-existent payment", async () => {
      // Arrange
      (prisma.payment.findUnique as jest.Mock).mockResolvedValue(null);

      // Act & Assert
      await expect(stripeService.createRefund("payment_123")).rejects.toThrow(
        "Payment not found",
      );
    });
  });

  describe("cancelSubscription", () => {
    it("should cancel subscription at period end", async () => {
      // Arrange
      const mockSubscription = {
        id: "sub_test_123",
        status: "active",
        cancel_at_period_end: true,
      };

      (mockStripe.subscriptions.update as jest.Mock).mockResolvedValue(
        mockSubscription as any,
      );
      (prisma.subscription.update as jest.Mock).mockResolvedValue({
        id: "subscription_123",
      });

      // Act
      const result = await stripeService.cancelSubscription(
        "sub_test_123",
        true,
      );

      // Assert
      expect(result).toEqual(mockSubscription);
      expect(mockStripe.subscriptions.update).toHaveBeenCalledWith(
        "sub_test_123",
        {
          cancel_at_period_end: true,
        },
      );
      expect(prisma.subscription.update).toHaveBeenCalledWith({
        where: { stripeSubscriptionId: "sub_test_123" },
        data: {
          cancelAtPeriodEnd: true,
          status: "active",
        },
      });
    });

    it("should cancel subscription immediately", async () => {
      // Arrange
      const mockSubscription = {
        id: "sub_test_123",
        status: "canceled",
        cancel_at_period_end: false,
      };

      (mockStripe.subscriptions.update as jest.Mock).mockResolvedValue(
        mockSubscription as any,
      );
      (prisma.subscription.update as jest.Mock).mockResolvedValue({
        id: "subscription_123",
      });

      // Act
      const result = await stripeService.cancelSubscription(
        "sub_test_123",
        false,
      );

      // Assert
      expect(mockStripe.subscriptions.update).toHaveBeenCalledWith(
        "sub_test_123",
        {
          cancel_at_period_end: false,
        },
      );
      expect(prisma.subscription.update).toHaveBeenCalledWith({
        where: { stripeSubscriptionId: "sub_test_123" },
        data: {
          cancelAtPeriodEnd: false,
          status: "canceled",
        },
      });
    });
  });

  describe("verifyWebhookSignature", () => {
    it("should verify valid webhook signature", () => {
      // Arrange
      const payload = '{"type": "test", "data": {}}';
      const signature = "test_signature";
      const mockEvent = {
        id: "evt_123",
        type: "test",
        data: { object: {} },
      };

      (mockStripe.webhooks.constructEvent as jest.Mock).mockReturnValue(
        mockEvent,
      );

      // Act
      const result = stripeService.verifyWebhookSignature(payload, signature);

      // Assert
      expect(result).toEqual(mockEvent);
      expect(mockStripe.webhooks.constructEvent).toHaveBeenCalledWith(
        payload,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET,
      );
    });

    it("should throw error for invalid signature", () => {
      // Arrange
      const payload = '{"type": "test", "data": {}}';
      const signature = "invalid_signature";

      (mockStripe.webhooks.constructEvent as jest.Mock).mockImplementation(
        () => {
          throw new Error("Invalid signature");
        },
      );

      // Act & Assert
      expect(() => {
        stripeService.verifyWebhookSignature(payload, signature);
      }).toThrow("Webhook signature verification failed: Invalid signature");
    });
  });
});
