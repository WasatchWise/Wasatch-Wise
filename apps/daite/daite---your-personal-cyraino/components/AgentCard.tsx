
import React from 'react';
import { DAgentProfile } from '../types';
import { HeartIcon } from './icons/HeartIcon';
import { BeakerIcon } from './icons/BeakerIcon';
import { ChatBubbleLeftRightIcon } from './icons/ChatBubbleLeftRightIcon'; 

const getCompatibilityColor = (score?: number): string => {
  if (score === undefined) return 'bg-slate-600';
  if (score >= 70) return 'bg-green-500';
  if (score >= 40) return 'bg-yellow-500';
  return 'bg-red-500';
};

interface AgentCardProps {
  agent: DAgentProfile;
  onConnect: () => void;
  isAlreadyConnected: boolean;
}

export const AgentCard: React.FC<AgentCardProps> = ({ agent, onConnect, isAlreadyConnected }) => {
  return (
    <div className="bg-slate-800/60 backdrop-blur-md rounded-xl shadow-2xl border border-slate-700 overflow-hidden transition-all duration-300 hover:shadow-purple-500/30 hover:border-purple-600/70 flex flex-col">
      {agent.profileImage && (
        <img 
          src={agent.profileImage} 
          alt={`${agent.agentName}'s profile`} 
          className="w-full h-48 object-cover" 
          onError={(e) => (e.currentTarget.src = 'https://source.unsplash.com/random/400x400/?abstract')}
        />
      )}
      <div className="p-5 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
            {agent.agentName}
          </h3>
          {agent.compatibilityScore !== undefined && (
            <div className="flex items-center">
              <div 
                className={`w-3 h-3 rounded-full mr-2 ${getCompatibilityColor(agent.compatibilityScore)}`}
                title={`Compatibility: ${agent.compatibilityScore}%`}
              ></div>
              <span className="text-sm font-semibold text-slate-300">{agent.compatibilityScore}%</span>
            </div>
          )}
        </div>
        <p className="text-xs text-purple-400 mb-2 uppercase tracking-wider">{agent.agentPersonaType}</p>
        
        <p className="text-sm text-slate-300 mb-4 line-clamp-3 flex-grow min-h-[60px]">
          {agent.personaBackstory}
        </p>

        <div className="space-y-3 mt-auto">
          {agent.hobbiesInterests.length > 0 && (
             <div className="flex items-center text-sm text-slate-400">
                <BeakerIcon className="w-4 h-4 mr-2 text-sky-400 flex-shrink-0" />
                <span className="line-clamp-1">Interests: {agent.hobbiesInterests.slice(0, 2).join(', ')}{agent.hobbiesInterests.length > 2 ? '...' : ''}</span>
            </div>
          )}
          <div className="flex items-center text-sm text-slate-400">
            <HeartIcon className="w-4 h-4 mr-2 text-pink-400 flex-shrink-0" />
            <span>Seeking: {agent.relationshipGoal}</span>
          </div>
        </div>
        
        <button 
            className={`mt-6 w-full flex items-center justify-center font-semibold py-2.5 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-opacity-50 
              ${isAlreadyConnected 
                ? 'bg-slate-600 text-slate-400 cursor-default focus:ring-slate-500' 
                : 'bg-gradient-to-r from-pink-500/80 to-purple-600/80 hover:from-pink-500 hover:to-purple-600 text-white focus:ring-pink-400'
              }`}
            onClick={isAlreadyConnected ? undefined : onConnect}
            aria-label={isAlreadyConnected ? `Interaction viewed with ${agent.agentName}` : `Run Vibe Check with ${agent.agentName}`}
            disabled={isAlreadyConnected}
        >
            <ChatBubbleLeftRightIcon className="w-5 h-5 mr-2" />
            {isAlreadyConnected ? 'Interaction Viewed' : `Run Vibe Check`}
        </button>
      </div>
    </div>
  );
};
