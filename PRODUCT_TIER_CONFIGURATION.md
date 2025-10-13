# Product Tier Configuration - Beginner Investor Hub

## 📊 **Subscription Tiers Overview**

This document defines the complete product tier structure for the Beginner Investor Hub platform.

## 🎯 **Tier 1: Free (Freemium)**

**Price**: $0/month
**Purpose**: User acquisition, education, build trust

### ✅ **Features Included**:
- **Educational Content**: Basic educational content and tutorials
- **Portfolio Tracking**: Limited portfolio tracking (1-3 stocks)
- **Market Insights**: Weekly market insights (email newsletter)
- **Risk Assessment**: Basic risk assessment (quarterly)
- **Community Forum**: Community forum access
- **Support**: Ad-supported experience

### 🚫 **Limitations**:
- Limited to 3 stocks in portfolio
- Quarterly risk assessments only
- Email newsletter only (no real-time insights)
- Ad-supported experience
- Community forum access only

---

## 💰 **Tier 2: Starter**

**Price**: $9.99/month or $99/year (Annual saves 17% - $8.25/month effective)
**Purpose**: Core monetization for serious beginners

### ✅ **Features Included** (Everything in Free, plus):
- **Real-time Market Data**: Real-time market data for up to 10 stocks
- **AI-Powered Insights**: AI-powered investment insights (5 queries/month)
- **Portfolio Simulation**: Portfolio simulation (basic scenarios)
- **Risk Assessment**: Risk assessment (monthly updates)
- **Behavioral Nudges**: Behavioral nudge notifications
- **Ad-Free Experience**: Completely ad-free experience
- **Email Support**: Email support

### 🚫 **Limitations**:
- Limited to 10 stocks
- 5 AI queries per month
- Basic simulation scenarios only
- Email support only

---

## 🚀 **Tier 3: Pro**

**Price**: $24.99/month or $249/year (Annual saves 17% - $20.75/month effective)
**Purpose**: Power users and active investors

### ✅ **Features Included** (Everything in Starter, plus):
- **Unlimited Stock Tracking**: Unlimited stock tracking
- **Enhanced AI Insights**: AI-powered insights (50 queries/month)
- **Advanced Portfolio Simulation**: Advanced portfolio simulation (Monte Carlo, stress testing)
- **Real-time Risk Monitoring**: Real-time risk monitoring with alerts
- **Priority Support**: Priority email + chat support
- **Custom Nudge Preferences**: Custom behavioral nudge preferences
- **Data Export**: Export data (CSV, PDF reports)
- **API Access**: API access (limited)

### 🚫 **Limitations**:
- 50 AI queries per month
- Limited API access
- Chat support (no phone)

---

## 💎 **Tier 4: Premium**

**Price**: $49.99/month or $499/year (Annual saves 17% - $41.58/month effective)
**Purpose**: Serious investors and small advisor firms

### ✅ **Features Included** (Everything in Pro, plus):
- **Unlimited AI Queries**: Unlimited AI queries
- **Advanced API Access**: Advanced API access
- **White-label Reports**: White-label reports
- **Multiple Portfolio Management**: Multiple portfolio management
- **Custom Risk Models**: Custom risk models
- **1-on-1 Coaching**: 1-on-1 monthly coaching call (30 min)
- **Priority Support**: Priority support (phone + chat)
- **Early Access**: Early access to new features
- **Dedicated Account Manager**: Dedicated account manager (annual only)

### 🚫 **Limitations**:
- None - Full feature access

---

## 💳 **Stripe Price ID Configuration**

### **Environment Variables Required**:
```bash
# Monthly Plans
STRIPE_PRICE_ID_STARTER_MONTHLY=price_starter_monthly_id
STRIPE_PRICE_ID_PRO_MONTHLY=price_pro_monthly_id
STRIPE_PRICE_ID_PREMIUM_MONTHLY=price_premium_monthly_id

# Annual Plans
STRIPE_PRICE_ID_STARTER_ANNUAL=price_starter_annual_id
STRIPE_PRICE_ID_PRO_ANNUAL=price_pro_annual_id
STRIPE_PRICE_ID_PREMIUM_ANNUAL=price_premium_annual_id
```

### **Stripe Product Setup Instructions**:

