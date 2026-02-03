'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import SafeImage from '@/components/SafeImage';

interface Destination {
  id: string;
  name: string;
  slug: string;
  subcategory: string;
  drive_minutes: number | null;
  distance_miles: number | null;
  image_url: string;
  is_featured: boolean;
}

interface RandomDestinationPickerProps {
  onPickStart?: () => void;
  onPickComplete?: () => void;
}

export default function RandomDestinationPicker({ onPickStart, onPickComplete }: RandomDestinationPickerProps) {
  const router = useRouter();
  const [isAnimating, setIsAnimating] = useState(false);
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null);
  const [showModal, setShowModal] = useState(false);

  const pickRandomDestination = async () => {
    setIsAnimating(true);
    onPickStart?.();

    try {
      // Prefer curated destinations: featured or is_featured, with image. Avoids generic/wrong photos (e.g. construction).
      let { data, error } = await supabase
        .from('public_destinations')
        .select('id, name, slug, subcategory, drive_minutes, distance_miles, image_url, is_featured')
        .not('image_url', 'is', null)
        .or('featured.eq.true,is_featured.eq.true')
        .limit(100);

      // Fallback: any destination with image, ordered by popularity so better picks surface first
      if (error || !data || data.length === 0) {
        const fallback = await supabase
          .from('public_destinations')
          .select('id, name, slug, subcategory, drive_minutes, distance_miles, image_url, is_featured')
          .not('image_url', 'is', null)
          .order('popularity_score', { ascending: false, nullsFirst: false })
          .limit(100);
        data = fallback.data;
        error = fallback.error;
      }

      if (error || !data || data.length === 0) {
        console.error('Error fetching destinations:', error);
        setIsAnimating(false);
        return;
      }

      const randomIndex = Math.floor(Math.random() * data.length);
      const destination = data[randomIndex] as Destination;

      // Simulate animation delay (arrow shooting + hitting target)
      // TODO: Add actual animation here
      setTimeout(() => {
        setSelectedDestination(destination);
        setShowModal(true);
        setIsAnimating(false);
        onPickComplete?.();
      }, 1500); // 1.5 second animation time

    } catch (err) {
      console.error('Error picking destination:', err);
      setIsAnimating(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedDestination(null);
  };

  const goToDestination = () => {
    if (selectedDestination) {
      router.push(`/destinations/${selectedDestination.slug}`);
    }
  };

  return (
    <>
      {/* Button */}
      <button
        onClick={pickRandomDestination}
        disabled={isAnimating}
        className={`bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 px-8 py-4 rounded-lg font-bold text-lg hover:from-yellow-300 hover:to-orange-400 transition-all hover:-translate-y-1 shadow-lg ${
          isAnimating ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        {isAnimating ? '🏹 Shooting...' : '🎯 Pick a Random Destination for Me'}
      </button>

      {/* Modal Overlay - Shows the selected destination */}
      {showModal && selectedDestination && (
        <>
          {/* Screen reader announcement */}
          <div 
            role="alert" 
            aria-live="assertive"
            className="sr-only"
          >
            Selected destination: {selectedDestination.name}
          </div>
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn"
            onClick={closeModal}
          >
          <div
            className="bg-gray-800 border-2 border-yellow-400 rounded-2xl max-w-2xl w-full overflow-hidden animate-scaleIn"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Destination Photo */}
            {selectedDestination.image_url && (
              <div className="aspect-video w-full overflow-hidden bg-gray-700">
                <SafeImage
                  src={selectedDestination.image_url}
                  alt={selectedDestination.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Content */}
            <div className="p-8">
              <div className="text-center mb-6">
                <div className="text-yellow-400 text-6xl mb-4">🎯</div>
                <h2 className="text-3xl font-bold text-white mb-2">
                  Dan's Arrow Has Spoken!
                </h2>
                <p className="text-gray-400">Your adventure awaits...</p>
              </div>

              {/* Destination Info */}
              <div className="bg-gray-900/50 rounded-xl p-6 mb-6">
                <h3 className="text-2xl font-bold text-white mb-3">
                  {selectedDestination.name}
                </h3>
                <p className="text-blue-400 text-lg mb-4">
                  {selectedDestination.subcategory || 'Destination'}
                </p>
                <div className="flex items-center gap-6 text-gray-300">
                  <span className="flex items-center gap-2">
                    <span className="text-xl">🚗</span>
                    {selectedDestination.drive_minutes ?? '—'} min
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="text-xl">📍</span>
                    {selectedDestination.distance_miles ?? '—'} mi
                  </span>
                  {selectedDestination.is_featured && (
                    <span className="text-yellow-400">⭐ Featured</span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <button
                  onClick={goToDestination}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition-all"
                >
                  Let's Go! →
                </button>
                <button
                  onClick={pickRandomDestination}
                  className="flex-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 px-6 py-3 rounded-lg font-semibold hover:from-yellow-300 hover:to-orange-400 transition-all"
                >
                  🎲 Pick Again
                </button>
              </div>

              <button
                onClick={closeModal}
                className="w-full mt-4 text-gray-400 hover:text-white transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
        </>
      )}

      {/* Animation Styles */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }

        .animate-scaleIn {
          animation: scaleIn 0.4s ease-out;
        }
      `}</style>
    </>
  );
}
