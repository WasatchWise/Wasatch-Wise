import React from 'react';
import { FilterState } from '../types';
import { CUISINES, PRICES, UT_CITIES, VIBES } from '../constants';
import { Sliders, DollarSign, MapPin as MapIcon, Heart } from 'lucide-react';

interface FilterControlsProps {
  filters: FilterState;
  onChange: (key: keyof FilterState, value: string) => void;
  disabled: boolean;
}

const FilterControls: React.FC<FilterControlsProps> = ({ filters, onChange, disabled }) => {
  
  const selectClass = "w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-utah-orange focus:bg-utah-dark/50 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed appearance-none";
  const labelClass = "block text-utah-sand text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5";

  return (
    <div className="bg-utah-dark/80 backdrop-blur-md p-6 rounded-2xl border border-white/10 shadow-xl mb-8 w-full max-w-4xl mx-auto">
      <div className="flex items-center gap-2 mb-4 text-white/80 border-b border-white/10 pb-2">
         <Sliders size={18} />
         <h3 className="font-semibold text-sm">Configure Your Spin</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Location */}
        <div className="relative group">
          <label className={labelClass}>
            <MapIcon size={12} /> Location
          </label>
          <div className="relative">
            <select 
              value={filters.location}
              onChange={(e) => onChange('location', e.target.value)}
              disabled={disabled}
              className={selectClass}
            >
              {UT_CITIES.map(city => (
                <option key={city} value={city} className="bg-utah-dark">{city}</option>
              ))}
              <option value="Other" className="bg-utah-dark">📍 Use Current Location (Simulated)</option>
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-white/50">▼</div>
          </div>
        </div>

        {/* Cuisine */}
        <div className="relative group">
          <label className={labelClass}>
            <Heart size={12} /> Cuisine
          </label>
          <div className="relative">
             <select 
              value={filters.cuisine}
              onChange={(e) => onChange('cuisine', e.target.value)}
              disabled={disabled}
              className={selectClass}
            >
              {CUISINES.map(c => (
                <option key={c} value={c} className="bg-utah-dark">{c}</option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-white/50">▼</div>
          </div>
        </div>

        {/* Price */}
        <div className="relative group">
          <label className={labelClass}>
            <DollarSign size={12} /> Budget
          </label>
           <div className="relative">
            <select 
              value={filters.price}
              onChange={(e) => onChange('price', e.target.value)}
              disabled={disabled}
              className={selectClass}
            >
              {PRICES.map(p => (
                <option key={p} value={p} className="bg-utah-dark">{p}</option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-white/50">▼</div>
           </div>
        </div>

         {/* Vibe */}
         <div className="relative group">
          <label className={labelClass}>
            <StarIcon size={12} /> Vibe
          </label>
           <div className="relative">
            <select 
              value={filters.vibe}
              onChange={(e) => onChange('vibe', e.target.value)}
              disabled={disabled}
              className={selectClass}
            >
              {VIBES.map(v => (
                <option key={v} value={v} className="bg-utah-dark">{v}</option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-white/50">▼</div>
           </div>
        </div>

      </div>
    </div>
  );
};

// Helper Icon
const StarIcon = ({ size }: { size: number }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
  </svg>
);

export default FilterControls;
