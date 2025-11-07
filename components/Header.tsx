import React from 'react';

interface HeaderProps {
  activeView: 'needHelp' | 'offerHelp';
  setActiveView: (view: 'needHelp' | 'offerHelp') => void;
}

export const Header: React.FC<HeaderProps> = ({ activeView, setActiveView }) => {
  const baseButtonClasses = 'px-4 py-2 rounded-lg font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-dignity-purple text-sm sm:text-base';
  const activeButtonClasses = 'bg-dignity-purple text-white shadow-lg';
  const inactiveButtonClasses = 'bg-transparent text-dignity-purple hover:bg-surface-private';

  return (
    <header className="bg-surface-primary shadow-sm sticky top-0 z-10 border-b border-surface-tertiary">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row justify-between items-center">
        <div className="flex items-center">
            <span className="text-3xl mr-2" role="img" aria-label="raising hands emoji">🙌</span>
            <h1 className="text-3xl font-bold font-display text-secure-slate tracking-tight">
            The <span className="text-sanctuary-green">Help List</span>
            </h1>
        </div>
        <nav className="mt-4 sm:mt-0 bg-surface-tertiary p-1 rounded-xl">
          <button
            onClick={() => setActiveView('needHelp')}
            className={`${baseButtonClasses} ${activeView === 'needHelp' ? activeButtonClasses : inactiveButtonClasses}`}
          >
            I Need Help
          </button>
          <button
            onClick={() => setActiveView('offerHelp')}
            className={`${baseButtonClasses} ${activeView === 'offerHelp' ? activeButtonClasses : inactiveButtonClasses}`}
          >
            I Want to Help
          </button>
        </nav>
      </div>
    </header>
  );
};