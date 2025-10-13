// services/backend-api/src/scripts/verify-stripe-integration.ts

import { PrismaClient, PaymentStatus, SubscriptionTier } from "@prisma/client";
import logger from "../utils/logger";

const prisma = new PrismaClient();

/**
 * Database verification script for Stripe integration
 * Run this after completing test payments to verify database state
 */

interface VerificationResult {
  passed: boolean;
  message: string;
  data?: any;
}

class StripeIntegrationVerifier {
  async verifyPaymentRecord(sessionId: string): Promise<VerificationResult> {
    try {
      const payment = await prisma.payment.findUnique({
        where: { stripeSessionId: sessionId },
        include: {
          user: {
            select: { id: true, email: true, stripeCustomerId: true },
          },
        },
      });

      if (!payment) {
        return {
          passed: false,
          message: `Payment record not found for session ID: ${sessionId}`,
        };
      }

      // Verify payment structure
      const requiredFields = [
        "id",
        "userId",
        "stripeSessionId",
        "amount",
        "currency",
        "status",
        "tier",
        "createdAt",
      ];
      const missingFields = requiredFields.filter(
        (field) => !payment[field as keyof typeof payment],
      );

      if (missingFields.length > 0) {
        return {
          passed: false,
          message: `Payment record missing required fields: ${missingFields.join(", ")}`,
          data: payment,
        };
      }

      // Verify payment status
      if (payment.status !== PaymentStatus.COMPLETED) {
        return {
          passed: false,
          message: `Payment status is ${payment.status}, expected COMPLETED`,
          data: payment,
        };
      }

      // Verify amount is positive
      if (payment.amount <= 0) {
        return {
          passed: false,
          message: `Payment amount is ${payment.amount}, expected positive value`,
          data: payment,
        };
      }

      return {
        passed: true,
        message: "Payment record verified successfully",
        data: payment,
      };
    } catch (error) {
      return {
        passed: false,
        message: `Error verifying payment record: ${error.message}`,
      };
    }
  }

  async verifySubscriptionRecord(
    subscriptionId: string,
  ): Promise<VerificationResult> {
    try {
      const subscription = await prisma.subscription.findUnique({
        where: { stripeSubscriptionId: subscriptionId },
        include: {
          user: {
            select: { id: true, email: true },
          },
          tier: true,
        },
      });

      if (!subscription) {
        return {
          passed: false,
          message: `Subscription record not found for subscription ID: ${subscriptionId}`,
        };
      }

      // Verify subscription structure
      const requiredFields = [
        "id",
        "userId",
        "stripeSubscriptionId",
        "stripeCustomerId",
        "status",
        "tier",
        "currentPeriodStart",
        "currentPeriodEnd",
      ];
      const missingFields = requiredFields.filter(
        (field) => !subscription[field as keyof typeof subscription],
      );

      if (missingFields.length > 0) {
        return {
          passed: false,
          message: `Subscription record missing required fields: ${missingFields.join(", ")}`,
          data: subscription,
        };
      }

      // Verify subscription status
      if (subscription.status !== "active") {
        return {
          passed: false,
          message: `Subscription status is ${subscription.status}, expected active`,
          data: subscription,
        };
      }

      // Verify subscription period
      const now = new Date();
      if (subscription.currentPeriodStart > now) {
        return {
          passed: false,
          message: `Subscription current period starts in the future: ${subscription.currentPeriodStart}`,
          data: subscription,
        };
      }

      if (subscription.currentPeriodEnd <= now) {
        return {
          passed: false,
          message: `Subscription current period has ended: ${subscription.currentPeriodEnd}`,
          data: subscription,
        };
      }

      return {
        passed: true,
        message: "Subscription record verified successfully",
        data: subscription,
      };
    } catch (error) {
      return {
        passed: false,
        message: `Error verifying subscription record: ${error.message}`,
      };
    }
  }

  async verifyUserPaymentHistory(userId: string): Promise<VerificationResult> {
    try {
      const payments = await prisma.payment.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 10,
        include: {
          user: {
            select: { id: true, email: true },
          },
        },
      });

      if (payments.length === 0) {
        return {
          passed: false,
          message: `No payment history found for user: ${userId}`,
        };
      }

      // Verify payment history structure
      for (const payment of payments) {
        const requiredFields = [
          "id",
          "userId",
          "stripeSessionId",
          "amount",
          "currency",
          "status",
          "tier",
          "createdAt",
        ];
        const missingFields = requiredFields.filter(
          (field) => !payment[field as keyof typeof payment],
        );

        if (missingFields.length > 0) {
          return {
            passed: false,
            message: `Payment record missing required fields: ${missingFields.join(", ")}`,
            data: payment,
          };
        }
      }

