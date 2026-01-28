'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { showError } from '@/lib/toast';

interface GiftPurchaseButtonProps {
  tripkitId: string;
  tripkitName: string;
  tripkitCode: string;
  price: number;
  slug: string;
  className?: string;
}

export default function GiftPurchaseButton({
  tripkitId,
  tripkitName,
  tripkitCode,
  price,
  slug,
  className = ''
}: GiftPurchaseButtonProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    recipientName: '',
    recipientEmail: '',
    senderName: '',
    giftMessage: '',
    deliveryOption: 'immediate' as 'immediate' | 'scheduled',
    scheduledDate: ''
  });

  const handleGiftPurchase = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.recipientName || !formData.recipientEmail) {
      showError('Please fill in recipient details');
      return;
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.recipientEmail)) {
      showError('Please enter a valid email address');
      return;
    }

    // Check if user is authenticated
    if (!user) {
      showError('Please sign in to purchase gifts');
      router.push(`/auth/signin?redirect=/tripkits/${slug}`);
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/stripe/create-gift-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tripkitId,
          senderEmail: user.email,
          senderName: formData.senderName || user.user_metadata?.name || 'A friend',
          recipientEmail: formData.recipientEmail,
          recipientName: formData.recipientName,
          giftMessage: formData.giftMessage,
          deliveryDate: formData.deliveryOption === 'immediate'
            ? null
            : formData.scheduledDate
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create gift checkout');
      }

      // Redirect to Stripe checkout
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL received');
      }

    } catch (error: any) {
      console.error('Gift purchase error:', error);
      showError(error.message || 'Failed to start gift checkout. Please try again.');
      setIsLoading(false);
    }
  };

  // Don't show gift option for free TripKits
  if (price === 0) {
    return null;
  }

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className={`
          bg-gradient-to-r from-pink-500 to-purple-600
          hover:from-pink-600 hover:to-purple-700
          text-white font-bold py-3 px-8 rounded-lg
          transition-all duration-200
          hover:scale-105 active:scale-95
          shadow-lg hover:shadow-xl
          flex items-center justify-center gap-2
          ${className}
        `}
      >
        <span>🎁</span>
        <span>Give as Gift</span>
      </button>

      {/* Gift Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="bg-gradient-to-r from-pink-500 to-purple-600 rounded-t-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold flex items-center gap-2 text-white">
                    <span>🎁</span> Gift This TripKit
                  </h2>
                  <p className="text-pink-100 mt-1">{tripkitName}</p>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-white/80 hover:text-white text-2xl"
                >
                  &times;
                </button>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleGiftPurchase} className="p-6 space-y-4">
              {/* Recipient Details */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Recipient's Name *
                </label>
                <input
                  type="text"
                  value={formData.recipientName}
                  onChange={(e) => setFormData({ ...formData, recipientName: e.target.value })}
                  placeholder="Who is this gift for?"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Recipient's Email *
                </label>
                <input
                  type="email"
                  value={formData.recipientEmail}
                  onChange={(e) => setFormData({ ...formData, recipientEmail: e.target.value })}
                  placeholder="their@email.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Your Name (shown to recipient)
                </label>
                <input
                  type="text"
                  value={formData.senderName}
                  onChange={(e) => setFormData({ ...formData, senderName: e.target.value })}
                  placeholder="Your name"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              {/* Gift Message */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Personal Message (optional)
                </label>
                <textarea
                  value={formData.giftMessage}
                  onChange={(e) => setFormData({ ...formData, giftMessage: e.target.value })}
                  placeholder="Write a personal message to include with your gift..."
                  rows={3}
                  maxLength={500}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                />
                <p className="text-xs text-gray-500 mt-1">{formData.giftMessage.length}/500 characters</p>
              </div>

              {/* Delivery Options */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  When should we deliver it?
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="deliveryOption"
                      checked={formData.deliveryOption === 'immediate'}
                      onChange={() => setFormData({ ...formData, deliveryOption: 'immediate' })}
                      className="text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-gray-700">Send immediately</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="deliveryOption"
                      checked={formData.deliveryOption === 'scheduled'}
                      onChange={() => setFormData({ ...formData, deliveryOption: 'scheduled' })}
                      className="text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-gray-700">Schedule for later</span>
                  </label>
                </div>

                {formData.deliveryOption === 'scheduled' && (
                  <input
                    type="date"
                    value={formData.scheduledDate}
                    onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full mt-2 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                )}
              </div>

              {/* Price Summary */}
              <div className="bg-gray-50 rounded-lg p-4 mt-6">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Gift: {tripkitName}</span>
                  <span className="text-xl font-bold text-gray-900">${price.toFixed(2)}</span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold py-4 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Processing...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <span>🎁</span>
                    <span>Complete Gift Purchase - ${price.toFixed(2)}</span>
                  </span>
                )}
              </button>

              <p className="text-xs text-gray-500 text-center">
                Secure payment via Stripe. You'll receive a confirmation email.
              </p>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
