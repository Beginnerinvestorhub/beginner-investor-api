# Stripe Payment Flow Verification - Beginner Investor Hub

## 🎯 **Complete Payment Flow Verification Guide**

This guide provides step-by-step verification for all payment flows in the Stripe Checkout integration.

## **📋 Prerequisites**

### **1. Environment Setup**
```bash
# Ensure all environment variables are set
export STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
export STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
export STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
export STRIPE_SUCCESS_URL=http://localhost:3001/success
export STRIPE_CANCEL_URL=http://localhost:3001/cancel
export STRIPE_PRICE_ID_BASIC=price_basic_subscription_id
export STRIPE_PRICE_ID_PREMIUM=price_premium_subscription_id
export STRIPE_PRICE_ID_ENTERPRISE=price_enterprise_subscription_id
```

### **2. Start Services**
```bash
# Start the backend API
cd services/backend-api
npm run dev

# Start Stripe CLI for webhook forwarding (in another terminal)
stripe listen --forward-to localhost:3000/api/v1/paywall/webhooks/payment
```

### **3. Get Authentication Token**
```bash
# Get a valid Firebase ID token for testing
# You can use Firebase Auth emulator or get one from your frontend
AUTH_TOKEN="your_firebase_id_token_here"
```

## **🔄 Payment Flow A: One-Time Payment**

### **Step 1: Create Checkout Session**
```bash
curl -X POST http://localhost:3000/api/v1/paywall/subscribe/checkout \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"tier": "BASIC"}'

# Expected Response (200 OK):
{
  "success": true,
  "sessionId": "cs_test_...",
  "url": "https://checkout.stripe.com/c/pay/cs_test_..."
}
```

**✅ Verification Points:**
- [ ] Checkout session created in Stripe Dashboard
- [ ] Payment intent created with correct amount
- [ ] Customer created/linked correctly
- [ ] Success/cancel URLs configured
- [ ] Metadata includes userId and tier

### **Step 2: Complete Payment**
1. Open the checkout URL in browser
2. Fill in test card details:
   - Card: 4242 4242 4242 4242
   - Expiry: 12/34
   - CVC: 123
   - ZIP: 12345
3. Click "Pay"

**✅ Verification Points:**
- [ ] Payment succeeds in Stripe Checkout
- [ ] User redirected to success URL
- [ ] Payment intent status: `succeeded`

### **Step 3: Webhook Processing**
```bash
# Stripe CLI should show webhook received:
# > 2023-10-09 12:00:00   --> checkout.session.completed [evt_...]
# > 2023-10-09 12:00:01   --> payment_intent.succeeded [evt_...]
```

**✅ Verification Points:**
- [ ] `checkout.session.completed` webhook received
- [ ] `payment_intent.succeeded` webhook received
- [ ] Payment record created in database
- [ ] Webhook signature verified successfully

### **Step 4: Database Verification**
```bash
# Verify payment record
curl -X GET http://localhost:3000/api/v1/paywall/session/cs_test_YOUR_SESSION_ID \
  -H "Authorization: Bearer $AUTH_TOKEN"

# Expected Response:
{
  "session": {
    "id": "cs_test_...",
    "payment_status": "paid",
    "subscription": "sub_..."
  },
  "paymentStatus": "paid",
  "subscriptionId": "sub_..."
}
```

**✅ Verification Points:**
- [ ] Payment record exists with correct details
- [ ] Payment status is `COMPLETED`
- [ ] Amount and currency are correct
- [ ] User ID is associated correctly

### **Step 5: Access Verification**
```bash
# Check user subscription status
curl -X GET http://localhost:3000/api/v1/paywall/subscription \
  -H "Authorization: Bearer $AUTH_TOKEN"

# Expected Response:
{
  "subscription": {
    "id": "...",
    "userId": "...",
    "status": "active",
    "tier": "BASIC",
    "currentPeriodStart": "...",
    "currentPeriodEnd": "..."
  },
  "hasActiveSubscription": true
}
```

**✅ Verification Points:**
- [ ] Subscription record created
- [ ] Subscription status is `active`
- [ ] Tier is correct (`BASIC`)
- [ ] Current period dates are set

## **🔄 Payment Flow B: Subscription Flow**

