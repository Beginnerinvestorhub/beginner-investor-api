# Stripe Checkout Error Scenario Testing Matrix - Beginner Investor Hub

## 📋 **Error Scenario Testing Matrix**

This matrix provides comprehensive test cases for all possible error scenarios in the Stripe Checkout integration.

| Scenario | Input | Expected Status | Expected Response | Database Impact | Notes |
|----------|-------|-----------------|-------------------|-----------------|-------|
| **Valid checkout creation** | Valid params | 200 | Session ID returned | Session logged | Normal flow |
| **Invalid price ID** | Bad price ID | 500 | "Failed to create checkout session" | None | Price ID validation |
| **Missing authentication** | No token | 401 | "User not authenticated" | None | Auth middleware |
| **Expired card** | 4000...0069 | 200 | Session created (fails at Stripe) | Session logged | Stripe handles decline |
| **Declined payment** | 4000...0002 | 200 | Session created (fails at Stripe) | Session logged | Stripe handles decline |
| **Valid webhook signature** | Valid event | 200 | "Webhook received" | Payment/subscription created | Normal webhook flow |
| **Invalid webhook signature** | Tampered event | 400 | "Webhook signature verification failed" | None | Security validation |
| **Duplicate webhook** | Same event ID | 200 | "Webhook received" | None (idempotent) | Prevents duplicates |
| **Missing webhook secret** | Valid event | 500 | "Configuration error" | None | Environment validation |
| **Database error during webhook** | Valid event | 500 | "Database error" | Retry mechanism | Error handling |
| **Network error to Stripe** | Valid request | 500 | "Stripe API error" | None | Network resilience |
| **User cancels checkout** | Cancel action | 200 | Redirect to cancel URL | Session marked canceled | User abandonment |

## 🧪 **Detailed Test Cases**

### **1. Authentication Errors**

#### **Test Case: Missing Authentication Token**
```bash
curl -X POST http://localhost:3000/api/v1/paywall/subscribe/checkout \
  -H "Content-Type: application/json" \
  -d '{"tier": "BASIC"}'

# Expected: 401 Unauthorized
{
  "error": "User not authenticated",
  "code": "USER_NOT_AUTHENTICATED"
}
```

#### **Test Case: Invalid Authentication Token**
```bash
curl -X POST http://localhost:3000/api/v1/paywall/subscribe/checkout \
  -H "Authorization: Bearer invalid_token" \
  -H "Content-Type: application/json" \
  -d '{"tier": "BASIC"}'

# Expected: 401 Unauthorized
{
  "error": "User not authenticated",
  "code": "USER_NOT_AUTHENTICATED"
}
```

### **2. Input Validation Errors**

#### **Test Case: Invalid Subscription Tier**
```bash
curl -X POST http://localhost:3000/api/v1/paywall/subscribe/checkout \
  -H "Authorization: Bearer VALID_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"tier": "INVALID_TIER"}'

# Expected: 500 Internal Server Error
{
  "error": "Failed to create checkout session"
}
```

#### **Test Case: Missing Required Fields**
```bash
curl -X POST http://localhost:3000/api/v1/paywall/subscribe/checkout \
  -H "Authorization: Bearer VALID_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}'

# Expected: 200 OK (uses defaults)
{
  "success": true,
  "sessionId": "cs_test_...",
  "url": "https://checkout.stripe.com/..."
}
```

#### **Test Case: Malformed JSON**
```bash
curl -X POST http://localhost:3000/api/v1/paywall/subscribe/checkout \
  -H "Authorization: Bearer VALID_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"tier": "BASIC", invalid_json}'

# Expected: 400 Bad Request
{
  "error": "Invalid JSON payload"
}
```

### **3. Stripe API Errors**

#### **Test Case: Invalid Price ID**
```bash
# Set invalid price ID in environment
STRIPE_PRICE_ID_BASIC=price_invalid_123

curl -X POST http://localhost:3000/api/v1/paywall/subscribe/checkout \
  -H "Authorization: Bearer VALID_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"tier": "BASIC"}'

# Expected: 500 Internal Server Error
{
  "error": "Failed to create checkout session"
}
```

#### **Test Case: Stripe Service Unavailable**
```bash
# Simulate Stripe API outage by using invalid secret key
STRIPE_SECRET_KEY=sk_test_invalid_key

curl -X POST http://localhost:3000/api/v1/paywall/subscribe/checkout \
  -H "Authorization: Bearer VALID_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"tier": "BASIC"}'

# Expected: 500 Internal Server Error
{
  "error": "Failed to create checkout session"
}
```

### **4. Webhook Processing Errors**

