'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { showSuccess, showError } from '@/lib/toast';

interface ReserveNowButtonProps {
  item: {
    id: string;
    name: string;
    price?: number;
  };
  itemType: 'tripkit' | 'welcome-wagon';
}

export default function ReserveNowButton({ item, itemType }: ReserveNowButtonProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleReserve = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const name = formData.get('name') as string;

    try {
      const { error } = await supabase
        .from('email_captures')
        .insert([
          {
            email,
            name: name || null,
            source: `reservation_${itemType}`,
            metadata: {
              item_id: item.id,
              item_name: item.name,
              item_type: itemType,
              price: item.price || 0
            }
          }
        ]);

      if (error) {
        console.error('Error saving reservation:', error);
        showError('Something went wrong. Please try again.');
        return;
      }

      showSuccess(`Success! We'll email you at ${email} when ${item.name} is available for purchase.`);
      setModalOpen(false);
      (e.target as HTMLFormElement).reset();
    } catch (err) {
      console.error('Error:', err);
      alert('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="space-y-4">
        <div className="text-center mb-6">
          {item.price !== undefined && (
            <div className="text-4xl font-bold text-gray-900 mb-2">
              ${item.price}
            </div>
          )}
          <p className="text-gray-600 font-semibold text-blue-600">Coming Soon!</p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 px-8 py-4 rounded-lg font-bold text-lg hover:from-yellow-300 hover:to-orange-400 transition-all hover:-translate-y-1 shadow-lg"
        >
          Reserve Yours Now
        </button>

        <div className="text-center text-sm text-gray-500">
          <p>✓ Get notified when available</p>
          <p>✓ No payment required now</p>
          <p>✓ Be first in line</p>
        </div>
      </div>

      {modalOpen && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="bg-white border-2 border-blue-500 rounded-xl p-8 max-w-md w-full relative animate-slideUp"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-3xl leading-none p-2"
            >
              ×
            </button>

            <h3 className="text-2xl font-bold text-blue-600 mb-2">
              Reserve: {item.name}
            </h3>
            <p className="text-gray-600 mb-6">
              Enter your email and we'll notify you the moment this becomes available for purchase. No payment required now!
            </p>

            <form onSubmit={handleReserve} className="space-y-4">
              <div>
                <label htmlFor="email" className="block mb-2 text-gray-700 font-medium">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  placeholder="you@email.com"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <div>
                <label htmlFor="name" className="block mb-2 text-gray-700 font-medium">
                  First Name (optional)
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  placeholder="Your name"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 py-3 px-6 rounded-lg font-semibold hover:from-yellow-300 hover:to-orange-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Reserving...' : 'Reserve My Spot'}
              </button>

              <p className="text-xs text-gray-500 text-center">
                We'll only email you about {item.name}. No spam, promise.
              </p>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