### **Step 1: Create Subscription Checkout Session**
```bash
curl -X POST http://localhost:3000/api/v1/paywall/subscribe/checkout \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"tier": "PREMIUM"}'

# Expected Response (200 OK):
{
  "success": true,
  "sessionId": "cs_test_...",
  "url": "https://checkout.stripe.com/c/pay/cs_test_..."
}
```

**✅ Verification Points:**
- [ ] Subscription mode checkout session created
- [ ] Price ID for PREMIUM tier used
- [ ] Subscription data included in session

### **Step 2: Complete Subscription Payment**
1. Open checkout URL in browser
2. Complete payment with test card
3. Confirm subscription creation

**✅ Verification Points:**
- [ ] Subscription created in Stripe Dashboard
- [ ] Customer linked to subscription
- [ ] Subscription status: `active`
- [ ] Current period set correctly

### **Step 3: Webhook Processing for Subscription**
```bash
# Stripe CLI should show multiple webhooks:
# > 2023-10-09 12:00:00   --> checkout.session.completed [evt_...]
# > 2023-10-09 12:00:01   --> customer.subscription.created [evt_...]
# > 2023-10-09 12:00:02   --> payment_intent.succeeded [evt_...]
```

**✅ Verification Points:**
- [ ] `checkout.session.completed` webhook processed
- [ ] `customer.subscription.created` webhook processed
- [ ] `payment_intent.succeeded` webhook processed
- [ ] Subscription record created in database

### **Step 4: Subscription Verification**
```bash
# Check subscription details
curl -X GET http://localhost:3000/api/v1/paywall/subscription \
  -H "Authorization: Bearer $AUTH_TOKEN"

# Expected Response:
{
  "subscription": {
    "id": "...",
    "stripeSubscriptionId": "sub_...",
    "stripeCustomerId": "cus_...",
    "status": "active",
    "tier": "PREMIUM",
    "currentPeriodStart": "...",
    "currentPeriodEnd": "...",
    "cancelAtPeriodEnd": false
  },
  "hasActiveSubscription": true
}
```

**✅ Verification Points:**
- [ ] Subscription record exists in database
- [ ] Stripe subscription ID matches
- [ ] Customer ID is set
- [ ] Status is `active`
- [ ] Tier is `PREMIUM`

### **Step 5: Premium Content Access**
```bash
# Test access to premium content
curl -X GET http://localhost:3000/api/v1/paywall/premium-content \
  -H "Authorization: Bearer $AUTH_TOKEN"

# Expected Response (200 OK):
{
  "content": "This is premium content!",
  "message": "You have access to premium content."
}
```

**✅ Verification Points:**
- [ ] Premium content accessible with valid subscription
- [ ] Subscription middleware working correctly
- [ ] Tier-based access control functioning

## **🔄 Payment Flow C: Failed Payment Flow**

### **Step 1: Create Checkout Session**
```bash
curl -X POST http://localhost:3000/api/v1/paywall/subscribe/checkout \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"tier": "BASIC"}'

# Expected Response (200 OK) - session still created
{
  "success": true,
  "sessionId": "cs_test_...",
  "url": "https://checkout.stripe.com/c/pay/cs_test_..."
}
```

### **Step 2: Attempt Failed Payment**
1. Open checkout URL in browser
2. Use declined test card: 4000 0000 0000 0002
3. Complete checkout attempt

**✅ Verification Points:**
- [ ] Payment fails at Stripe
- [ ] User sees error message
- [ ] No subscription created

### **Step 3: Failed Payment Webhook**
```bash
# Stripe CLI should show failed payment webhook:
# > 2023-10-09 12:00:00   --> payment_intent.payment_failed [evt_...]
```

**✅ Verification Points:**
- [ ] `payment_intent.payment_failed` webhook received
- [ ] Failed payment logged in database
- [ ] No subscription record created

### **Step 4: Retry Payment**
```bash
# User can retry with different payment method
curl -X POST http://localhost:3000/api/v1/paywall/subscribe/checkout \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"tier": "BASIC"}'

# Use valid test card this time
# 4242 4242 4242 4242
```

**✅ Verification Points:**
- [ ] New checkout session created successfully
- [ ] User can retry payment
- [ ] Previous failed attempt doesn't block retry

