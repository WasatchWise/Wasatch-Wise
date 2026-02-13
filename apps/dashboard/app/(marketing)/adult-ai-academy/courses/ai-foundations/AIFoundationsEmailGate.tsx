'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

export function AIFoundationsEmailGate() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/email-capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'aaa-free-preview' }),
      });

      if (res.ok) {
        setSuccess(true);
        window.location.href = '/adult-ai-academy/courses/ai-literacy-foundations/lessons/m1-l1';
      } else {
        const data = await res.json();
        setError(data.error || 'Something went wrong. Please try again.');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
        <p className="text-green-800 font-semibold">Check your email for the free lesson link.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@school.edu"
        required
        className="flex-1 px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
      />
      <Button
        type="submit"
        disabled={loading}
        className="bg-orange-500 hover:bg-orange-600 whitespace-nowrap"
      >
        {loading ? '...' : 'Get Free Access'}
      </Button>
      {error && <p className="text-red-600 text-sm sm:col-span-2">{error}</p>}
    </form>
  );
}
