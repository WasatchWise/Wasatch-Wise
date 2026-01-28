import React from 'react';
import { SparklesIcon } from './icons/SparklesIcon';
import { VibeTokenIcon } from './icons/VibeTokenIcon';
// Removed EmbraceIcon import

interface AppHeaderProps {
  vibeTokens: number;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ vibeTokens }) => {
  return (
    <header className="bg-slate-900/70 backdrop-blur-md shadow-2xl p-4 sm:p-6 sticky top-0 z-50">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center">
          <SparklesIcon className="w-10 h-10 sm:w-12 sm:h-12 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500 mr-2 animate-pulse" />
          {/* EmbraceIcon removed from here */}
          <h1 className="text-xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-orange-400">
            DAiTE
          </h1>
        </div>
        <div className="flex items-center bg-slate-800/50 border border-slate-700 px-3 py-1.5 rounded-lg shadow-md">
          <VibeTokenIcon className="w-5 h-5 text-yellow-400 mr-2" />
          <span className="text-sm font-semibold text-slate-200">
            {vibeTokens} Vibe Token{vibeTokens !== 1 ? 's' : ''}
          </span>
        </div>
      </div>
    </header>
  );
};