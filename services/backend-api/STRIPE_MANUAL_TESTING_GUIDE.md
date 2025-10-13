# Stripe Checkout Manual Testing Guide - Beginner Investor Hub

## 🚀 **Setup Instructions**

### 1. Environment Setup
```bash
# Copy environment file and configure Stripe keys
cp .env.example .env

# Edit .env with your actual Stripe keys:
# STRIPE_SECRET_KEY=sk_test_... (from Stripe Dashboard > Developers > API keys)
# STRIPE_PUBLISHABLE_KEY=pk_test_... (for frontend)
# STRIPE_WEBHOOK_SECRET=whsec_... (from Stripe Dashboard > Webhooks)
# STRIPE_SUCCESS_URL=http://localhost:3001/success
# STRIPE_CANCEL_URL=http://localhost:3001/cancel
```

### 2. Stripe Dashboard Setup
1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Ensure test mode is enabled (toggle in top right)
3. Create test products and prices:
   - **Basic Plan**: $9.99/month
   - **Premium Plan**: $19.99/month
   - **Enterprise Plan**: $49.99/month
4. Copy the Price IDs to your `.env` file

### 3. Start the Backend API
```bash
cd services/backend-api
npm run dev
# Server should start on http://localhost:3000
```

### 4. Get Firebase ID Token (for authentication)
You'll need a valid Firebase ID token for testing. Use Firebase Auth emulator or get one from your frontend application.

## 🧪 **Test Card Numbers**

### ✅ **Successful Payments**
- **Card**: 4242 4242 4242 4242
- **Expiry**: Any future date (e.g., 12/34)
- **CVC**: Any 3 digits (e.g., 123)
- **ZIP**: Any 5 digits (e.g., 12345)

### ❌ **Declined Payments**
- **Card**: 4000 0000 0000 0002
- **Expected**: Card declined

### ⚠️ **Authentication Required**
- **Card**: 4000 0025 0000 3155
- **Expected**: Requires 3D Secure authentication

### 💸 **Insufficient Funds**
- **Card**: 4000 0000 0000 9995
- **Expected**: Insufficient funds

### ⏰ **Expired Card**
- **Card**: 4000 0000 0000 0069
- **Expected**: Card expired

### 🚫 **CVC Check Fails**
- **Card**: 4000 0000 0000 0127
- **Expected**: CVC check fails

## 🔧 **API Testing with cURL**

### **1. Create Checkout Session (Basic Plan)**
```bash
curl -X POST http://localhost:3000/api/v1/paywall/subscribe/checkout \
  -H "Authorization: Bearer YOUR_FIREBASE_ID_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "tier": "BASIC"
  }'

# Expected Response (200 OK):
{
  "success": true,
  "sessionId": "cs_test_...",
  "url": "https://checkout.stripe.com/c/pay/cs_test_..."
}
```

### **2. Create Checkout Session (Premium Plan)**
```bash
curl -X POST http://localhost:3000/api/v1/paywall/subscribe/checkout \
  -H "Authorization: Bearer YOUR_FIREBASE_ID_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "tier": "PREMIUM"
  }'

# Expected Response (200 OK):
{
  "success": true,
  "sessionId": "cs_test_...",
  "url": "https://checkout.stripe.com/c/pay/cs_test_..."
}
```

### **3. Create Checkout Session (Enterprise Plan)**
```bash
curl -X POST http://localhost:3000/api/v1/paywall/subscribe/checkout \
  -H "Authorization: Bearer YOUR_FIREBASE_ID_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "tier": "ENTERPRISE"
  }'

# Expected Response (200 OK):
{
  "success": true,
  "sessionId": "cs_test_...",
  "url": "https://checkout.stripe.com/c/pay/cs_test_..."
}
```

### **4. Retrieve Checkout Session Status**
```bash
curl -X GET http://localhost:3000/api/v1/paywall/session/cs_test_YOUR_SESSION_ID \
  -H "Authorization: Bearer YOUR_FIREBASE_ID_TOKEN"

# Expected Response (200 OK):
{
  "session": {
    "id": "cs_test_...",
    "payment_status": "paid",
    "customer": "cus_...",
    "subscription": "sub_..."
  },
  "paymentStatus": "paid",
  "subscriptionId": "sub_..."
}
```