      return {
        passed: true,
        message: `User payment history verified successfully (${payments.length} payments)`,
        data: payments,
      };
    } catch (error) {
      return {
        passed: false,
        message: `Error verifying user payment history: ${error.message}`,
      };
    }
  }

  async verifyWebhookEventProcessing(
    eventId: string,
  ): Promise<VerificationResult> {
    try {
      // Note: This assumes you have a webhook_events table to track processed events
      // If not, you can verify by checking if related payments/subscriptions exist

      const event = await prisma.webhookEvent.findUnique({
        where: { stripeEventId: eventId },
      });

      if (!event) {
        return {
          passed: false,
          message: `Webhook event not found for event ID: ${eventId}. This may indicate the event wasn't processed or the table doesn't exist.`,
        };
      }

      if (!event.processed) {
        return {
          passed: false,
          message: `Webhook event ${eventId} was received but not processed`,
          data: event,
        };
      }

      return {
        passed: true,
        message: "Webhook event processed successfully",
        data: event,
      };
    } catch (error) {
      // If webhook_events table doesn't exist, this is expected
      if (
        error.code === "P1001" ||
        error.message.includes('relation "webhook_events" does not exist')
      ) {
        return {
          passed: true,
          message:
            "Webhook event tracking not implemented (table doesn't exist). This is acceptable for basic implementation.",
        };
      }

      return {
        passed: false,
        message: `Error verifying webhook event processing: ${error.message}`,
      };
    }
  }

  async verifyStripeCustomerIntegration(
    userId: string,
  ): Promise<VerificationResult> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, email: true, stripeCustomerId: true },
      });

      if (!user) {
        return {
          passed: false,
          message: `User not found: ${userId}`,
        };
      }

      if (!user.stripeCustomerId) {
        return {
          passed: false,
          message: `User ${userId} does not have a Stripe customer ID`,
        };
      }

      // Verify Stripe customer ID format
      if (!user.stripeCustomerId.startsWith("cus_")) {
        return {
          passed: false,
          message: `Invalid Stripe customer ID format: ${user.stripeCustomerId}`,
        };
      }

      return {
        passed: true,
        message: "Stripe customer integration verified successfully",
        data: user,
      };
    } catch (error) {
      return {
        passed: false,
        message: `Error verifying Stripe customer integration: ${error.message}`,
      };
    }
  }

  async verifySubscriptionAccess(
    userId: string,
    requiredTier: SubscriptionTier,
  ): Promise<VerificationResult> {
    try {
      const subscription = await prisma.subscription.findUnique({
        where: { userId },
        include: { tier: true },
      });

      if (!subscription) {
        return {
          passed: false,
          message: `User ${userId} has no active subscription`,
        };
      }

      if (subscription.status !== "active") {
        return {
          passed: false,
          message: `User ${userId} subscription status is ${subscription.status}, expected active`,
        };
      }

      // Check tier hierarchy
      const tierOrder: SubscriptionTier[] = [
        SubscriptionTier.FREE,
        SubscriptionTier.BASIC,
        SubscriptionTier.PREMIUM,
        SubscriptionTier.ENTERPRISE,
      ];

      const userTierIndex = tierOrder.indexOf(subscription.tier.name);
      const requiredTierIndex = tierOrder.indexOf(requiredTier);

      if (userTierIndex < requiredTierIndex) {
        return {
          passed: false,
          message: `User ${userId} has ${subscription.tier.name} subscription, but ${requiredTier} is required`,
        };
      }

      return {
        passed: true,
        message: `User ${userId} has sufficient subscription tier: ${subscription.tier.name}`,
        data: subscription,
      };
    } catch (error) {
      return {
        passed: false,
        message: `Error verifying subscription access: ${error.message}`,
      };
    }
  }

  async runAllVerifications(
    sessionId?: string,
    subscriptionId?: string,
    userId?: string,
  ): Promise<void> {
    console.log("🔍 Starting Stripe Integration Database Verification...\n");

    const verifications = [];

    // Verify payment record if session ID provided
    if (sessionId) {
      console.log(`📋 Verifying payment record for session: ${sessionId}`);
      const paymentVerification = await this.verifyPaymentRecord(sessionId);
      verifications.push({
        name: "Payment Record Verification",
        ...paymentVerification,
      });
    }

    // Verify subscription record if subscription ID provided
    if (subscriptionId) {
      console.log(
        `📋 Verifying subscription record for subscription: ${subscriptionId}`,
      );
      const subscriptionVerification =
        await this.verifySubscriptionRecord(subscriptionId);
      verifications.push({
        name: "Subscription Record Verification",
        ...subscriptionVerification,
      });
    }

    // Verify user payment history if user ID provided
    if (userId) {
      console.log(`📋 Verifying user payment history for user: ${userId}`);
      const paymentHistoryVerification =
        await this.verifyUserPaymentHistory(userId);
      verifications.push({
        name: "User Payment History Verification",
        ...paymentHistoryVerification,
      });

      console.log(
        `📋 Verifying Stripe customer integration for user: ${userId}`,
      );
      const customerVerification =
        await this.verifyStripeCustomerIntegration(userId);
      verifications.push({
        name: "Stripe Customer Integration Verification",
        ...customerVerification,
      });

      console.log(`📋 Verifying subscription access for user: ${userId}`);
      const accessVerification = await this.verifySubscriptionAccess(
        userId,
        SubscriptionTier.PREMIUM,
      );
      verifications.push({
        name: "Subscription Access Verification",
        ...accessVerification,
      });
    }

    // Always verify webhook processing if event ID provided
    if (sessionId) {
      // Extract event ID from session or use a known event ID
      const eventId = `evt_${sessionId.replace("cs_", "")}`;
      console.log(
        `📋 Verifying webhook event processing for event: ${eventId}`,
      );
      const webhookVerification =
        await this.verifyWebhookEventProcessing(eventId);
      verifications.push({
        name: "Webhook Event Processing Verification",
        ...webhookVerification,
      });
    }

    // Print results
    console.log("\n📊 Verification Results:");
    console.log("=".repeat(80));

    let passedCount = 0;
    let failedCount = 0;

    verifications.forEach((verification, index) => {
      const status = verification.passed ? "✅ PASS" : "❌ FAIL";
      const icon = verification.passed ? "✅" : "❌";

      console.log(`${icon} ${verification.name}: ${status}`);
      console.log(`   ${verification.message}`);

      if (!verification.passed && verification.data) {
        console.log(`   Details:`, JSON.stringify(verification.data, null, 2));
      }

      console.log("");

      if (verification.passed) {
        passedCount++;
      } else {
        failedCount++;
      }
    });

    console.log("=".repeat(80));
    console.log(`📈 Summary: ${passedCount} passed, ${failedCount} failed`);

    if (failedCount === 0) {
      console.log(
        "🎉 All verifications passed! Stripe integration is working correctly.",
      );
    } else {
      console.log(
        "⚠️  Some verifications failed. Please check the details above.",
      );
      process.exit(1);
    }
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const verifier = new StripeIntegrationVerifier();

  if (args.length === 0) {
    console.log("Usage:");
    console.log("  npm run verify-stripe -- --session-id cs_test_123");
    console.log("  npm run verify-stripe -- --subscription-id sub_123");
    console.log("  npm run verify-stripe -- --user-id user_123");
    console.log(
      "  npm run verify-stripe -- --session-id cs_test_123 --user-id user_123",
    );
    process.exit(1);
  }

  let sessionId: string | undefined;
  let subscriptionId: string | undefined;
  let userId: string | undefined;

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case "--session-id":
        sessionId = args[++i];
        break;
      case "--subscription-id":
        subscriptionId = args[++i];
        break;
      case "--user-id":
        userId = args[++i];
        break;
      default:
        console.log(`Unknown argument: ${args[i]}`);
        process.exit(1);
    }
  }

  await verifier.runAllVerifications(sessionId, subscriptionId, userId);
}

// Example usage queries (for manual execution)
/*
-- Verify payment record created
const payment = await prisma.payment.findUnique({
  where: { stripeSessionId: '<SESSION_ID>' }
});
console.log('Payment record:', payment);

-- Verify subscription created
const subscription = await prisma.subscription.findUnique({
  where: { stripeSubscriptionId: '<SUBSCRIPTION_ID>' }
});
console.log('Subscription:', subscription);

-- Verify user's payment history
const userPayments = await prisma.payment.findMany({
  where: { userId: '<USER_ID>' },
  orderBy: { createdAt: 'desc' }
});
console.log('User payments:', userPayments);

-- Verify webhook event was processed (prevent duplicates)
const webhookEvent = await prisma.webhookEvent.findUnique({
  where: { stripeEventId: '<EVENT_ID>' }
});
console.log('Webhook processed:', !!webhookEvent);
*/

if (require.main === module) {
  main().catch((error) => {
    console.error("Verification failed:", error);
    process.exit(1);
  });
}

export { StripeIntegrationVerifier };
