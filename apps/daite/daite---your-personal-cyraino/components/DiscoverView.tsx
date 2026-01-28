
import React from 'react';
// Fix: Update props to match those passed by App.tsx for the new discover flow
import { DAgentProfile, MatchRecord, AgentInteraction } from '../types';
import { MagnifyingGlassIcon } from './icons/MagnifyingGlassIcon';
import { LoadingSpinner } from './LoadingSpinner';
import { ErrorDisplay } from './ErrorDisplay';
import { SparklesIcon } from './icons/SparklesIcon';
import { ChatBubbleLeftRightIcon } from './icons/ChatBubbleLeftRightIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { NoSymbolIcon } from './icons/NoSymbolIcon'; // Using NoSymbolIcon for decline
import { EyeIcon } from './icons/EyeIcon'; // For "View Vibe Check"
import { HeartIcon } from './icons/HeartIcon';
import { BeakerIcon } from './icons/BeakerIcon';


// Fix: Updated DiscoverViewProps to match the props passed from App.tsx for the new discover flow
interface DiscoverViewProps {
  userProfile: DAgentProfile; // User's own CYRAiNO profile
  discoveredPotentialMatches: MatchRecord[];
  isDiscovering: boolean; // True when handleRunGlobalVibeCheck is in progress
  error: string | null;   // Error from discover process or no matches message
  onRunGlobalVibeCheck: () => void;
  onAcceptMatch: (matchToAccept: MatchRecord) => void;
  onDeclineMatch: (matchIdToDecline: string) => void;
  onViewInteraction: (interaction: AgentInteraction) => void; // To show the AgentInteractionModal
}

// Helper to get color based on match potential
const getPotentialColor = (score?: number): string => {
  if (score === undefined) return 'bg-slate-600';
  if (score >= 70) return 'text-green-400';
  if (score >= 40) return 'text-yellow-400';
  return 'text-red-400';
};
const getPotentialBgColor = (score?: number): string => {
  if (score === undefined) return 'bg-slate-700';
  if (score >= 70) return 'bg-green-500/30';
  if (score >= 40) return 'bg-yellow-500/30';
  return 'bg-red-500/30';
};