### **5. Get User Subscription Status**
```bash
curl -X GET http://localhost:3000/api/v1/paywall/subscription \
  -H "Authorization: Bearer YOUR_FIREBASE_ID_TOKEN"

# Expected Response (200 OK):
{
  "subscription": {
    "id": "...",
    "userId": "...",
    "stripeSubscriptionId": "sub_...",
    "status": "active",
    "tier": "PREMIUM",
    "currentPeriodStart": "2023-...",
    "currentPeriodEnd": "2023-...",
    "cancelAtPeriodEnd": false
  },
  "hasActiveSubscription": true
}
```

### **6. Access Premium Content (Protected Route)**
```bash
curl -X GET http://localhost:3000/api/v1/paywall/premium-content \
  -H "Authorization: Bearer YOUR_FIREBASE_ID_TOKEN"

# Expected Response (200 OK) - if user has premium subscription:
{
  "content": "This is premium content!",
  "message": "You have access to premium content."
}

# Expected Response (403 Forbidden) - if user doesn't have premium subscription:
{
  "error": "Insufficient subscription tier"
}
```

### **7. Cancel Subscription**
```bash
curl -X POST http://localhost:3000/api/v1/paywall/subscription/cancel \
  -H "Authorization: Bearer YOUR_FIREBASE_ID_TOKEN" \
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

### **8. Create Refund (Admin Only)**
```bash
curl -X POST http://localhost:3000/api/v1/paywall/refund/PAYMENT_ID \
  -H "Authorization: Bearer YOUR_ADMIN_FIREBASE_ID_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 9.99
  }'

# Expected Response (200 OK):
{
  "success": true,
  "refundId": "re_...",
  "amount": 9.99,
  "status": "succeeded"
}
```

## 🛠️ **Error Testing Scenarios**

### **1. Missing Authentication**
```bash
curl -X POST http://localhost:3000/api/v1/paywall/subscribe/checkout \
  -H "Content-Type: application/json" \
  -d '{"tier": "BASIC"}'

# Expected Response (401 Unauthorized):
{
  "error": "User not authenticated",
  "code": "USER_NOT_AUTHENTICATED"
}
```

### **2. Invalid Subscription Tier**
```bash
curl -X POST http://localhost:3000/api/v1/paywall/subscribe/checkout \
  -H "Authorization: Bearer YOUR_FIREBASE_ID_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"tier": "INVALID_TIER"}'

# Expected Response (500 Internal Server Error):
{
  "error": "Failed to create checkout session"
}
```

### **3. Invalid Session ID**
```bash
curl -X GET http://localhost:3000/api/v1/paywall/session/invalid_session_id \
  -H "Authorization: Bearer YOUR_FIREBASE_ID_TOKEN"

# Expected Response (500 Internal Server Error):
{
  "error": "Failed to retrieve session"
}
```

### **4. Missing Webhook Signature**
```bash
curl -X POST http://localhost:3000/api/v1/paywall/webhooks/payment \
  -H "Content-Type: application/json" \
  -d '{"type": "checkout.session.completed", "data": {...}}'

# Expected Response (400 Bad Request):
{
  "error": "Missing Stripe signature",
  "code": "WEBHOOK_ERROR"
}
```

### **5. Invalid Webhook Signature**
```bash
curl -X POST http://localhost:3000/api/v1/paywall/webhooks/payment \
  -H "stripe-signature: invalid_signature" \
  -H "Content-Type: application/json" \
  -d '{"type": "checkout.session.completed", "data": {...}}'

# Expected Response (400 Bad Request):
{
  "error": "Webhook signature verification failed",
  "code": "WEBHOOK_ERROR"
}
```

## 📊 **Stripe Dashboard Verification**

### **1. Verify API Keys**
1. Go to Stripe Dashboard > Developers > API keys
2. Ensure you have both test and live keys
3. Verify test keys start with `sk_test_` and `pk_test_`

### **2. Check Webhook Configuration**
1. Go to Stripe Dashboard > Developers > Webhooks
2. Click "Add endpoint"
3. Enter: `http://localhost:3000/api/v1/paywall/webhooks/payment`
4. Select events: `checkout.session.completed`, `customer.subscription.*`, `payment_intent.*`, `invoice.*`
5. Copy the webhook signing secret to your `.env` file

