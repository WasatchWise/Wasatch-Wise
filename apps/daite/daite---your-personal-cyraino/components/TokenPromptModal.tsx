
import React from 'react';
import { XMarkIcon } from './icons/XMarkIcon';
import { VibeTokenIcon } from './icons/VibeTokenIcon'; 
import { SparklesIcon } from './icons/SparklesIcon';

interface TokenPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGrantToken: () => void;
}

export const TokenPromptModal: React.FC<TokenPromptModalProps> = ({ isOpen, onClose, onGrantToken }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 z-[100]"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="token-prompt-title"
    >
      <div 
        className="bg-gradient-to-br from-slate-800 via-purple-900/30 to-slate-800 rounded-xl shadow-2xl border border-purple-700/50 p-6 sm:p-8 max-w-md w-full relative text-center"
        onClick={(e) => e.stopPropagation()} 
      >
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 transition-colors"
          aria-label="Close token prompt"
        >
          <XMarkIcon className="w-7 h-7" />
        </button>

        <VibeTokenIcon className="w-16 h-16 text-yellow-400 mx-auto mb-4 animate-pulse" />

        <h2 id="token-prompt-title" className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500 mb-3">
          Vibe Check Costs a Token!
        </h2>
        
        <p className="text-slate-300 mb-6 text-sm">
          To send your Personal CYRAiNO for a "Vibe Check" with another CYRAiNO and unlock personalized interactions, one Vibe Token is required. This helps create those magical moments!
        </p>

        <div className="space-y-3">
          <button
            onClick={onGrantToken}
            className="w-full flex items-center justify-center bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-pink-400 focus:ring-opacity-50"
          >
            <SparklesIcon className="w-5 h-5 mr-2" />
            Get 1 Free Demo Token
          </button>
          <button
            onClick={onClose}
            className="w-full bg-slate-700 hover:bg-slate-600 text-slate-300 font-medium py-2.5 px-6 rounded-lg transition-colors"
          >
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  );
};