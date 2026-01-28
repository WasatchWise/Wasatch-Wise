import React from 'react';
import { Heart } from 'lucide-react';
import { useProfilesContext } from '../../contexts/ProfileContext';
import { useChat } from '../../contexts/ChatContext';
import { useDatePlanning } from '../../contexts/DatePlanningContext';
import MatchCard from './MatchCard';
import { ViewType } from '../../types'; // Needed for setCurrentView
import { useAppNavigation } from '../../hooks/useAppNavigation'; // Needed for setCurrentView

interface MatchesViewProps {
  // Props like startChatHandler and planDateHandler will now come from context
  // setCurrentView is still needed for navigation triggered from ChatView's back button,
  // but if MatchesView itself needs to navigate, it should use useAppNavigation.
  // For now, it receives handlers for actions it initiates.
}

const MatchesView: React.FC<MatchesViewProps> = () => {
  const { matches } = useProfilesContext();
  const { startChatHandler: contextStartChatHandler } = useChat();
  const { planDateHandler: contextPlanDateHandler } = useDatePlanning();
  const { setCurrentView } = useAppNavigation(); // Assuming navigation might be needed

  const handleStartChat = (profile) => {
    contextStartChatHandler(profile);
    setCurrentView('chat');
  };
  
  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-8">Your Matches</h1>
      
      {matches.length === 0 ? (
        <div className="text-center py-20 px-6 bg-white rounded-xl shadow-md">
          <Heart className="w-24 h-24 text-pink-300 mx-auto mb-6" />
          <h3 className="text-2xl font-semibold text-gray-700 mb-3">No Matches Yet</h3>
          <p className="text-gray-500 max-w-md mx-auto">
            Looks like your dance card is empty for now. Head over to the Discover section to find some potential partners!
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {matches.map(match => (
            <MatchCard
              key={match.id}
              match={match}
              onChat={handleStartChat}
              onPlanDate={contextPlanDateHandler} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default MatchesView;