### **3. Monitor Test Transactions**
1. Go to Stripe Dashboard > Payments (test mode)
2. Complete a test payment using the checkout flow
3. Verify the payment appears in the dashboard
4. Check the payment details and metadata

### **4. Check Webhook Logs**
1. Go to Stripe Dashboard > Developers > Webhooks
2. Click on your webhook endpoint
3. View "Webhook attempts" to see delivery status
4. Check logs for any failed deliveries

## 🔄 **Webhook Testing with Stripe CLI**

### **1. Install Stripe CLI**
```bash
# macOS
brew install stripe/stripe-cli/stripe

# Linux
curl -s https://packages.stripe.dev/api/security/keypair/stripe-cli-gpg/public | sudo apt-key add -
echo "deb https://packages.stripe.dev/stripe-cli-debian-local stable main" | sudo tee -a /etc/apt/sources.list.d/stripe-cli.list
sudo apt update
sudo apt install stripe

# Windows
# Download from https://stripe.com/docs/stripe-cli
```

### **2. Login to Stripe**
```bash
stripe login
# Follow the prompts to authenticate
```

### **3. Forward Webhooks Locally**
```bash
# Forward webhooks to your local server
stripe listen --forward-to localhost:3000/api/v1/paywall/webhooks/payment

# You should see:
# > Ready! Your webhook signing secret is whsec_... (^C to quit)
# Copy the webhook secret to your .env file
```

### **4. Trigger Test Events**
```bash
# In a new terminal, trigger events
stripe trigger checkout.session.completed

stripe trigger customer.subscription.created

stripe trigger payment_intent.succeeded

stripe trigger payment_intent.payment_failed

stripe trigger customer.subscription.deleted

stripe trigger invoice.payment_succeeded

stripe trigger invoice.payment_failed
```

### **5. Monitor Webhook Processing**
1. Watch the Stripe CLI terminal for webhook deliveries
2. Check your application logs for webhook processing
3. Verify database updates occur correctly

## 🗄️ **Database Verification Queries**

### **1. Check Payment Records**
```typescript
// In your application or database client
const payment = await prisma.payment.findUnique({
  where: { stripeSessionId: 'cs_test_YOUR_SESSION_ID' },
  include: { user: true }
});

console.log('Payment record:', {
  id: payment.id,
  userId: payment.userId,
  amount: payment.amount,
  currency: payment.currency,
  status: payment.status,
  tier: payment.tier,
  createdAt: payment.createdAt
});
```

### **2. Check Subscription Records**
```typescript
const subscription = await prisma.subscription.findUnique({
  where: { stripeSubscriptionId: 'sub_YOUR_SUBSCRIPTION_ID' },
  include: { user: true, tier: true }
});

console.log('Subscription record:', {
  id: subscription.id,
  userId: subscription.userId,
  status: subscription.status,
  tier: subscription.tier.name,
  currentPeriodStart: subscription.currentPeriodStart,
  currentPeriodEnd: subscription.currentPeriodEnd,
  cancelAtPeriodEnd: subscription.cancelAtPeriodEnd
});
```

### **3. Check User Payment History**
```typescript
const userPayments = await prisma.payment.findMany({
  where: { userId: 'YOUR_USER_ID' },
  orderBy: { createdAt: 'desc' },
  take: 10
});

console.log('User payment history:', userPayments.map(p => ({
  id: p.id,
  amount: p.amount,
  status: p.status,
  tier: p.tier,
  createdAt: p.createdAt
})));
```

### **4. Verify Webhook Event Processing**
```typescript
// Check if webhook events are being stored to prevent duplicates
const webhookEvents = await prisma.webhookEvent.findMany({
  where: { stripeEventId: { in: ['evt_1', 'evt_2'] } },
  orderBy: { processedAt: 'desc' }
});

console.log('Webhook events processed:', webhookEvents.length);
```

## 🎯 **Complete Testing Workflow**

