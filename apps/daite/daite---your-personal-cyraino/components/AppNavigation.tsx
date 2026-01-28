
import React from 'react';
import { UserCircleIcon } from './icons/UserCircleIcon';
import { UsersIcon } from './icons/UsersIcon';
import { HeartPulseIcon } from './icons/HeartPulseIcon'; 
import { EyeIcon } from './icons/EyeIcon';
import { ChatBubbleOvalLeftEllipsisIcon } from './icons/ChatBubbleOvalLeftEllipsisIcon';
// Removed BookOpenIcon import

export type View = 'profile' | 'agentChat' | 'discover' | 'matches' | 'visualCalibration'; // Removed 'journal'

interface AppNavigationProps {
  currentView: View;
  setCurrentView: (view: View) => void;
}

const NavButton: React.FC<{
  label: string;
  isActive: boolean;
  onClick: () => void;
  icon: React.ReactNode;
}> = ({ label, isActive, onClick, icon }) => (
  <button
    onClick={onClick}
    className={`flex items-center justify-center flex-1 sm:flex-initial px-2 py-2 sm:px-4 sm:py-3 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 ease-in-out
      ${isActive 
        ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg scale-105' 
        : 'bg-slate-700/50 hover:bg-slate-600/70 text-slate-300 hover:text-white'
      }`}
    aria-current={isActive ? 'page' : undefined}
  >
    {icon}
    <span className="ml-1 sm:ml-2">{label}</span>
  </button>
);

export const AppNavigation: React.FC<AppNavigationProps> = ({ currentView, setCurrentView }) => {
  const navTopClass = "top-[calc(var(--header-height-sm)_+_0.5rem)] sm:top-[calc(var(--header-height-lg)_+_0.5rem)]";

  return (
    <nav className={`bg-slate-800/80 backdrop-blur-md shadow-lg sticky ${navTopClass} z-40 mb-6 mx-auto max-w-fit rounded-xl`}>
      <div className="container mx-auto px-1 sm:px-2 py-1.5 sm:py-2">
        <div className="flex flex-wrap justify-center items-center gap-1 sm:gap-1.5">
          <NavButton
            label="Profile Details"
            isActive={currentView === 'profile'}
            onClick={() => setCurrentView('profile')}
            icon={<UserCircleIcon className="w-4 h-4 sm:w-5 sm:h-5" />}
          />
          <NavButton
            label="Chat with CYRAiNO"
            isActive={currentView === 'agentChat'}
            onClick={() => setCurrentView('agentChat')}
            icon={<ChatBubbleOvalLeftEllipsisIcon className="w-4 h-4 sm:w-5 sm:h-5" />}
          />
           {/* Removed Journal NavButton */}
          <NavButton
            label="Visual DNA"
            isActive={currentView === 'visualCalibration'}
            onClick={() => setCurrentView('visualCalibration')}
            icon={<EyeIcon className="w-4 h-4 sm:w-5 sm:h-5" />}
          />
          <NavButton
            label="Discover"
            isActive={currentView === 'discover'}
            onClick={() => setCurrentView('discover')}
            icon={<UsersIcon className="w-4 h-4 sm:w-5 sm:h-5" />}
          />
          <NavButton
            label="Matches"
            isActive={currentView === 'matches'}
            onClick={() => setCurrentView('matches')}
            icon={<HeartPulseIcon className="w-4 h-4 sm:w-5 sm:h-5" />}
          />
        </div>
      </div>
    </nav>
  );
};