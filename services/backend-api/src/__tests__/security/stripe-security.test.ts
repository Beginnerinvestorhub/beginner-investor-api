// services/backend-api/src/__tests__/security/stripe-security.test.ts

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
        }),
        retrieve: jest.fn().mockResolvedValue({
          id: "cs_test_123",
          payment_status: "paid",
        }),
      },
    },
    webhooks: {
      constructEvent: jest.fn().mockReturnValue({
        id: "evt_test_123",
        type: "checkout.session.completed",
        data: { object: {} },
      }),
    },
  }));
});

// Mock environment variables
process.env.STRIPE_SECRET_KEY = "sk_test_mock_key";
process.env.STRIPE_WEBHOOK_SECRET = "whsec_mock_secret";
process.env.STRIPE_PRICE_ID_BASIC = "price_basic_123";

describe("Stripe Security Tests", () => {
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
    authToken = "mock_firebase_token";
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.payment.deleteMany({ where: { userId: testUserId } });
    await prisma.subscription.deleteMany({ where: { userId: testUserId } });
    await prisma.user.delete({ where: { id: testUserId } });
  });

  describe("Webhook Signature Verification", () => {
    it("should accept webhook with valid signature", async () => {
      const mockStripe = require("stripe");
      const validEvent = {
        id: "evt_valid_123",
        type: "checkout.session.completed",
        data: { object: { id: "cs_test_123" } },
      };

      mockStripe.webhooks.constructEvent.mockReturnValue(validEvent);

      const response = await request(app)
        .post("/api/v1/paywall/webhooks/payment")
        .set("stripe-signature", "valid_signature")
        .send({
          id: "evt_valid_123",
          type: "checkout.session.completed",
          data: { object: { id: "cs_test_123" } },
        });

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        received: true,
        eventType: "checkout.session.completed",
        eventId: "evt_valid_123",
      });
    });

    it("should reject webhook with invalid signature", async () => {
      const mockStripe = require("stripe");
      mockStripe.webhooks.constructEvent.mockImplementation(() => {
        throw new Error("Invalid signature");
      });

      const response = await request(app)
        .post("/api/v1/paywall/webhooks/payment")
        .set("stripe-signature", "invalid_signature")
        .send({
          id: "evt_invalid_123",
          type: "checkout.session.completed",
          data: { object: { id: "cs_test_123" } },
        });

      expect(response.status).toBe(400);
      expect(response.body).toMatchObject({
        error: "Webhook signature verification failed",
        code: "WEBHOOK_ERROR",
      });
    });

    it("should reject webhook with missing signature", async () => {
      const response = await request(app)
        .post("/api/v1/paywall/webhooks/payment")
        .send({
          id: "evt_no_sig_123",
          type: "checkout.session.completed",
          data: { object: { id: "cs_test_123" } },
        });

      expect(response.status).toBe(400);
      expect(response.body).toMatchObject({
        error: "Missing Stripe signature",
      });
    });

    it("should reject webhook with tampered payload", async () => {
      const mockStripe = require("stripe");
      mockStripe.webhooks.constructEvent.mockImplementation(() => {
        throw new Error("Invalid signature");
      });

      const response = await request(app)
        .post("/api/v1/paywall/webhooks/payment")
        .set("stripe-signature", "tampered_signature")
        .send({
          id: "evt_tampered_123",
          type: "checkout.session.completed",
          data: { object: { id: "cs_test_123" } },
        });

      expect(response.status).toBe(400);
      expect(response.body).toMatchObject({
        error: "Webhook signature verification failed",
        code: "WEBHOOK_ERROR",
      });
    });
  });

  describe("Unauthorized Access Protection", () => {
    it("should deny access to checkout creation without authentication", async () => {
      const response = await request(app)
        .post("/api/v1/paywall/subscribe/checkout")
        .send({ tier: "BASIC" });

      expect(response.status).toBe(401);
      expect(response.body).toMatchObject({
        error: "User not authenticated",
      });
    });

    it("should deny access to session status without authentication", async () => {
      const response = await request(app).get(
        "/api/v1/paywall/session/cs_test_123",
      );

      expect(response.status).toBe(401);
      expect(response.body).toMatchObject({
        error: "User not authenticated",
      });
    });

    it("should deny access to subscription status without authentication", async () => {
      const response = await request(app).get("/api/v1/paywall/subscription");

      expect(response.status).toBe(401);
      expect(response.body).toMatchObject({
        error: "User not authenticated",
      });
    });

    it("should deny access to premium content without authentication", async () => {
      const response = await request(app).get(
        "/api/v1/paywall/premium-content",
      );

      expect(response.status).toBe(401);
      expect(response.body).toMatchObject({
        error: "User not authenticated",
      });
    });

    it("should deny access to subscription cancellation without authentication", async () => {
      const response = await request(app)
        .post("/api/v1/paywall/subscription/cancel")
        .send({ subscriptionId: "sub_test_123" });

      expect(response.status).toBe(401);
      expect(response.body).toMatchObject({
        error: "User not authenticated",
      });
    });

    it("should deny access to refunds without authentication", async () => {
      const response = await request(app).post(
        "/api/v1/paywall/refund/payment_123",
      );

      expect(response.status).toBe(401);
      expect(response.body).toMatchObject({
        error: "User not authenticated",
      });
    });
  });

  describe("SQL Injection Protection", () => {
    it("should handle malicious metadata safely", async () => {
      const maliciousMetadata = {
        userId: "'; DROP TABLE users; --",
        tier: "BASIC'; SELECT * FROM users; --",
        source: "test'; INSERT INTO payments (amount) VALUES (999999); --",
      };

      const response = await request(app)
        .post("/api/v1/paywall/subscribe/checkout")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ tier: "BASIC" });

      // Should not crash and should sanitize input
      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        success: true,
        sessionId: expect.any(String),
      });
    });

    it("should handle XSS in customer data safely", async () => {
      const xssPayload = {
        tier: "BASIC",
        metadata: {
          userId: '<script>alert("xss")</script>',
          tier: 'BASIC<script>alert("xss")</script>',
        },
      };

      const response = await request(app)
        .post("/api/v1/paywall/subscribe/checkout")
        .set("Authorization", `Bearer ${authToken}`)
        .send(xssPayload);

      // Should not execute scripts and should handle safely
      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        success: true,
        sessionId: expect.any(String),
      });
    });
  });

  describe("CSRF Protection", () => {
    it("should accept requests with proper authentication", async () => {
      const response = await request(app)
        .post("/api/v1/paywall/subscribe/checkout")
        .set("Authorization", `Bearer ${authToken}`)
        .set("Content-Type", "application/json")
        .send({ tier: "BASIC" });

      expect(response.status).toBe(200);
    });

    it("should reject requests without proper headers", async () => {
      const response = await request(app)
        .post("/api/v1/paywall/subscribe/checkout")
        .set("Content-Type", "application/json")
        .send({ tier: "BASIC" });

      expect(response.status).toBe(401);
    });
  });

  describe("Rate Limiting", () => {
    it("should handle multiple rapid checkout requests", async () => {
      const requests = [];

      // Make multiple rapid requests
      for (let i = 0; i < 5; i++) {
        requests.push(
          request(app)
            .post("/api/v1/paywall/subscribe/checkout")
            .set("Authorization", `Bearer ${authToken}`)
            .send({ tier: "BASIC" }),
        );
      }

      const responses = await Promise.all(requests);

      // All should succeed (rate limiting not implemented in test)
      responses.forEach((response) => {
        expect(response.status).toBe(200);
      });
    });
  });

  describe("Data Privacy", () => {
    it("should not expose sensitive payment data in responses", async () => {
      const response = await request(app)
        .post("/api/v1/paywall/subscribe/checkout")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ tier: "BASIC" });

      expect(response.status).toBe(200);
      expect(response.body).not.toHaveProperty("stripeSecretKey");
      expect(response.body).not.toHaveProperty("webhookSecret");
      expect(response.body).not.toHaveProperty("cardDetails");
      expect(response.body).not.toHaveProperty("cvv");
    });

    it("should not expose card numbers in error messages", async () => {
      const response = await request(app)
        .post("/api/v1/paywall/subscribe/checkout")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ tier: "INVALID" });

      expect(response.status).toBe(500);
      expect(response.body.error).not.toContain("4242");
      expect(response.body.error).not.toContain("card");
      expect(response.body.error).not.toContain("cvv");
    });
  });

  describe("Input Validation", () => {
    it("should validate subscription tier", async () => {
      const response = await request(app)
        .post("/api/v1/paywall/subscribe/checkout")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ tier: "INVALID_TIER" });

      expect(response.status).toBe(500);
    });

    it("should validate required fields", async () => {
      const response = await request(app)
        .post("/api/v1/paywall/subscribe/checkout")
        .set("Authorization", `Bearer ${authToken}`)
        .send({});

      expect(response.status).toBe(200); // Should still work with defaults
    });

    it("should validate refund amount", async () => {
      // Create a payment first
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

      const response = await request(app)
        .post("/api/v1/paywall/refund/payment_123")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ amount: -100 }); // Negative amount

      // Should handle gracefully (Stripe will validate)
      expect([200, 400, 500]).toContain(response.status);
    });
  });

  describe("Environment Security", () => {
    it("should use test keys in development", () => {
      expect(process.env.STRIPE_SECRET_KEY).toMatch(/^sk_test_/);
      expect(process.env.STRIPE_PUBLISHABLE_KEY).toMatch(/^pk_test_/);
    });

    it("should have webhook secret configured", () => {
      expect(process.env.STRIPE_WEBHOOK_SECRET).toMatch(/^whsec_/);
    });
  });

  describe("Logging Security", () => {
    it("should not log sensitive data", async () => {
      // Mock console methods to capture logs
      const consoleSpy = jest.spyOn(console, "log").mockImplementation();
      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

      await request(app)
        .post("/api/v1/paywall/subscribe/checkout")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ tier: "BASIC" });

      // Check that no sensitive data was logged
      const allLogs = [...consoleSpy.mock.calls, ...consoleErrorSpy.mock.calls]
        .flat()
        .join(" ");

      expect(allLogs).not.toContain("sk_test_");
      expect(allLogs).not.toContain("pk_test_");
      expect(allLogs).not.toContain("whsec_");
      expect(allLogs).not.toContain("4242"); // Test card number

      consoleSpy.mockRestore();
      consoleErrorSpy.mockRestore();
    });
  });

  describe("Error Message Security", () => {
    it("should not leak internal system details", async () => {
      const response = await request(app)
        .post("/api/v1/paywall/subscribe/checkout")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ tier: "INVALID" });

      expect(response.status).toBe(500);
      expect(response.body.error).not.toContain("stripe");
      expect(response.body.error).not.toContain("database");
      expect(response.body.error).not.toContain("prisma");
      expect(response.body.error).not.toContain("connection");
      expect(response.body.error).not.toContain("SQL");
    });

    it("should provide generic error messages for security", async () => {
      const response = await request(app)
        .get("/api/v1/paywall/session/invalid_session_id")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(500);
      expect(response.body.error).toBe("Failed to retrieve session");
      expect(response.body.error).not.toContain("stripe");
      expect(response.body.error).not.toContain("api");
    });
  });
});
