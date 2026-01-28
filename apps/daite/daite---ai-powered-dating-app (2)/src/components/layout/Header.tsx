import React from 'react';
import { Heart, Eye, Coins } from 'lucide-react';
import { ViewType } from '../../types';
import { useTokens } from '../../contexts/TokenContext';
import { useProfilesContext } from '../../contexts/ProfileContext';


interface HeaderProps {
  currentView: ViewType;
  setCurrentView: (view: ViewType) => void;
}

const Header: React.FC<HeaderProps> = ({ currentView, setCurrentView }) => {
  const { tokens } = useTokens();
  const { matches } = useProfilesContext();
  const matchesCount = matches.length;

  const navItems = [
    { view: 'discover' as ViewType, label: 'Discover', icon: Eye },
    { view: 'matches' as ViewType, label: 'Matches', icon: Heart, badge: matchesCount > 0 ? matchesCount : undefined },
    { view: 'tokens' as ViewType, label: `${tokens} Tokens`, icon: Coins },
  ];

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-40">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center space-x-2">
              <div className="w-10 h-10 bg-pink-500 rounded-full flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-800">DAiTE</span>
            </div>
            <p className="ml-3 text-sm text-pink-600 font-medium hidden sm:block">Helping Humans Embrace</p>
          </div>
          
          <div className="hidden sm:ml-6 sm:flex sm:space-x-4">
            {navItems.map(item => (
              <button
                key={item.view}
                onClick={() => setCurrentView(item.view)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentView === item.view
                    ? 'bg-pink-100 text-pink-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
                }`}
                aria-current={currentView === item.view ? 'page' : undefined}
              >
                <item.icon className={`w-5 h-5 ${currentView === item.view ? 'text-pink-600' : 'text-gray-500'}`} />
                <span>{item.label}</span>
                {item.badge !== undefined && (
                  <span className="ml-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-pink-100 bg-pink-500 rounded-full">
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </nav>
       {/* Mobile navigation */}
      <div className="sm:hidden flex justify-around p-2 border-t">
        {navItems.map(item => (
            <button
            key={`${item.view}-mobile`}
            onClick={() => setCurrentView(item.view)}
            className={`flex flex-col items-center p-2 rounded-md text-xs font-medium transition-colors w-1/3 ${
                currentView === item.view
                ? 'text-pink-700'
                : 'text-gray-600 hover:text-gray-800'
            }`}
            >
            <item.icon className={`w-6 h-6 mb-1 ${currentView === item.view ? 'text-pink-600' : 'text-gray-500'}`} />
            <span>{item.view === 'tokens' ? `${tokens} Tokens` : item.label}</span>
             {item.view === 'matches' && item.badge !== undefined && (
                <span className="absolute top-0 right-0 -mt-1 -mr-1 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-pink-100 bg-pink-500 rounded-full">
                {item.badge}
                </span>
            )}
            </button>
        ))}
      </div>
    </header>
  );
};

export default Header;