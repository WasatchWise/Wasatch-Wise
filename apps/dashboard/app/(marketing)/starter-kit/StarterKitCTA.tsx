'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

export function StarterKitCTA() {
  const [loading, setLoading] = useState(false);

  const handleBuy = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product: 'starter-kit' }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || 'Checkout failed');
      }
    } catch (e) {
      console.error(e);
      alert('Checkout failed. Please try again or contact support.');
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleBuy}
      disabled={loading}
      className="bg-orange-500 hover:bg-orange-600 text-white text-lg px-10 py-6 rounded-lg font-semibold"
    >
      {loading ? 'Redirecting...' : 'Buy Now – $79'}
    </Button>
  );
}