#### **Test Case: Missing Stripe Signature**
```bash
curl -X POST http://localhost:3000/api/v1/paywall/webhooks/payment \
  -H "Content-Type: application/json" \
  -d '{"type": "checkout.session.completed", "data": {...}}'

# Expected: 400 Bad Request
{
  "error": "Missing Stripe signature",
  "code": "WEBHOOK_ERROR"
}
```

#### **Test Case: Invalid Webhook Signature**
```bash
curl -X POST http://localhost:3000/api/v1/paywall/webhooks/payment \
  -H "stripe-signature: invalid_signature" \
  -H "Content-Type: application/json" \
  -d '{"type": "checkout.session.completed", "data": {...}}'

# Expected: 400 Bad Request
{
  "error": "Webhook signature verification failed",
  "code": "WEBHOOK_ERROR"
}
```

#### **Test Case: Tampered Webhook Payload**
```bash
curl -X POST http://localhost:3000/api/v1/paywall/webhooks/payment \
  -H "stripe-signature: valid_but_tampered_signature" \
  -H "Content-Type: application/json" \
  -d '{"type": "checkout.session.completed", "data": {"modified": true}}'

# Expected: 400 Bad Request
{
  "error": "Webhook signature verification failed",
  "code": "WEBHOOK_ERROR"
}
```

#### **Test Case: Duplicate Webhook Event**
```bash
# Send same webhook twice
curl -X POST http://localhost:3000/api/v1/paywall/webhooks/payment \
  -H "stripe-signature: valid_signature" \
  -H "Content-Type: application/json" \
  -d '{"id": "evt_123", "type": "checkout.session.completed", "data": {...}}'

curl -X POST http://localhost:3000/api/v1/paywall/webhooks/payment \
  -H "stripe-signature: valid_signature" \
  -H "Content-Type: application/json" \
  -d '{"id": "evt_123", "type": "checkout.session.completed", "data": {...}}'

# Expected: Both return 200 OK (idempotent)
{
  "received": true,
  "eventType": "checkout.session.completed",
  "eventId": "evt_123"
}
```

### **5. Database Errors**

#### **Test Case: Database Connection Failure**
```typescript
// Simulate by stopping database service
// All database operations should fail gracefully

curl -X POST http://localhost:3000/api/v1/paywall/subscribe/checkout \
  -H "Authorization: Bearer VALID_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"tier": "BASIC"}'

// Expected: 500 Internal Server Error
{
  "error": "Failed to create checkout session"
}
```

#### **Test Case: Database Constraint Violation**
```typescript
// Create duplicate payment record manually
const existingPayment = await prisma.payment.create({...});

// Try to process webhook for same session
curl -X POST http://localhost:3000/api/v1/paywall/webhooks/payment \
  -H "stripe-signature: valid_signature" \
  -H "Content-Type: application/json" \
  -d '{"id": "evt_123", "type": "checkout.session.completed", "data": {...}}'

// Expected: 500 Internal Server Error (handled gracefully)
{
  "error": "Database constraint violation"
}
```

### **6. Payment Processing Errors**

#### **Test Case: Card Declined**
```bash
# Use Stripe test card for declined payments
curl -X POST http://localhost:3000/api/v1/paywall/subscribe/checkout \
  -H "Authorization: Bearer VALID_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"tier": "BASIC"}'

// Complete checkout with card: 4000000000000002
// Expected: Session created, but payment fails at Stripe
// Webhook: payment_intent.payment_failed
```

#### **Test Case: Insufficient Funds**
```bash
# Use Stripe test card for insufficient funds
curl -X POST http://localhost:3000/api/v1/paywall/subscribe/checkout \
  -H "Authorization: Bearer VALID_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"tier": "BASIC"}'

// Complete checkout with card: 4000000000009995
// Expected: Session created, but payment fails at Stripe
// Webhook: payment_intent.payment_failed
```

#### **Test Case: Expired Card**
```bash
# Use Stripe test card for expired card
curl -X POST http://localhost:3000/api/v1/paywall/subscribe/checkout \
  -H "Authorization: Bearer VALID_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"tier": "BASIC"}'

// Complete checkout with card: 4000000000000069
// Expected: Session created, but payment fails at Stripe
// Webhook: payment_intent.payment_failed
```

### **7. Subscription Management Errors**

#### **Test Case: Cancel Non-existent Subscription**
```bash
curl -X POST http://localhost:3000/api/v1/paywall/subscription/cancel \
  -H "Authorization: Bearer VALID_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"subscriptionId": "sub_non_existent"}'

// Expected: 500 Internal Server Error
{
  "error": "Failed to cancel subscription"
}
```

#### **Test Case: Missing Subscription ID**
```bash
curl -X POST http://localhost:3000/api/v1/paywall/subscription/cancel \
  -H "Authorization: Bearer VALID_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"cancelAtPeriodEnd": true}'

// Expected: 400 Bad Request
{
  "error": "Subscription ID required"
}
```

