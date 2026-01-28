import React, { useState, useCallback } from 'react';
import FilterControls from './components/FilterControls';
import SlotMachine from './components/SlotMachine';
import { FilterState, SlotState, RestaurantResult } from './types';
import { getRestaurantRecommendation, RecommendationApiError } from './services/geminiService';
import { UT_CITIES } from './constants';

const App: React.FC = () => {
  const [filters, setFilters] = useState<FilterState>({
    cuisine: 'Anything',
    price: 'Any Price',
    location: UT_CITIES[0],
    vibe: 'No Preference'
  });

  const [slotState, setSlotState] = useState<SlotState>(SlotState.IDLE);
  const [winner, setWinner] = useState<RestaurantResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handlePullLever = useCallback(() => {
    if (slotState === SlotState.SPINNING) return;

    // Reset UI
    setSlotState(SlotState.SPINNING);
    setWinner(null);
    setErrorMessage(null);

    // Kick off async work separately so the SPINNING state renders immediately.
    (async () => {
      try {
        // Minimum spin time for effect (2.5 seconds)
        const minSpinTime = new Promise((resolve) => setTimeout(resolve, 2500));

        // Fetch data, but always wait at least the minimum spin time so the reel animates.
        let result: RestaurantResult;
        try {
          result = await getRestaurantRecommendation(filters);
        } finally {
          await minSpinTime;
        }

        setWinner(result);
        setSlotState(SlotState.WINNER);
      } catch (error) {
        console.error("Spin error:", error);
        if (error instanceof RecommendationApiError) {
          if (error.code === 'MISSING_GEMINI_API_KEY') {
            setErrorMessage('Missing GEMINI_API_KEY. Copy env.local.example to .env.local and set GEMINI_API_KEY.');
          } else {
            setErrorMessage(error.message);
          }
        } else if (error instanceof Error) {
          setErrorMessage(error.message);
        } else {
          setErrorMessage('Something went wrong.');
        }
        setSlotState(SlotState.ERROR);
      }
    })();
  }, [filters, slotState]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-utah-dark via-[#4a2c2f] to-utah-dark flex flex-col items-center py-8 px-4 font-sans text-white overflow-x-hidden">
      
      {/* Background patterns */}
      <div className="fixed inset-0 opacity-5 pointer-events-none" style={{ 
        backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
        backgroundSize: '40px 40px' 
      }}></div>

      <header className="mb-8 text-center z-10">
        <div className="inline-block px-4 py-1 rounded-full bg-utah-orange/20 border border-utah-orange/30 text-utah-orange text-xs font-bold tracking-widest uppercase mb-3">
          The Utah Dining Decider
        </div>
        <h1 className="text-4xl md:text-6xl font-display text-transparent bg-clip-text bg-gradient-to-r from-utah-sand to-white drop-shadow-md">
          Munchy Slots
        </h1>
        <p className="text-gray-400 mt-2 max-w-md mx-auto">
          Can't decide? Let the machine choose your next meal.
        </p>
      </header>

      <main className="w-full max-w-5xl z-10 flex flex-col items-center">
        
        <FilterControls 
          filters={filters} 
          onChange={handleFilterChange} 
          disabled={slotState === SlotState.SPINNING}
        />

        <div className="w-full mt-8 md:mt-0">
          <SlotMachine 
            state={slotState} 
            winner={winner} 
            errorMessage={errorMessage}
            onPull={handlePullLever} 
          />
        </div>

      </main>
      
      <footer className="mt-16 text-center text-white/20 text-sm z-10 pb-4">
        &copy; {new Date().getFullYear()} Munchy Slots. 
        <br/>
        <span className="text-xs">
          Recommendations powered by Google Gemini 2.5 Flash & Google Maps Grounding.
        </span>
      </footer>

    </div>
  );
};

export default App;