### **Step 1: Create Checkout Session**
```bash
# Create a basic subscription checkout session
curl -X POST http://localhost:3000/api/v1/paywall/subscribe/checkout \
  -H "Authorization: Bearer YOUR_FIREBASE_ID_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"tier": "BASIC"}'

# Copy the sessionId from response
SESSION_ID="cs_test_..."
```

### **Step 2: Simulate Payment Completion**
```bash
# Use Stripe CLI to trigger the webhook
stripe trigger checkout.session.completed --data "{
  \"id\": \"$SESSION_ID\",
  \"metadata\": {
    \"userId\": \"YOUR_USER_ID\",
    \"tier\": \"BASIC\"
  }
}"
```

### **Step 3: Verify Database Updates**
```typescript
// Check payment record
const payment = await prisma.payment.findUnique({
  where: { stripeSessionId: SESSION_ID }
});

// Check subscription record (created by customer.subscription.created webhook)
const subscription = await prisma.subscription.findFirst({
  where: { userId: 'YOUR_USER_ID' }
});
```

### **Step 4: Test Subscription Access**
```bash
# Test access to premium content
curl -X GET http://localhost:3000/api/v1/paywall/premium-content \
  -H "Authorization: Bearer YOUR_FIREBASE_ID_TOKEN"
```

### **Step 5: Test Subscription Cancellation**
```bash
curl -X POST http://localhost:3000/api/v1/paywall/subscription/cancel \
  -H "Authorization: Bearer YOUR_FIREBASE_ID_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "subscriptionId": "sub_YOUR_SUBSCRIPTION_ID",
    "cancelAtPeriodEnd": true
  }'

# Trigger cancellation webhook
stripe trigger customer.subscription.deleted --data "{
  \"id\": \"sub_YOUR_SUBSCRIPTION_ID\"
}"
```

## 🚨 **Troubleshooting Common Issues**

### **Issue 1: "No such checkout session"**
- **Cause**: Invalid session ID or using wrong Stripe environment
- **Solution**: Verify session ID format and ensure using correct API keys

### **Issue 2: Webhook signature verification failed**
- **Cause**: Incorrect webhook secret or modified payload
- **Solution**: Update STRIPE_WEBHOOK_SECRET in .env file from Stripe Dashboard

### **Issue 3: Database not updated after payment**
- **Cause**: Webhook not received or processing failed
- **Solution**: Check Stripe CLI output and application logs for errors

### **Issue 4: Authentication errors**
- **Cause**: Invalid or expired Firebase ID token
- **Solution**: Generate fresh token or check Firebase configuration

### **Issue 5: "Invalid price ID"**
- **Cause**: STRIPE_PRICE_ID_* environment variables not set or incorrect
- **Solution**: Create prices in Stripe Dashboard and update .env file

## 📋 **Expected Test Results**

| Test Scenario | Expected Status | Expected Response | Database Impact |
|---------------|----------------|-------------------|-----------------|
| Valid checkout creation | 200 OK | Session ID returned | Session logged |
| Invalid price ID | 500 Error | "Failed to create checkout session" | None |
| Missing authentication | 401 Unauthorized | "User not authenticated" | None |
| Valid webhook signature | 200 OK | "Webhook received" | Payment/subscription created |
| Invalid webhook signature | 400 Bad Request | "Webhook signature verification failed" | None |
| Duplicate webhook | 200 OK | "Webhook received" (idempotent) | None (no duplicate records) |
| Session status retrieval | 200 OK | Session details with payment status | None |
| Premium content access (with subscription) | 200 OK | Premium content | None |
| Premium content access (without subscription) | 403 Forbidden | "Insufficient subscription tier" | None |

## ✅ **Success Indicators**

- ✅ All cURL commands return expected status codes and responses
- ✅ Database records created/updated correctly for successful payments
- ✅ Webhook events processed without duplicates
- ✅ Authentication properly enforced on all endpoints
- ✅ Error handling provides clear, actionable messages
- ✅ Stripe Dashboard shows test transactions
- ✅ Webhook delivery logs show successful processing
- ✅ Subscription access control works correctly
- ✅ No sensitive data exposed in error messages or logs

This comprehensive testing guide ensures your Stripe integration is fully functional and production-ready.
