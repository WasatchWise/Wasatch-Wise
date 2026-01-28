'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { showSuccess, showError, showLoading, dismissToast } from '@/lib/toast';

interface TripKitPurchaseButtonProps {
  tripkitId: string;
  tripkitName: string;
  tripkitCode: string;
  price: number;
  slug: string;
  isFree?: boolean;
  className?: string;
}

export default function TripKitPurchaseButton({
  tripkitId,
  tripkitName,
  tripkitCode,
  price,
  slug,
  isFree = false,
  className = ''
}: TripKitPurchaseButtonProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handlePurchase = async () => {
    // Free TripKits redirect to email gate
    if (isFree || price === 0) {
      router.push(`/tripkits/${slug}/view`);
      return;
    }

    // Check if user is authenticated
    if (!user) {
      showError('Please sign in to purchase TripKits');
      router.push(`/auth/signin?redirect=/tripkits/${slug}`);
      return;
    }

    setIsLoading(true);
    const loadingToast = showLoading('Preparing checkout...');

    try {
      // Create Stripe checkout session
      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tripkitId,
          userId: user.id
        })
      });

      const data = await response.json();

      if (!response.ok) {
        dismissToast(loadingToast);
        if (response.status === 400 && data.error?.includes('already own')) {
          showSuccess('You already own this TripKit!');
          router.push(`/tripkits/${slug}/view`);
          return;
        }
        throw new Error(data.error || 'Failed to create checkout session');
      }

      // Redirect to Stripe checkout
      dismissToast(loadingToast);
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL received');
      }

    } catch (error: unknown) {
      dismissToast(loadingToast);
      console.error('Purchase error:', error);
      const message = error instanceof Error ? error.message : 'Failed to start checkout. Please try again.';
      showError(message);
      setIsLoading(false);
    }
  };

  const buttonText = isFree || price === 0
    ? 'Get Free Access'
    : isLoading
    ? 'Processing...'
    : `Buy for $${price.toFixed(2)}`;

  const buttonClasses = isFree || price === 0
    ? 'bg-green-600 hover:bg-green-700'
    : 'bg-blue-600 hover:bg-blue-700';

  return (
    <button
      onClick={handlePurchase}
      disabled={isLoading}
      data-testid="purchase-button"
      className={`
        ${buttonClasses}
        text-white font-bold py-3 px-8 rounded-lg
        transition-all duration-200
        hover:scale-105 active:scale-95
        disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
        shadow-lg hover:shadow-xl
        ${className}
      `}
    >
      {isLoading ? (
        <span className="flex items-center justify-center gap-2">
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          {buttonText}
        </span>
      ) : (
        buttonText
      )}
    </button>
  );
}
