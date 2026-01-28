'use client';

/**
 * Guardian Introduction Component
 *
 * The Guardian describes the destination in their voice.
 */

import Link from 'next/link';
import SafeImage from './SafeImage';

interface GuardianIntroductionProps {
  guardian: {
    display_name: string;
    county: string;
    animal_type: string;
    backstory?: string | null;
    personality?: string | null;
  };
  destination: {
    name: string;
    subcategory: string;
    description?: string | null;
  };
  guardianImagePath: string;
}

export default function GuardianIntroduction({
  guardian,
  destination,
  guardianImagePath
}: GuardianIntroductionProps) {
  // Use destination description - Guardian describes what this place is
  const description = destination.description || `Welcome to ${destination.name}.`;

  return (
    <div className="bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 border-2 border-purple-400 rounded-xl p-8 shadow-2xl text-white relative overflow-hidden">
      {/* Mystical background effects */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent pointer-events-none"></div>

      {/* Content */}
      <div className="relative z-10">
        <div className="flex items-start gap-6 mb-6">
          <div className="relative flex-shrink-0">
            <SafeImage
              src={guardianImagePath}
              alt={`${guardian.display_name} - Guardian of ${guardian.county}`}
              className="w-24 h-24 md:w-32 md:h-32 object-contain drop-shadow-[0_0_20px_rgba(255,255,255,0.5)] animate-pulse-slow"
            />
            {/* Glow effect */}
            <div className="absolute inset-0 bg-purple-400 rounded-full blur-xl opacity-20 animate-pulse"></div>
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-yellow-200 via-purple-200 to-blue-200 bg-clip-text text-transparent">
                {guardian.display_name} Speaks
              </h2>
            </div>
            <p className="text-purple-200 font-semibold text-sm md:text-base flex items-center gap-2">
              <span className="inline-block w-2 h-2 bg-purple-400 rounded-full animate-pulse"></span>
              Guardian of {guardian.county} • {guardian.animal_type}
            </p>
          </div>
        </div>

        {/* Guardian describes the destination */}
        <div className="bg-black/20 rounded-lg p-6 mb-6 border border-purple-400/30 backdrop-blur-sm">
          <div className="flex items-start gap-3">
            <span className="text-4xl opacity-50">"</span>
            <p className="text-lg md:text-xl leading-relaxed text-gray-100 italic flex-1">
              {description}
            </p>
            <span className="text-4xl opacity-50 self-end">"</span>
          </div>
        </div>

        {/* Learn More Link */}
        <Link
          href={`/guardians/${guardian.county ? guardian.county.toLowerCase().replace(/\s+/g, '-') : 'unknown'}`}
          className="inline-flex items-center gap-2 text-purple-200 hover:text-white font-semibold transition-all group"
        >
          <span>Discover {guardian.display_name}'s full story</span>
          <span className="transition-transform group-hover:translate-x-1">→</span>
        </Link>
      </div>
    </div>
  );
}
