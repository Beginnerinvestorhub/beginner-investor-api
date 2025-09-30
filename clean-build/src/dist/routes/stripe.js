"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const stripe_1 = __importDefault(require("stripe"));
const router = express_1.default.Router();
const stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2025-06-30.basil' });
// POST /api/stripe/create-checkout-session
router.post('/create-checkout-session', async (req, res) => {
    const { priceId, email } = req.body;
    if (!priceId)
        return res.status(400).json({ error: 'Missing priceId' });
    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{ price: priceId, quantity: 1 }],
            mode: 'subscription', // or 'payment' for one-time
            customer_email: email,
            success_url: `${process.env.FRONTEND_URL}/dashboard?checkout=success`,
            cancel_url: `${process.env.FRONTEND_URL}/dashboard?checkout=cancel`,
        });
        res.json({ url: session.url });
    }
    catch (err) {
        console.error('Stripe error', err);
        res.status(500).json({ error: 'Stripe session creation failed.' });
    }
});
exports.default = router;
