import React from 'react';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';

export default function StripeCheckoutButton({ priceId }: { priceId: string }) {
  const { user } = useAuth();

  const handleCheckout = async () => {
    if (!user?.email) return alert('You must be logged in.');
    try {
      const res = await axios.post('/api/stripe/create-checkout-session', {
        priceId,
        email: user.email,
      });
      if (res.data?.url) {
        window.location.href = res.data.url;
      } else {
        alert('Could not start checkout.');
      }
    } catch (err) {
      // Log unexpected errors for debugging
      console.error('StripeCheckoutButton handleCheckout error:', err);
      alert('Checkout failed.');
    }
  };

  return (
    <button
      className="bg-green-600 text-white px-6 py-2 rounded font-semibold hover:bg-green-700 mt-8"
      onClick={handleCheckout}
    >
      Upgrade to Pro
    </button>
  );
}
