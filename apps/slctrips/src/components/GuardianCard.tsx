'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Guardian } from '@/lib/types';

const GUARDIAN_PLACEHOLDER = '/images/default-guardian.webp';

interface GuardianCardProps {
  guardian: Guardian;
  destinationCount: number;
  isDiscovered?: boolean;
  showDiscoveryState?: boolean;
}

export default function GuardianCard({
  guardian,
  destinationCount,
  isDiscovered = true,
  showDiscoveryState = false,
}: GuardianCardProps) {
  const [imgError, setImgError] = useState(false);
  const guardianSlug = guardian.county?.toLowerCase().replace(/\s+/g, '-') || guardian.codename?.toLowerCase().replace(/\s+/g, '-');

  const imagePath = guardian.avatar_url || guardian.image_url ||
    (guardian.county ? `/images/guardians/${guardian.county.replace(/\s*County$/i, '').trim().toUpperCase().replace(/\s+/g, ' ')}.png` : GUARDIAN_PLACEHOLDER);
  const displaySrc = imgError ? GUARDIAN_PLACEHOLDER : imagePath;

  return (
    <Link
      href={`/guardians/${guardianSlug}`}
      className={`group relative bg-gradient-to-br from-gray-800/60 to-gray-900/60 border-2 rounded-xl overflow-hidden transition-all duration-300 shadow-lg hover:shadow-2xl ${
        showDiscoveryState && !isDiscovered
          ? 'border-gray-700 opacity-70 grayscale'
          : 'border-gray-700 hover:border-blue-500 hover:-translate-y-2'
      }`}
    >
      {/* Guardian Image */}
      <div className="aspect-square w-full overflow-hidden relative">
        <Image
          src={displaySrc}
          alt={guardian.display_name || guardian.codename || "Guardian"}
          fill
          className="object-contain group-hover:scale-110 transition-transform duration-500"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          onError={() => setImgError(true)}
        />
        {showDiscoveryState && !isDiscovered && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-white text-sm font-semibold tracking-wide">
            Undiscovered
          </div>
        )}
      </div>

      {/* Guardian Info */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-2xl font-bold text-white group-hover:text-blue-400 transition-colors">
            {guardian.display_name || guardian.codename}
          </h3>
          {guardian.element && (
            <span className="text-2xl">{getElementEmoji(guardian.element)}</span>
          )}
        </div>

        <p className="text-sm text-gray-400 mb-2">
          {guardian.county || 'Statewide Guardian'}
        </p>

        {guardian.animal_type && (
          <p className="text-xs text-blue-300 font-semibold mb-2">
            {guardian.animal_type} {guardian.archetype && `• ${guardian.archetype}`}
          </p>
        )}

        {guardian.motto && (
          <p className="text-sm italic text-gray-300 mb-4 line-clamp-2">
            &quot;{guardian.motto}&quot;
          </p>
        )}

        {guardian.bio && (
          <p className="text-sm text-gray-400 mb-4 line-clamp-3">
            {guardian.bio}
          </p>
        )}

        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">
            {destinationCount} destination{destinationCount !== 1 ? 's' : ''}
          </span>
          <span className="text-blue-400 group-hover:text-blue-300">
            Learn More →
          </span>
        </div>
      </div>
    </Link>
  );
}

function getElementEmoji(element: string): string {
  const elementMap: Record<string, string> = {
    'Fire': '🔥',
    'Water': '💧',
    'Earth': '🌍',
    'Air': '💨',
    'Spirit': '✨',
    'Ice': '❄️',
    'Lightning': '⚡',
    'Nature': '🌿'
  };
  return elementMap[element] || '🌟';
}
