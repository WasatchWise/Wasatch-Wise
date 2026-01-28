'use client';

import { useEffect, useState, useRef } from 'react';

interface UtahCountyMapProps {
  highlightedCounty?: string; // County name to highlight (e.g., "CACHE", "SALT LAKE")
  width?: number;
  height?: number;
  className?: string;
  showWilderness?: boolean; // Show wilderness area overlays
}

interface CountyFeature {
  type: string;
  properties: {
    NAME: string;
    [key: string]: any;
  };
  geometry: {
    type: string;
    coordinates: any;
  };
}

export default function UtahCountyMap({
  highlightedCounty,
  width = 400,
  height = 600,
  className = '',
  showWilderness = false,
}: UtahCountyMapProps) {
  const [counties, setCounties] = useState<CountyFeature[]>([]);
  const [wildernessAreas, setWildernessAreas] = useState<CountyFeature[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    async function loadGeoJSON() {
      try {
        const response = await fetch('/data/utah-county-boundaries.geojson');
        if (!response.ok) {
          throw new Error('Failed to load county boundaries');
        }
        const data = await response.json();
        setCounties(data.features);
        setLoading(false);
      } catch (err) {
        console.error('Error loading GeoJSON:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setLoading(false);
      }
    }

    loadGeoJSON();
  }, []);

  useEffect(() => {
    async function loadWildernessAreas() {
      if (!showWilderness) {
        setWildernessAreas([]);
        return;
      }

      try {
        const response = await fetch('/data/utah-wilderness-areas.geojson');
        if (!response.ok) {
          console.warn('Failed to load wilderness areas');
          return;
        }
        const data = await response.json();
        setWildernessAreas(data.features);
      } catch (err) {
        console.warn('Error loading wilderness areas:', err);
      }
    }

    loadWildernessAreas();
  }, [showWilderness]);

  // Helper function to convert GeoJSON coordinates to SVG path
  const coordinatesToPath = (coordinates: any, type: string): string => {
    if (type === 'Polygon') {
      return coordinates.map((ring: number[][]) => {
        return ring.map((point, i) => {
          const [lon, lat] = point;
          // Simple equirectangular projection
          // Utah bounds: approximately [-114.05, -109.04] lon, [37.0, 42.0] lat
          const x = ((lon + 114.05) / 5.01) * width;
          const y = height - ((lat - 37.0) / 5.0) * height;
          return `${i === 0 ? 'M' : 'L'} ${x},${y}`;
        }).join(' ') + ' Z';
      }).join(' ');
    } else if (type === 'MultiPolygon') {
      return coordinates.map((polygon: number[][][]) => {
        return polygon.map((ring: number[][]) => {
          return ring.map((point, i) => {
            const [lon, lat] = point;
            const x = ((lon + 114.05) / 5.01) * width;
            const y = height - ((lat - 37.0) / 5.0) * height;
            return `${i === 0 ? 'M' : 'L'} ${x},${y}`;
          }).join(' ') + ' Z';
        }).join(' ');
      }).join(' ');
    }
    return '';
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 rounded-lg ${className}`} style={{ width, height }}>
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-blue-600 mb-2"></div>
          <p className="text-sm text-gray-600">Loading map...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center bg-red-50 rounded-lg border border-red-200 ${className}`} style={{ width, height }}>
        <div className="text-center p-4">
          <p className="text-sm text-red-600">Error loading map</p>
          <p className="text-xs text-red-500 mt-1">{error}</p>
        </div>
      </div>
    );
  }

  const normalizedHighlight = highlightedCounty?.toUpperCase().replace(/ COUNTY$/i, '').trim();

  return (
    <div className={`relative ${className}`}>
      <svg
        ref={svgRef}
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="utah-county-map"
        style={{ maxWidth: '100%', height: 'auto' }}
      >
        {/* Background */}
        <rect width={width} height={height} fill="#f0f9ff" />

        {/* County paths */}
        {counties.map((county) => {
          const countyName = county.properties.NAME;
          const isHighlighted = normalizedHighlight === countyName;

          return (
            <g key={countyName}>
              <path
                d={coordinatesToPath(county.geometry.coordinates, county.geometry.type)}
                fill={isHighlighted ? '#3b82f6' : '#ffffff'}
                stroke={isHighlighted ? '#1e40af' : '#cbd5e1'}
                strokeWidth={isHighlighted ? 2 : 0.5}
                className="transition-all duration-300"
                opacity={isHighlighted ? 0.8 : 0.9}
              >
                <title>{countyName} County</title>
              </path>
            </g>
          );
        })}

        {/* Wilderness area overlays */}
        {showWilderness && wildernessAreas.map((area, idx) => {
          const areaName = area.properties.NAME || area.properties.WILDNAME || area.properties.FULLNAME || `Wilderness ${idx}`;

          return (
            <g key={`wilderness-${idx}`}>
              <path
                d={coordinatesToPath(area.geometry.coordinates, area.geometry.type)}
                fill="#10b981"
                stroke="#059669"
                strokeWidth={0.5}
                opacity={0.4}
                className="transition-all duration-300"
              >
                <title>{areaName}</title>
              </path>
            </g>
          );
        })}

        {/* Legend */}
        {(highlightedCounty || showWilderness) && (
          <g transform={`translate(10, ${height - (showWilderness && highlightedCounty ? 70 : 40)})`}>
            <rect
              width={showWilderness && highlightedCounty ? "150" : "120"}
              height={showWilderness && highlightedCounty ? "60" : "30"}
              fill="white"
              stroke="#cbd5e1"
              strokeWidth="1"
              rx="4"
            />
            {highlightedCounty && (
              <>
                <rect x="8" y="10" width="20" height="10" fill="#3b82f6" />
                <text x="35" y="20" fontSize="12" fill="#1f2937" fontFamily="sans-serif">
                  {highlightedCounty}
                </text>
              </>
            )}
            {showWilderness && (
              <>
                <rect
                  x="8"
                  y={highlightedCounty ? "35" : "10"}
                  width="20"
                  height="10"
                  fill="#10b981"
                  opacity="0.4"
                />
                <text
                  x="35"
                  y={highlightedCounty ? "45" : "20"}
                  fontSize="12"
                  fill="#1f2937"
                  fontFamily="sans-serif"
                >
                  Wilderness Areas
                </text>
              </>
            )}
          </g>
        )}
      </svg>
    </div>
  );
}
