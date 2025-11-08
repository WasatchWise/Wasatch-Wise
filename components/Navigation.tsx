import React from 'react';

interface NavigationProps {
  currentPage: 'home' | 'about';
  onNavigate: (page: 'home' | 'about') => void;
  onShowHelp?: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({ currentPage, onNavigate, onShowHelp }) => {
  return (
    <nav className="bg-white border-b border-surface-tertiary shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <span className="text-2xl">🤝</span>
            <h1 className="text-xl font-bold text-secure-slate font-display">
              The Help List
            </h1>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center space-x-6">
            <button
              onClick={() => onNavigate('home')}
              className={`text-sm font-medium transition-colors duration-200 ${
                currentPage === 'home'
                  ? 'text-dignity-purple border-b-2 border-dignity-purple'
                  : 'text-gray-600 hover:text-dignity-purple'
              }`}
            >
              Help List
            </button>
            <button
              onClick={() => onNavigate('about')}
              className={`text-sm font-medium transition-colors duration-200 ${
                currentPage === 'about'
                  ? 'text-dignity-purple border-b-2 border-dignity-purple'
                  : 'text-gray-600 hover:text-dignity-purple'
              }`}
            >
              About
            </button>
            {onShowHelp && (
              <button
                onClick={onShowHelp}
                className="text-sm font-medium text-gray-600 hover:text-dignity-purple transition-colors duration-200"
                title="Show quick start guide"
              >
                ?
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
