import React, { useEffect, useState, useRef } from 'react';
import { SlotState, RestaurantResult } from '../types';
import { SPINNER_ITEMS } from '../constants';
import { MapPin, Star, Navigation } from 'lucide-react';

interface SlotMachineProps {
  state: SlotState;
  winner: RestaurantResult | null;
  errorMessage?: string | null;
  onPull: () => void;
}

const SlotMachine: React.FC<SlotMachineProps> = ({ state, winner, errorMessage, onPull }) => {
  const [displayItem, setDisplayItem] = useState(SPINNER_ITEMS[0]);
  const spinIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Handle Spinning Logic
  useEffect(() => {
    if (state === SlotState.SPINNING) {
      // Fast cycle through items
      let index = 0;
      spinIntervalRef.current = setInterval(() => {
        index = (index + 1) % SPINNER_ITEMS.length;
        setDisplayItem(SPINNER_ITEMS[index]);
      }, 100);
    } else if (state === SlotState.WINNER && winner) {
      if (spinIntervalRef.current) clearInterval(spinIntervalRef.current);
      // Ensure we display the winner
    } else if (state === SlotState.IDLE) {
      if (spinIntervalRef.current) clearInterval(spinIntervalRef.current);
      setDisplayItem("🎰 PULL TO SPIN 🎰");
    }

    return () => {
      if (spinIntervalRef.current) clearInterval(spinIntervalRef.current);
    };
  }, [state, winner]);

  return (
    <div className="relative w-full max-w-2xl mx-auto perspective-1000">
      
      {/* Machine Top Ornament */}
      <div className="bg-utah-red h-12 w-3/4 mx-auto rounded-t-2xl border-4 border-b-0 border-yellow-500 relative flex items-center justify-center shadow-lg z-10">
        <div className="text-yellow-400 font-display text-2xl tracking-widest uppercase drop-shadow-md">
           Zion Slots
        </div>
      </div>

      {/* Main Machine Body */}
      <div className="metallic-frame p-6 rounded-3xl border-8 border-utah-dark relative shadow-2xl">
        
        {/* Screen Bezel */}
        <div className="bg-utah-dark p-4 rounded-xl shadow-inner border-4 border-gray-700">
          
          {/* The Reel Window */}
          <div className="bg-white h-64 rounded-lg overflow-hidden relative shadow-[inset_0_0_40px_rgba(0,0,0,0.5)] flex items-center justify-center">
            
            {/* Spinning Content */}
            {state === SlotState.SPINNING && (
              <div className="text-4xl md:text-6xl font-bold text-gray-800 animate-pulse text-center">
                 <div className="animate-bounce">
                  {displayItem}
                 </div>
              </div>
            )}

            {/* Idle Content */}
            {state === SlotState.IDLE && (
              <div className="text-center text-gray-400">
                <p className="text-4xl md:text-5xl font-display text-utah-orange animate-pulse">
                  READY?
                </p>
                <p className="mt-2 text-sm uppercase tracking-wide">Set filters & pull lever</p>
              </div>
            )}

            {/* Winner Content */}
            {state === SlotState.WINNER && winner && (
              <div className="flex flex-col items-center justify-center p-6 text-center w-full h-full bg-yellow-50 animate-[fadeIn_0.5s_ease-out]">
                <div className="mb-2">
                    <Star className="w-8 h-8 text-yellow-500 fill-yellow-500 animate-spin-slow inline-block" />
                </div>
                <h2 className="text-3xl md:text-5xl font-display text-utah-red mb-2 leading-tight drop-shadow-sm">
                  {winner.name}
                </h2>
                
                {winner.mapLink && (
                  <a 
                    href={winner.mapLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-utah-sky hover:text-blue-700 hover:underline mt-2 font-semibold transition-colors bg-white px-4 py-1 rounded-full shadow-sm border border-gray-100"
                  >
                    <MapPin size={18} />
                    View on Google Maps
                  </a>
                )}
              </div>
            )}

             {/* Error Content */}
             {state === SlotState.ERROR && (
              <div className="text-center text-red-500 px-4">
                <p className="text-2xl font-bold mb-2">Tilt!</p>
                <p className="text-sm md:text-base">
                  {errorMessage || "Something went wrong. Try spinning again."}
                </p>
              </div>
            )}

            {/* Shine Overlay for Glass Effect */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent pointer-events-none rounded-lg"></div>
          </div>
        </div>

        {/* Decorative Lights */}
        <div className="flex justify-between mt-4 px-8">
           <div className={`w-4 h-4 rounded-full border border-black shadow-md ${state === SlotState.SPINNING ? 'bg-yellow-400 animate-ping' : 'bg-red-900'}`}></div>
           <div className={`w-4 h-4 rounded-full border border-black shadow-md ${state === SlotState.SPINNING ? 'bg-yellow-400 animate-ping delay-75' : 'bg-red-900'}`}></div>
           <div className={`w-4 h-4 rounded-full border border-black shadow-md ${state === SlotState.SPINNING ? 'bg-yellow-400 animate-ping delay-150' : 'bg-red-900'}`}></div>
        </div>

      </div>

      {/* The Lever */}
      <button
        type="button"
        onClick={onPull}
        disabled={state === SlotState.SPINNING}
        className="absolute top-1/2 -right-12 md:-right-24 transform -translate-y-1/2 h-48 w-8 md:w-12 bg-gray-300 rounded-r-lg border-l border-gray-400 shadow-xl flex flex-col items-center cursor-pointer disabled:opacity-80 disabled:cursor-not-allowed"
        aria-label="Pull the lever"
      >
         {/* Lever Base */}
         <div className="w-12 h-12 bg-gray-400 rounded-full absolute -left-6 top-1/2 transform -translate-y-1/2 border-4 border-gray-500 shadow-inner"></div>
         
         {/* Lever Arm & Handle */}
         <div
           className={`
                group absolute top-1/2 left-1/2 w-4 h-32 md:h-48 bg-gradient-to-b from-gray-300 to-gray-500 origin-bottom rounded-t-full shadow-lg transition-transform duration-500 ease-in-out
                ${state === SlotState.SPINNING ? 'rotate-[150deg]' : 'group-hover:scale-105 group-active:rotate-[150deg]'}
            `}
           style={{ transformOrigin: '50% 100%' }}
         >
           <div className="absolute -top-8 -left-4 md:-left-6 w-12 h-12 md:w-16 md:h-16 bg-utah-red rounded-full shadow-[inset_-4px_-4px_10px_rgba(0,0,0,0.5)] border-2 border-red-900 group-hover:brightness-110 flex items-center justify-center">
             <span className="text-[10px] md:text-xs font-bold text-red-900 uppercase">Pull</span>
           </div>
         </div>
      </button>

      {/* Description Panel (Appears after win) */}
      {state === SlotState.WINNER && winner && (
        <div className="mt-8 bg-utah-dark/90 backdrop-blur p-6 rounded-xl border border-utah-orange shadow-lg text-white max-w-xl mx-auto transform animate-[slideUp_0.5s_ease-out]">
          <h3 className="text-utah-sand font-display text-xl mb-2 flex items-center gap-2">
            <Navigation className="w-5 h-5" />
            Why this spot?
          </h3>
          <p className="leading-relaxed text-gray-200">
            {winner.description}
          </p>
          <div className="mt-4 text-xs text-gray-400 border-t border-gray-700 pt-2 flex justify-between items-center">
             <span>Powered by Google Gemini</span>
             {winner.sourceChunks && winner.sourceChunks.length > 0 && (
               <span className="flex items-center gap-1">
                 <img src="https://www.google.com/images/branding/product/1x/maps_64dp.png" alt="Maps" className="w-4 h-4"/>
                 Data from Google Maps
               </span>
             )}
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <div className="text-center mt-12 text-xs text-gray-500 opacity-60">
        <p>Utah Specific • Dining Decider • Fun for Groups</p>
      </div>

    </div>
  );
};

export default SlotMachine;