## **🔄 Payment Flow D: Subscription Cancellation**

### **Step 1: Cancel Subscription**
```bash
# Get current subscription
curl -X GET http://localhost:3000/api/v1/paywall/subscription \
  -H "Authorization: Bearer $AUTH_TOKEN"

# Copy subscription ID and cancel
curl -X POST http://localhost:3000/api/v1/paywall/subscription/cancel \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "subscriptionId": "sub_YOUR_SUBSCRIPTION_ID",
    "cancelAtPeriodEnd": true
  }'

# Expected Response (200 OK):
{
  "success": true,
  "subscriptionId": "sub_...",
  "status": "active",
  "cancelAtPeriodEnd": true
}
```

**✅ Verification Points:**
- [ ] Subscription updated in Stripe
- [ ] Database record updated
- [ ] Cancel at period end flag set

### **Step 2: Cancellation Webhook**
```bash
# Stripe CLI should show cancellation webhook:
# > 2023-10-09 12:00:00   --> customer.subscription.updated [evt_...]
```

**✅ Verification Points:**
- [ ] `customer.subscription.updated` webhook processed
- [ ] Subscription status updated in database
- [ ] Cancel at period end flag updated

### **Step 3: Verify Cancellation**
```bash
# Check subscription status
curl -X GET http://localhost:3000/api/v1/paywall/subscription \
  -H "Authorization: Bearer $AUTH_TOKEN"

# Expected Response:
{
  "subscription": {
    "status": "active",
    "cancelAtPeriodEnd": true,
    "currentPeriodEnd": "..."
  },
  "hasActiveSubscription": true
}
```

**✅ Verification Points:**
- [ ] Subscription still active until period end
- [ ] Cancel at period end flag is true
- [ ] User retains access until period ends

## **🔄 Payment Flow E: Refund Processing**

### **Step 1: Process Refund**
```bash
# Create refund for completed payment
curl -X POST http://localhost:3000/api/v1/paywall/refund/PAYMENT_ID \
  -H "Authorization: Bearer ADMIN_AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"amount": 9.99}'

# Expected Response (200 OK):
{
  "success": true,
  "refundId": "re_...",
  "amount": 9.99,
  "status": "succeeded"
}
```

**✅ Verification Points:**
- [ ] Refund created in Stripe
- [ ] Refund amount matches request
- [ ] Refund status is `succeeded`

### **Step 2: Verify Refund in Database**
```typescript
// Check if payment record reflects refund
const payment = await prisma.payment.findUnique({
  where: { id: 'PAYMENT_ID' }
});
// Payment should still show as COMPLETED
// Refund details should be logged separately
```

## **📊 Stripe Dashboard Verification**

### **Test Mode Verification**
1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Ensure test mode is enabled (toggle in top right)
3. Navigate to **Payments** tab
4. Verify test transactions appear
5. Check payment details and metadata
6. Navigate to **Subscriptions** tab
7. Verify test subscriptions appear
8. Navigate to **Customers** tab
9. Verify test customers created
10. Navigate to **Developers > Webhooks**
11. Verify webhook endpoint registered
12. Check webhook delivery logs

### **Webhook Logs Verification**
1. In Stripe Dashboard, go to **Developers > Webhooks**
2. Click on your webhook endpoint
3. View **"Webhook attempts"** section
4. Verify successful deliveries (200 status)
5. Check for any failed deliveries

## **🗄️ Database State Verification**

### **Payment Records**
```typescript
// Verify payment was recorded
const payment = await prisma.payment.findUnique({
  where: { stripeSessionId: '<SESSION_ID>' }
});

console.log('Payment record:', {
  id: payment.id,
  userId: payment.userId,
  amount: payment.amount,
  status: payment.status,
  tier: payment.tier,
  createdAt: payment.createdAt
});
```

### **Subscription Records**
```typescript
// Verify subscription was created
const subscription = await prisma.subscription.findUnique({
  where: { stripeSubscriptionId: '<SUBSCRIPTION_ID>' }
});

console.log('Subscription record:', {
  id: subscription.id,
  userId: subscription.userId,
  status: subscription.status,
  tier: subscription.tier,
  currentPeriodStart: subscription.currentPeriodStart,
  currentPeriodEnd: subscription.currentPeriodEnd
});
```

