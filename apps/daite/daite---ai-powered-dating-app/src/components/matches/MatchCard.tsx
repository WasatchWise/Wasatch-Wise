import React from 'react';
import { MessageCircle, Calendar } from 'lucide-react';
import { ProfileType } from '../../types';

interface MatchCardProps {
  match: ProfileType;
  onChat: (profile: ProfileType) => void;
  onPlanDate: (profile: ProfileType) => void;
}

const MatchCard: React.FC<MatchCardProps> = ({ match, onChat, onPlanDate }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden transform transition-all hover:shadow-xl duration-300">
      <img src={match.image} alt={match.name} className="w-full h-64 object-cover" />
      <div className="p-5">
        <h3 className="text-xl font-bold text-gray-800 mb-1">{match.name}, {match.age}</h3>
        <p className="text-gray-600 text-sm mb-4">{match.location}</p>
        <div className="flex space-x-2">
          <button
            onClick={() => onChat(match)}
            className="flex-1 bg-pink-500 text-white py-2.5 px-4 rounded-lg hover:bg-pink-600 transition-colors flex items-center justify-center font-semibold"
            aria-label={`Chat with ${match.name}`}
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Chat
          </button>
          <button
            onClick={() => onPlanDate(match)}
            className="flex-1 bg-purple-500 text-white py-2.5 px-4 rounded-lg hover:bg-purple-600 transition-colors flex items-center justify-center font-semibold"
            aria-label={`Plan date with ${match.name}`}
          >
            <Calendar className="w-4 h-4 mr-2" />
            Plan Date
          </button>
        </div>
      </div>
    </div>
  );
};

export default MatchCard;