import React from 'react';

// Context Providers
import { TokenProvider } from './contexts/TokenContext';
import { UserProvider } from './contexts/UserContext';
import { ProfileProvider } from './contexts/ProfileContext';
import { CyrainoAIProvider } from './contexts/CyrainoAIContext';
import { ChatProvider } from './contexts/ChatContext';
import { DatePlanningProvider } from './contexts/DatePlanningContext';

// Layout and Views
import Header from './components/layout/Header';
import DiscoverView from './components/discover/DiscoverView';
import MatchesView from './components/matches/MatchesView';
import ChatView from './components/chat/ChatView';
import TokenEconomyView from './components/tokens/TokenEconomyView';
import DatePlanningModal from './components/modal/DatePlanningModal';

// Hooks
import { useAppNavigation } from './hooks/useAppNavigation';

const App: React.FC = () => {
  const { currentView, setCurrentView } = useAppNavigation('discover');

  return (
    <TokenProvider>
      <UserProvider>
        <ProfileProvider>
          <CyrainoAIProvider> {/* Placed here as ChatProvider might use it */}
            <ChatProvider>    {/* ChatProvider needs CyrainoAIProvider for suggestions */}
              <DatePlanningProvider> {/* DatePlanningProvider needs Token and User context */}
                <div className="min-h-screen bg-gray-100 flex flex-col">
                  <Header
                    currentView={currentView}
                    setCurrentView={setCurrentView}
                  />
                  <main className="flex-grow">
                    {currentView === 'discover' && <DiscoverView />}
                    {currentView === 'matches' && <MatchesView />}
                    {currentView === 'chat' && <ChatView />}
                    {currentView === 'tokens' && <TokenEconomyView />}
                  </main>
                  <DatePlanningModal />
                </div>
              </DatePlanningProvider>
            </ChatProvider>
          </CyrainoAIProvider>
        </ProfileProvider>
      </UserProvider>
    </TokenProvider>
  );
};

export default App;
