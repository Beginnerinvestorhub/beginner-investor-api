import React, { useState } from 'react';
import { useApiPost } from '../hooks/useApi';

export default function NewsletterSignup() {
  const [email, setEmail] = useState('');
  
  // Use the new useApiPost hook for cleaner API state management
  const { loading, error, post, reset } = useApiPost('/api/newsletter', {
    onSuccess: () => {
      setEmail(''); // Clear email on success
      // Reset the API state after 3 seconds to clear success message
      setTimeout(() => reset(), 3000);
    }
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await post({ email });
    } catch (err) {
      // Error is already handled by useApi hook
    }
  };

  const isSuccess = !loading && !error && email === ''; // Success state when email is cleared

  return (
    <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-2 mt-8 max-w-lg mx-auto">
      <input
        type="email"
        className="flex-1 border border-indigo-300 rounded px-4 py-2"
        placeholder="Your email for updates"
        value={email}
        onChange={e => setEmail(e.target.value)}
        required
        disabled={loading}
      />
      <button
        type="submit"
        className="bg-indigo-700 text-white px-6 py-2 rounded font-semibold hover:bg-indigo-800 disabled:opacity-50"
        disabled={loading || !email}
      >
        {loading ? 'Subscribing...' : 'Subscribe'}
      </button>
      {isSuccess && <span className="text-green-600 ml-2">Thank you for subscribing!</span>}
      {error && <span className="text-red-500 ml-2">{error}</span>}
    </form>
  );
}
