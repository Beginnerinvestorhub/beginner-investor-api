import { Router } from 'express';
import { SubscriptionTier } from '@prisma/client';
import { paywallService } from '../services/paywall/paywall.service';
import { requireAuth } from '../middleware/auth.middleware';
import { requireSubscription } from '../middleware/paywall.middleware';

const router = Router();

// Get current user's subscription
router.get('/subscription', requireAuth, async (req, res) => {
  try {
    // @ts-ignore - user is attached to request by auth middleware
    const userId = req.user.id;
    const subscription = await paywallService.getUserSubscription(userId);
    
    res.json({
      subscription,
      hasActiveSubscription: !!subscription,
    });
  } catch (error) {
    console.error('Failed to get subscription:', error);
    res.status(500).json({ error: 'Failed to get subscription' });
  }
});

// Create checkout session for new subscription
router.post('/subscribe/checkout', requireAuth, async (req, res) => {
  try {
    const { tier = 'BASIC' } = req.body;
    // @ts-ignore - user is attached to request by auth middleware
    const userId = req.user.id;
    
    const session = await paywallService.createCheckoutSession(userId, tier as SubscriptionTier);
    
    res.json({
      success: true,
      sessionId: session.sessionId,
      url: session.url
    });
  } catch (error) {
    console.error('Failed to create checkout session:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

// Handle webhooks from payment processor
router.post('/webhooks/payment', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const payload = req.body;
  
  try {
    // Verify webhook signature (implementation depends on payment processor)
    // const event = stripe.webhooks.constructEvent(payload, sig, process.env.STRIPE_WEBHOOK_SECRET);
    
    // Process the event
    await paywallService.handleWebhookEvent(payload);
    
    res.json({ received: true });
  } catch (err) {
    console.error('Webhook error:', err);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
});

// Example of a protected route
router.get('/premium-content', 
  requireAuth,
  requireSubscription(SubscriptionTier.PREMIUM),
  (req, res) => {
    res.json({
      content: 'This is premium content!',
      message: 'You have access to premium content.'
    });
  }
);

export default router;
