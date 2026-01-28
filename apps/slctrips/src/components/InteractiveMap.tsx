'use client';

interface MapLegendItem {
  icon: string;
  label: string;
}

const mapLegend: MapLegendItem[] = [
  { icon: '📍', label: 'General' },
  { icon: '🌳', label: 'Park/Garden' },
  { icon: '📚', label: 'Library/Bookshop' },
  { icon: '🏛️', label: 'Museum/Culture' },
  { icon: '🥾', label: 'Trail/Outdoors' },
  { icon: '🎭', label: 'Venue/Performance' },
  { icon: '🍺', label: 'Brewery/Bar' },
  { icon: '☕', label: 'Coffee/Cafe' },
  { icon: '🍽️', label: 'Restaurant' },
  { icon: '⛳', label: 'Golf' },
  { icon: '🛍️', label: 'Market/Shop' },
  { icon: '🌊', label: 'Lake/Water' },
  { icon: '🍰', label: 'Dessert/Bakery' },
  { icon: '🦁', label: 'Zoo/Aquarium' },
];

export default function InteractiveMap() {
  return (
    <div className="w-full max-w-7xl mx-auto">
      {/* Map Container */}
      <div className="bg-gray-800/60 border border-gray-700 rounded-xl overflow-hidden shadow-2xl">
        <div className="grid lg:grid-cols-[280px_1fr] gap-0">
          {/* Left Side: Legend */}
          <div className="bg-gray-800/80 backdrop-blur-sm p-6 border-r border-gray-700">
            <div className="mb-6 pb-4 border-b border-gray-600">
              <h3 className="text-2xl font-bold text-white mb-3">
                Interactive Map
              </h3>
              <p className="text-sm text-gray-300 leading-relaxed">
                Click the <span className="font-semibold text-blue-400">expand button (⛶)</span> on the map to open the full interactive experience
              </p>
            </div>

            <div className="text-xs text-gray-400 uppercase tracking-wider mb-3 font-semibold">
              Map Categories
            </div>

            <div className="space-y-1 max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
              {mapLegend.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-700/50 transition-colors cursor-pointer group"
                >
                  <div className="text-lg flex-shrink-0 w-6 text-center group-hover:scale-110 transition-transform">
                    {item.icon}
                  </div>
                  <div className="text-sm text-gray-300 group-hover:text-white transition-colors">
                    {item.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Side: Map Embed */}
          <div className="relative min-h-[500px] lg:min-h-[600px]">
            <iframe
              src="https://www.google.com/maps/d/embed?mid=1Qo-elSA5zDyfixATtzxxxNkNkUI&ehbc=2E312F"
              width="100%"
              height="100%"
              className="absolute inset-0 w-full h-full"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              title="SLCTrips Interactive Map - The Original"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
