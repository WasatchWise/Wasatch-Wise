'use client';

import { Guardian } from '@/types/database.types';
import { useState } from 'react';
import Image from 'next/image';
import SafeImage from '@/components/SafeImage';

const GUARDIAN_PLACEHOLDER = '/images/default-guardian.webp';

interface GuardianGalleryProps {
  guardians: Guardian[];
}

export default function GuardianGallery({ guardians }: GuardianGalleryProps) {
  const [selectedGuardian, setSelectedGuardian] = useState<Guardian | null>(null);

  return (
    <div className="mb-12">
      <div className="text-center mb-8">
        <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-3">
          Meet the Mt. Olympians
        </h2>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          29 legendary guardians, one for each Utah county. Click any guardian to learn their story!
        </p>
      </div>

      <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-7 gap-4">
        {guardians.map((guardian) => (
          <button
            key={guardian.id}
            onClick={() => setSelectedGuardian(guardian)}
            className="group relative bg-white rounded-2xl p-3 shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-3 duration-300 focus:outline-none focus:ring-4 focus:ring-blue-400"
          >
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 rounded-2xl blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-300"></div>

            {/* Content */}
            <div className="relative">
              <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-2 mb-2 flex items-center justify-center h-24 md:h-32 overflow-hidden relative">
                <SafeImage
                  src={guardian.image_url || GUARDIAN_PLACEHOLDER}
                  alt={guardian.display_name}
                  className="object-contain drop-shadow-2xl transform group-hover:scale-110 transition-transform duration-300"
                  fallbackSrc={GUARDIAN_PLACEHOLDER}
                  fill
                />
              </div>
              <div className="text-center">
                <div className="font-bold text-xs md:text-sm text-gray-900 truncate">
                  {guardian.display_name}
                </div>
                <div className="text-xs text-gray-600 truncate">{guardian.county}</div>
              </div>
            </div>

            {/* Element badge */}
            {guardian.element && (
              <div className="absolute -top-2 -right-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                ✨
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Modal for selected guardian */}
      {selectedGuardian && (
        <div
          className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedGuardian(null)}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden transform transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header with gradient */}
            <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 p-8 text-white relative">
              <button
                onClick={() => setSelectedGuardian(null)}
                className="absolute top-4 right-4 w-10 h-10 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full flex items-center justify-center text-2xl font-bold transition-all"
              >
                ×
              </button>

              <div className="flex items-center gap-6">
                <div className="flex-shrink-0 bg-white bg-opacity-20 backdrop-blur-sm rounded-2xl p-4 relative w-32 h-32">
                  <SafeImage
                    src={selectedGuardian.image_url || GUARDIAN_PLACEHOLDER}
                    alt={selectedGuardian.display_name}
                    fill
                    className="object-contain drop-shadow-2xl"
                    fallbackSrc={GUARDIAN_PLACEHOLDER}
                  />
                </div>
                <div>
                  <h3 className="text-4xl font-extrabold mb-2 text-white">
                    {selectedGuardian.display_name}
                  </h3>
                  <p className="text-xl opacity-90">{selectedGuardian.county} County</p>
                  {selectedGuardian.element && (
                    <div className="mt-3 inline-block bg-white bg-opacity-20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-semibold">
                      ✨ Element: {selectedGuardian.element}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="p-8 space-y-6">
              {selectedGuardian.bio && (
                <div>
                  <h4 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <span className="text-2xl">📖</span> Guardian&apos;s Story
                  </h4>
                  <p className="text-gray-700 leading-relaxed text-lg">
                    {selectedGuardian.bio}
                  </p>
                </div>
              )}

              {selectedGuardian.motto && (
                <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border-l-4 border-amber-400 rounded-r-lg p-4">
                    <h4 className="text-sm font-bold text-gray-700 mb-2">💬 Guardian&apos;s Motto</h4>
                  <p className="text-gray-800 italic font-semibold text-lg">
                    &quot;{selectedGuardian.motto}&quot;
                  </p>
                </div>
              )}

              <div className="flex gap-4">
                <a
                  href={`/guardians/${selectedGuardian.county?.toLowerCase().replace(/\s+/g, '-') || selectedGuardian.codename?.toLowerCase().replace(/\s+/g, '-') || selectedGuardian.id}`}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-bold text-center hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
                >
                  View Full Profile
                </a>
                <button
                  onClick={() => setSelectedGuardian(null)}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
