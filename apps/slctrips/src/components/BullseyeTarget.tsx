'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Image from 'next/image';

export default function BullseyeTarget() {
  const router = useRouter();
  const [hoveredRing, setHoveredRing] = useState<string | null>(null);

  // Based on analyzing your image (appears to be ~1080x1080)
  const imageWidth = 1080;
  const imageHeight = 1080;
  const centerX = imageWidth / 2;  // 540

  // Estimated ring radii from your bullseye image
  // These create "donut" shaped clickable areas between each radius
  const ringRadii = [
    { name: '12h', innerRadius: 420, outerRadius: 540 },    // Outermost ring
    { name: '8h', innerRadius: 340, outerRadius: 420 },
    { name: '5h', innerRadius: 260, outerRadius: 340 },
    { name: '3h', innerRadius: 180, outerRadius: 260 },
    { name: '90min', innerRadius: 100, outerRadius: 180 },
    { name: '30min', innerRadius: 0, outerRadius: 100 }     // Center circle
  ];

  const handleRingClick = (ringName: string) => {
    router.push(`/destinations?category=${ringName}`);
  };

  return (
    <div className="relative w-full mx-auto">
      {/* Bullseye Image */}
      <div className="relative w-full aspect-square">
        <Image
          src="/images/BullsEye.png"
          alt="Drive Time Bullseye from Salt Lake City"
          fill
          className="object-contain rounded-full"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </div>

      {/* Clickable Ring Overlays */}
      <div className="absolute inset-0 pointer-events-none">
        {ringRadii.map((ring) => {
          const isHovered = hoveredRing === ring.name;

          // Calculate percentages relative to container
          const innerPercent = (ring.innerRadius / centerX) * 50; // 50 = half width as percent
          const outerPercent = (ring.outerRadius / centerX) * 50;

          return (
            <div
              key={ring.name}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-auto cursor-pointer transition-all duration-300"
              style={{
                width: `${outerPercent * 2}%`,
                height: `${outerPercent * 2}%`,
              }}
              onClick={() => handleRingClick(ring.name)}
              onMouseEnter={() => setHoveredRing(ring.name)}
              onMouseLeave={() => setHoveredRing(null)}
            >
              {/* Hover overlay */}
              {isHovered && (
                <div className="absolute inset-0 rounded-full bg-white/10 border-2 border-white/40 animate-pulse" />
              )}

              {/* Inner cutout to create donut shape */}
              {ring.innerRadius > 0 && (
                <div
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none"
                  style={{
                    width: `${(innerPercent / outerPercent) * 100}%`,
                    height: `${(innerPercent / outerPercent) * 100}%`,
                    background: 'transparent',
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