### **8. Refund Processing Errors**

#### **Test Case: Refund Non-existent Payment**
```bash
curl -X POST http://localhost:3000/api/v1/paywall/refund/payment_non_existent \
  -H "Authorization: Bearer VALID_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"amount": 9.99}'

// Expected: 500 Internal Server Error
{
  "error": "Failed to create refund"
}
```

#### **Test Case: Refund Failed Payment**
```typescript
// Create a failed payment record first
const failedPayment = await prisma.payment.create({
  data: {
    userId: 'user_123',
    stripeSessionId: 'cs_test_failed',
    status: 'FAILED',
    // ... other fields
  }
});

curl -X POST http://localhost:3000/api/v1/paywall/refund/${failedPayment.id} \
  -H "Authorization: Bearer VALID_TOKEN"

// Expected: 500 Internal Server Error
{
  "error": "Can only refund completed payments"
}
```

### **9. Session Retrieval Errors**

#### **Test Case: Invalid Session ID Format**
```bash
curl -X GET http://localhost:3000/api/v1/paywall/session/invalid_session_id \
  -H "Authorization: Bearer VALID_TOKEN"

// Expected: 500 Internal Server Error
{
  "error": "Failed to retrieve session"
}
```

#### **Test Case: Session Not Found**
```bash
curl -X GET http://localhost:3000/api/v1/paywall/session/cs_test_non_existent \
  -H "Authorization: Bearer VALID_TOKEN"

// Expected: 500 Internal Server Error
{
  "error": "Failed to retrieve session"
}
```

### **10. Environment Configuration Errors**

#### **Test Case: Missing Stripe Secret Key**
```bash
# Remove STRIPE_SECRET_KEY from environment
unset STRIPE_SECRET_KEY

curl -X POST http://localhost:3000/api/v1/paywall/subscribe/checkout \
  -H "Authorization: Bearer VALID_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"tier": "BASIC"}'

// Expected: 500 Internal Server Error
{
  "error": "Failed to create checkout session"
}
```

#### **Test Case: Invalid Webhook Secret**
```bash
# Set invalid webhook secret
STRIPE_WEBHOOK_SECRET=whsec_invalid_secret

curl -X POST http://localhost:3000/api/v1/paywall/webhooks/payment \
  -H "stripe-signature: valid_signature" \
  -H "Content-Type: application/json" \
  -d '{"type": "checkout.session.completed", "data": {...}}'

// Expected: 400 Bad Request
{
  "error": "Webhook signature verification failed",
  "code": "WEBHOOK_ERROR"
}
```

## 🚨 **Error Recovery Procedures**

### **1. Failed Payment Recovery**
```bash
# Check payment status
curl -X GET http://localhost:3000/api/v1/paywall/session/SESSION_ID \
  -H "Authorization: Bearer TOKEN"

# If payment failed, user can retry with different payment method
curl -X POST http://localhost:3000/api/v1/paywall/subscribe/checkout \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"tier": "BASIC"}'
```

### **2. Webhook Retry Mechanism**
```bash
# Use Stripe CLI to retry failed webhooks
stripe webhooks retry --event EVENT_ID

# Or manually trigger from Stripe Dashboard:
# Dashboard > Developers > Webhooks > [Your endpoint] > Retry
```

### **3. Database Consistency Recovery**
```typescript
// If webhook processing failed, manually sync with Stripe
const session = await stripe.checkout.sessions.retrieve('cs_test_123');
if (session.payment_status === 'paid') {
  // Create payment record manually
  await prisma.payment.create({
    data: {
      userId: session.metadata.userId,
      stripeSessionId: session.id,
      amount: session.amount_total,
      status: 'COMPLETED',
      // ... other fields
    }
  });
}
```

## 📊 **Error Monitoring Setup**

### **Key Metrics to Monitor**
- **Webhook delivery success rate**: >99%
- **Payment failure rate**: <5%
- **Average checkout session creation time**: <500ms
- **Database error rate**: <1%
- **Authentication failure rate**: <2%

### **Alert Thresholds**
- **Critical**: Webhook delivery rate <95%
- **Warning**: Payment failure rate >10%
- **Info**: Database error rate >5%

### **Logging Strategy**
```typescript
// Successful operations
logger.info('Payment succeeded', {
  sessionId: session.id,
  userId: user.id,
  amount: session.amount_total,
  timestamp: new Date()
});

// Failed operations
logger.error('Payment failed', {
  sessionId: session.id,
  userId: user.id,
  error: error.message,
  timestamp: new Date()
});

// Webhook events
logger.info('Webhook processed', {
  eventId: event.id,
  eventType: event.type,
  processed: true,
  timestamp: new Date()
});
```

This comprehensive error testing matrix ensures robust error handling and recovery mechanisms for the Stripe integration.