1. **Create Products in Stripe Dashboard**:
   - Go to [Stripe Dashboard > Products](https://dashboard.stripe.com/products)
   - Create 4 products: "Free", "Starter", "Pro", "Premium"

2. **Create Monthly Prices**:
   - For each product, create a monthly recurring price
   - Starter: $9.99/month
   - Pro: $24.99/month
   - Premium: $49.99/month

3. **Create Annual Prices**:
   - For each product, create an annual recurring price
   - Starter: $99/year
   - Pro: $249/year
   - Premium: $499/year

4. **Configure Price IDs**:
   - Copy the `price_xxx` IDs from Stripe Dashboard
   - Add them to your environment variables
   - Update `.env` file with the new price IDs

---

## 🔄 **Upgrade/Downgrade Logic**

### **Monthly to Annual Conversion**:
- **Starter**: $9.99/month → $99/year (17% savings)
- **Pro**: $24.99/month → $249/year (17% savings)
- **Premium**: $49.99/month → $499/year (17% savings)

### **Proration Rules**:
- **Upgrades**: Prorated billing - charge difference immediately
- **Downgrades**: Apply at next billing cycle
- **Annual to Monthly**: Convert at end of annual period

---

## 🎯 **Target Audience by Tier**

| Tier | Target Users | Monthly ARPU | Conversion Rate |
|------|--------------|--------------|----------------|
| **Free** | Students, complete beginners | $0 | N/A (entry point) |
| **Starter** | Serious beginners, learning | $9.99 | 15-20% of free users |
| **Pro** | Active investors, power users | $24.99 | 25-30% of starter users |
| **Premium** | Serious investors, small firms | $49.99 | 10-15% of pro users |

---

## 📈 **Revenue Projections**

### **Monthly Recurring Revenue (MRR) Targets**:
- **Month 6**: $5,000 MRR (500 Starter users)
- **Month 12**: $25,000 MRR (1,000 Pro users + mix)
- **Month 24**: $75,000 MRR (2,500 Premium users + mix)

### **Annual Recurring Revenue (ARR) Impact**:
- **Annual Plans**: Increase ARR by 17% per user
- **Target**: 60% of users on annual plans by Year 2

---

## 🔒 **Access Control Implementation**

### **Middleware Requirements**:
```typescript
// Free tier - no authentication required for basic content
const freeAccess = (req, res, next) => next();

// Starter+ required
const requireStarter = requireAuth(); // Any authenticated user

// Pro+ required
const requirePro = requireSubscription([SubscriptionTier.PRO, SubscriptionTier.PREMIUM]);

// Premium only
const requirePremium = requireSubscription(SubscriptionTier.PREMIUM);
```

### **Feature Gates**:
```typescript
// In React components
const canAccessAdvancedAI = user?.subscription?.tier >= SubscriptionTier.PRO;
const canExportData = user?.subscription?.tier >= SubscriptionTier.PRO;
const hasUnlimitedQueries = user?.subscription?.tier === SubscriptionTier.PREMIUM;
```

---

## 🛠️ **Implementation Checklist**

### **Database Updates** ✅
- [x] Updated SubscriptionTier enum in Prisma schema
- [x] Updated Stripe service price mapping
- [x] Updated all references to old tier names

### **Stripe Configuration** ⏳
- [ ] Create products in Stripe Dashboard
- [ ] Create monthly and annual prices
- [ ] Configure price IDs in environment variables
- [ ] Set up webhook endpoints for subscription events

### **Backend Updates** ⏳
- [ ] Update all route handlers to use new tier names
- [ ] Update subscription middleware
- [ ] Update access control logic
- [ ] Update feature gating

### **Frontend Updates** ⏳
- [ ] Update tier selection UI
- [ ] Update pricing display components
- [ ] Update feature comparison tables
- [ ] Update subscription status displays

### **Testing** ⏳
- [ ] Test subscription creation for all tiers
- [ ] Test upgrade/downgrade flows
- [ ] Test access control for each tier
- [ ] Test webhook processing
- [ ] Test annual vs monthly billing

---

## 📋 **Migration Guide**

### **From Old Tiers to New Tiers**:
- **BASIC** → **STARTER** (feature parity maintained)
- **PREMIUM** → **PREMIUM** (enhanced features)
- **ENTERPRISE** → **PREMIUM** (top tier)

### **Data Migration**:
```sql
-- Update existing subscriptions in database
UPDATE subscriptions SET tier = 'STARTER' WHERE tier = 'BASIC';
UPDATE subscriptions SET tier = 'PREMIUM' WHERE tier = 'ENTERPRISE';
```

### **User Communication**:
- Email existing BASIC users about STARTER tier upgrade
- Highlight new features and improved pricing
- Offer migration assistance for ENTERPRISE users

---

## 🎉 **Success Metrics**

### **Conversion Funnel**:
1. **Free → Starter**: 15-20% conversion rate
2. **Starter → Pro**: 25-30% conversion rate
3. **Pro → Premium**: 10-15% conversion rate

### **Retention Targets**:
- **Free**: 80% monthly retention (engagement focus)
- **Starter**: 85% monthly retention
- **Pro**: 90% monthly retention
- **Premium**: 95% monthly retention

### **Annual Plan Adoption**:
- **Target**: 60% of paid users on annual plans
- **Incentive**: 17% savings clearly communicated
- **Ease**: One-click annual conversion

This comprehensive product tier structure provides clear value progression and monetization opportunities while serving different user segments effectively.
