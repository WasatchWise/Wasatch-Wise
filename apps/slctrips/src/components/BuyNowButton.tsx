'use client';

import { useState } from 'react';
import { showError } from '@/lib/toast';

interface BuyNowButtonProps {
  tripkit: {
    id: string;
    name: string;
    price: number;
  };
}

export default function BuyNowButton({ tripkit }: BuyNowButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleBuyNow = async () => {
    setLoading(true);

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tripkitId: tripkit.id,
          tripkitName: tripkit.name,
          price: tripkit.price,
        }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      showError('Sorry, there was an error starting the checkout process. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <div className="text-4xl font-bold text-gray-900 mb-2">
          ${tripkit.price}
        </div>
        <p className="text-gray-600">One-time purchase • Lifetime access</p>
      </div>

      <button
        onClick={handleBuyNow}
        disabled={loading}
        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-4 rounded-lg font-bold text-lg hover:from-blue-700 hover:to-blue-800 transition-all hover:-translate-y-1 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Loading...' : 'Buy Now'}
      </button>

      <div className="text-center text-sm text-gray-500">
        <p>✓ Instant digital delivery</p>
        <p>✓ Secure checkout with Stripe</p>
        <p>✓ 30-day money-back guarantee</p>
      </div>
    </div>
  );
}
