// Reference Stripe Integration Example
// This file contains the basic Stripe integration code provided as reference
// The actual implementation uses the enhanced services in the backend-api

const stripe = require('stripe')('sk_test_xxxxxxxxxxxxxxxxxx');
const express = require('express');
const app = express();

// Middleware
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const YOUR_DOMAIN = "http://localhost:3000";

// Create checkout session
app.post('/create-checkout-session', async (req, res) => {
  try {
    const prices = await stripe.prices.list({
      lookup_keys: [req.body.lookup_key],
      expand: ['data.product'],
    });

    const session = await stripe.checkout.sessions.create({
      billing_address_collection: 'auto',
      line_items: [
        {
          price: prices.data[0].id,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${YOUR_DOMAIN}/?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${YOUR_DOMAIN}?canceled=true`,
    });

    res.redirect(303, session.url);
  } catch (error) {
    console.error('Checkout session creation failed:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

// Create customer portal session
app.post('/create-portal-session', async (req, res) => {
  try {
    const { session_id } = req.body;

    // Retrieve the checkout session to get customer ID
    const checkoutSession = await stripe.checkout.sessions.retrieve(session_id);

    const returnUrl = YOUR_DOMAIN;

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: checkoutSession.customer,
      return_url: returnUrl,
    });

    res.redirect(303, portalSession.url);
  } catch (error) {
    console.error('Portal session creation failed:', error);
    res.status(500).json({ error: 'Failed to create portal session' });
  }
});

// Webhook handler for subscription events
app.post('/webhook', express.raw({ type: 'application/json' }), (request, response) => {
  let event = request.body;

  // Verify webhook signature (recommended for production)
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (endpointSecret) {
    const signature = request.headers['stripe-signature'];
    try {
      event = stripe.webhooks.constructEvent(
        request.body,
        signature,
        endpointSecret
      );
    } catch (err) {
      console.log(`Webhook signature verification failed.`, err.message);
      return response.status(400).send(`Webhook Error: ${err.message}`);
    }
  }

  // Handle different event types
  switch (event.type) {
    case 'customer.subscription.trial_will_end':
      console.log('Subscription trial will end');
      break;
    case 'customer.subscription.deleted':
      console.log('Subscription deleted');
      break;
    case 'customer.subscription.created':
      console.log('Subscription created');
      break;
    case 'customer.subscription.updated':
      console.log('Subscription updated');
      break;
    case 'entitlements.active_entitlement_summary.updated':
      console.log('Active entitlement summary updated');
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  response.send();
});

// Start server
app.listen(4242, () => console.log('Stripe integration server running on port 4242'));

/*
USAGE INSTRUCTIONS:

1. Install dependencies:
   npm install stripe express

2. Set environment variables:
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...

3. Create products and prices in Stripe Dashboard

4. Start the server:
   node stripe-reference.js

5. Test the integration:
   - POST /create-checkout-session with lookup_key
   - POST /create-portal-session with session_id
   - Webhooks will be processed at /webhook

NOTE: This is a reference implementation. The actual application uses
the enhanced Stripe service in services/backend-api/src/services/paywall/stripe.service.ts
which includes proper error handling, logging, database integration, and security measures.
*/