// Fix: Define a new component locally for displaying individual discovered matches,
// as per the requirement not to add new files.
const DiscoveredMatchCard: React.FC<{
  match: MatchRecord;
  onAccept: () => void;
  onDecline: () => void;
  onViewDetails: () => void;
}> = ({ match, onAccept, onDecline, onViewDetails }) => {
  const { agentTwo, interactionDetails } = match;

  return (
    <div className="bg-slate-800/60 backdrop-blur-md rounded-xl shadow-2xl border border-slate-700 overflow-hidden transition-all duration-300 hover:shadow-purple-500/30 hover:border-purple-600/70 flex flex-col">
      {agentTwo.profileImage && (
        <img
          src={agentTwo.profileImage}
          alt={`${agentTwo.agentName}'s profile`}
          className="w-full h-48 object-cover"
          onError={(e) => (e.currentTarget.src = 'https://source.unsplash.com/random/400x400/?abstract,vibrant')}
        />
      )}
      <div className="p-5 flex flex-col flex-grow">
        <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500 mb-1">
          {agentTwo.agentName}
        </h3>
        <p className="text-xs text-purple-400 mb-2 uppercase tracking-wider">{agentTwo.agentPersonaType}</p>
        
        <div className={`mb-3 p-2 rounded-md border text-sm ${getPotentialBgColor(interactionDetails.matchPotential)} ${getPotentialColor(interactionDetails.matchPotential).replace('text-', 'border-')}`}>
          <p className="font-semibold">Vibe Check Score: <span className={`font-bold ${getPotentialColor(interactionDetails.matchPotential)}`}>{interactionDetails.matchPotential}%</span></p>
          {interactionDetails.summary && <p className="mt-1 text-slate-300 line-clamp-2">Summary: "{interactionDetails.summary}"</p>}
        </div>

        {interactionDetails.blindDatePitch && (
          <div className="mb-3 p-2 bg-sky-800/30 border border-sky-700/50 rounded-md text-xs italic text-sky-300">
             <p className="font-semibold not-italic text-sky-200 mb-0.5">Agents' Blind Date Pitch:</p>
             "{interactionDetails.blindDatePitch}"
          </div>
        )}

        <div className="space-y-2 mt-auto">
           <button
            onClick={onViewDetails}
            className="w-full flex items-center justify-center font-semibold py-2 px-4 rounded-lg shadow-md transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-opacity-50 bg-slate-600/50 hover:bg-slate-500/70 text-slate-200 hover:text-white focus:ring-slate-400 text-sm"
          >
            <EyeIcon className="w-5 h-5 mr-2" />
            View Vibe Check Details
          </button>
          <div className="flex space-x-2">
            <button
              onClick={onAccept}
              className="flex-1 flex items-center justify-center font-semibold py-2 px-4 rounded-lg shadow-md transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-opacity-50 bg-gradient-to-r from-green-500/80 to-teal-600/80 hover:from-green-500 hover:to-teal-600 text-white focus:ring-green-400 text-sm"
            >
              <CheckCircleIcon className="w-5 h-5 mr-2" />
              Accept Match
            </button>
            <button
              onClick={onDecline}
              className="flex-1 flex items-center justify-center font-semibold py-2 px-4 rounded-lg shadow-md transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-opacity-50 bg-gradient-to-r from-red-500/70 to-pink-600/70 hover:from-red-500 hover:to-pink-600 text-white focus:ring-red-400 text-sm"
            >
              <NoSymbolIcon className="w-5 h-5 mr-2" />
              Decline
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};


export const DiscoverView: React.FC<DiscoverViewProps> = ({
  userProfile,
  discoveredPotentialMatches,
  isDiscovering,
  error,
  onRunGlobalVibeCheck,
  onAcceptMatch,
  onDeclineMatch,
  onViewInteraction,
}) => {
  return (
    <div className="max-w-5xl mx-auto">
      <h2 className="flex items-center text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-cyan-300 mb-8">
        <MagnifyingGlassIcon className="w-8 h-8 mr-3 text-cyan-400" />
        Discover New CYRAiNO Connections
      </h2>

      {/* Vibe Check Button Area */}
      <div className="mb-8 p-6 bg-slate-800/50 backdrop-blur-md rounded-xl shadow-xl border border-slate-700 text-center">
        <h3 className="text-xl font-semibold text-slate-100 mb-2">Ready to Meet New CYRAiNOs?</h3>
        <p className="text-sm text-slate-400 mb-4">
          Let your CYRAiNO, <span className="font-semibold text-purple-300">{userProfile.agentName}</span>, run a "Global Vibe Check" to find potential connections. This uses one Vibe Token.
        </p>
        <button
          onClick={onRunGlobalVibeCheck}
          disabled={isDiscovering}
          className="px-6 py-3 sm:px-8 sm:py-3 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out disabled:opacity-60 disabled:cursor-not-allowed transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-purple-400 focus:ring-opacity-50 text-base"
        >
          {isDiscovering ? (
            <span className="flex items-center justify-center">
              <LoadingSpinner />
              <span className="ml-2">Checking Vibes...</span>
            </span>
          ) : (
            <span className="flex items-center justify-center">
              <SparklesIcon className="w-5 h-5 sm:w-6 sm:h-6 mr-2" />
              Run Global Vibe Check
            </span>
          )}
        </button>
      </div>
      
      {/* Error Display - shown if error exists and not currently discovering */}
      {error && !isDiscovering && (
        <div className="my-6">
          <ErrorDisplay message={error} />
        </div>
      )}

      {/* Discovered Matches Section */}
      {/* Only show "Potential Vibes Found!" header if there are matches and not discovering */}
      {!isDiscovering && discoveredPotentialMatches.length > 0 && (
        <div className="mt-10">
          <h3 className="text-2xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-sky-300 mb-6 text-center sm:text-left">
            Fresh Vibes Found!
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {discoveredPotentialMatches.map(match => (
              <DiscoveredMatchCard
                key={match.id}
                match={match}
                onAccept={() => onAcceptMatch(match)}
                onDecline={() => onDeclineMatch(match.id)}
                onViewDetails={() => onViewInteraction(match.interactionDetails)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Message for no matches found after a check, and no other error is overriding it */}
      {!isDiscovering && discoveredPotentialMatches.length === 0 && !error && (
        <p className="text-center text-slate-400 text-lg py-10">
          No new CYRAiNO vibes discovered this round. Try running a new Global Vibe Check!
        </p>
      )}
    </div>
  );
};
