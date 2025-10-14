import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useRouter } from 'next/router';

interface AuthFormProps {
  mode?: 'login' | 'signup';
}

export default function AuthForm({ mode = 'login' }: AuthFormProps) {
  const { login, signup, loading, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await signup(email, password);
      }
      router.push('/dashboard');
    } catch (err: any) {
      setFormError(err.message || 'Authentication failed');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col w-full gap-4">
      <label className="flex flex-col w-full text-sm">
        Email
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          className="mt-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
      </label>
      <label className="flex flex-col w-full text-sm">
        Password
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          className="mt-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
      </label>
      <button
        type="submit"
        disabled={loading}
        className="mt-4 w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
      >
        {loading ? 'Loading...' : mode === 'login' ? 'Login' : 'Sign Up'}
      </button>
      {(formError || error) && (
        <div className="mt-2 text-red-600 text-sm">
          {formError || error?.message || 'An error occurred'}
        </div>
      )}
    </form>
  );
}