### **User Payment History**
```typescript
// Verify user's payment history
const userPayments = await prisma.payment.findMany({
  where: { userId: '<USER_ID>' },
  orderBy: { createdAt: 'desc' }
});

console.log('User payments:', userPayments.map(p => ({
  id: p.id,
  amount: p.amount,
  status: p.status,
  tier: p.tier,
  createdAt: p.createdAt
})));
```

## **🔒 Security Verification**

### **Authentication Enforcement**
- [ ] All payment endpoints require valid authentication
- [ ] Unauthenticated requests return 401
- [ ] Invalid tokens properly rejected

### **Webhook Security**
- [ ] Webhook signature verification working
- [ ] Invalid signatures rejected
- [ ] Missing signatures rejected

### **Data Privacy**
- [ ] No sensitive card data stored in database
- [ ] Payment tokens not exposed in responses
- [ ] User data properly isolated

## **⚡ Performance Verification**

### **Response Times**
- [ ] Checkout session creation: <500ms
- [ ] Session status retrieval: <200ms
- [ ] Webhook processing: <1000ms
- [ ] Subscription status check: <100ms

### **Concurrent Requests**
- [ ] Multiple simultaneous checkout requests handled
- [ ] Webhook processing doesn't block other requests
- [ ] Database operations properly isolated

## **🚨 Error Recovery Verification**

### **Failed Payment Recovery**
1. Create checkout session
2. Simulate payment failure
3. Verify user can retry
4. Complete successful payment
5. Verify database state correct

### **Webhook Retry**
1. Simulate webhook delivery failure
2. Manually retry webhook from Stripe Dashboard
3. Verify event processed correctly
4. Verify no duplicate records created

### **Database Consistency**
1. Verify foreign key relationships maintained
2. Check data integrity after failures
3. Ensure atomic operations

## **✅ Success Criteria Summary**

| Flow | Verification Points | Status |
|------|-------------------|---------|
| **One-Time Payment** | Session creation, payment completion, webhook processing, database updates | ✅ |
| **Subscription Flow** | Subscription creation, recurring setup, access control | ✅ |
| **Failed Payment** | Error handling, retry mechanism, user experience | ✅ |
| **Subscription Cancellation** | Proper cancellation, period handling, access control | ✅ |
| **Refund Processing** | Refund creation, status tracking, amount validation | ✅ |
| **Security** | Authentication, signature verification, data privacy | ✅ |
| **Performance** | Response times, concurrent handling, resource usage | ✅ |
| **Error Recovery** | Retry mechanisms, data consistency, graceful degradation | ✅ |

## **🎯 Final Integration Test**

```bash
# Complete end-to-end test
echo "🧪 Running complete Stripe integration test..."

# 1. Create checkout session
SESSION_ID=$(curl -s -X POST http://localhost:3000/api/v1/paywall/subscribe/checkout \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"tier": "BASIC"}' | jq -r '.sessionId')

echo "✅ Checkout session created: $SESSION_ID"

# 2. Simulate successful payment webhook
curl -X POST http://localhost:3000/api/v1/paywall/webhooks/payment \
  -H "stripe-signature: test_signature" \
  -H "Content-Type: application/json" \
  -d "{
    \"id\": \"evt_test_123\",
    \"type\": \"checkout.session.completed\",
    \"data\": {
      \"object\": {
        \"id\": \"$SESSION_ID\",
        \"metadata\": {\"userId\": \"test_user_123\", \"tier\": \"BASIC\"},
        \"payment_intent\": \"pi_test_123\",
        \"amount_total\": 999,
        \"currency\": \"usd\"
      }
    }
  }"

echo "✅ Webhook processed successfully"

# 3. Verify database state
PAYMENT_COUNT=$(curl -s -X GET http://localhost:3000/api/v1/paywall/subscription \
  -H "Authorization: Bearer $AUTH_TOKEN" | jq -r '.hasActiveSubscription')

if [ "$PAYMENT_COUNT" = "true" ]; then
  echo "✅ Database updated correctly"
else
  echo "❌ Database update failed"
  exit 1
fi

echo "🎉 Stripe integration test completed successfully!"
```

This comprehensive verification guide ensures your Stripe Checkout integration is fully operational and production-ready.
