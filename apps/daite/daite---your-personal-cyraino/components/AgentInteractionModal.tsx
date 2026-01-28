
import React from 'react';
import { AgentInteraction } from '../types';
import { LoadingSpinner } from './LoadingSpinner';
import { XMarkIcon } from './icons/XMarkIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { NoSymbolIcon } from './icons/NoSymbolIcon';

interface AgentInteractionModalProps {
  isOpen: boolean;
  onClose: () => void;
  interaction: AgentInteraction | null;
  isLoading: boolean;
}

export const AgentInteractionModal: React.FC<AgentInteractionModalProps> = ({ isOpen, onClose, interaction, isLoading }) => {
  if (!isOpen) return null;

  const renderTranscript = (transcript: string) => {
    if (!interaction || !interaction.interactingAgents) return <p>{transcript}</p>;
    
    // userAgent is the user's own CYRAiNO, otherAgent is the matched user's CYRAiNO
    const { userAgent, otherAgent } = interaction.interactingAgents;
    return transcript.split('\n').map((line, index) => {
      const isUserAgentLine = line.startsWith(userAgent.agentName + ":");
      const isOtherAgentLine = line.startsWith(otherAgent.agentName + ":");
      let speakerName = "";
      let message = line;

      if (isUserAgentLine) {
        speakerName = userAgent.agentName; // Name of the user's CYRAiNO
        message = line.substring(userAgent.agentName.length + 1).trim();
      } else if (isOtherAgentLine) {
        speakerName = otherAgent.agentName; // Name of the other user's CYRAiNO
        message = line.substring(otherAgent.agentName.length + 1).trim();
      }
      
      return (
        <p key={index} className={`mb-2 ${isUserAgentLine ? 'text-purple-300' : isOtherAgentLine ? 'text-sky-300' : 'text-slate-400'}`}>
          {speakerName && <strong className={isUserAgentLine ? 'text-purple-200' : 'text-sky-200'}>{speakerName}:</strong>} {message}
        </p>
      );
    });
  };

  return (
    <div 
      className="fixed inset-0 bg-slate-900/70 backdrop-blur-md flex items-center justify-center p-4 z-[100]"
      onClick={onClose}
    >
      <div 
        className="bg-slate-800 rounded-xl shadow-2xl border border-slate-700 p-6 sm:p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto relative"
        onClick={(e) => e.stopPropagation()} // Prevent click inside modal from closing it
      >
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 transition-colors"
          aria-label="Close interaction modal"
        >
          <XMarkIcon className="w-7 h-7" />
        </button>

        {isLoading && (
          <div className="text-center py-10">
            <LoadingSpinner />
            <p className="mt-4 text-lg text-slate-300">The CYRAiNO system is simulating the interaction...</p>
            <p className="text-sm text-slate-400">This may take a moment.</p>
          </div>
        )}

        {!isLoading && interaction && (
          <>
            <h2 className="text-2xl sm:text-3xl font-bold mb-3 text-center">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
                {interaction.interactingAgents.userAgent.agentName} (Your CYRAiNO)
              </span>
              <span className="text-slate-400 mx-2">&amp;</span> 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-teal-400">
                {interaction.interactingAgents.otherAgent.agentName}
              </span>
            </h2>
            <p className="text-center text-slate-400 text-sm mb-6">CYRAiNO Agents Interaction Log</p>

            {interaction.error && (
                 <div className="mb-4 p-3 bg-red-800/30 border border-red-600 text-red-200 rounded-md text-sm">
                    <strong className="font-semibold">Interaction Error:</strong> {interaction.error}
                </div>
            )}

            <div className="mb-6 p-4 bg-slate-900/50 rounded-lg border border-slate-700 max-h-60 overflow-y-auto">
              <h4 className="text-lg font-semibold text-slate-200 mb-2">Transcript:</h4>
              <div className="text-sm whitespace-pre-wrap font-mono leading-relaxed">
                {renderTranscript(interaction.transcript)}
              </div>
            </div>

            <div className="mb-6">
              <h4 className="text-lg font-semibold text-slate-200 mb-1">Summary:</h4>
              <p className="text-sm text-slate-300 leading-relaxed">{interaction.summary}</p>
            </div>
            
            <div className={`p-4 rounded-lg border flex items-center justify-center space-x-3
              ${interaction.matchDecision === "YES" && !interaction.error ? 'bg-green-800/30 border-green-600 text-green-300' : 'bg-red-800/30 border-red-600 text-red-300'}`}>
              {interaction.matchDecision === "YES" && !interaction.error ? <CheckCircleIcon className="w-8 h-8 text-green-400"/> : <NoSymbolIcon className="w-8 h-8 text-red-400"/>}
              <div>
                <p className="text-lg font-semibold">
                  {interaction.matchDecision === "YES" && !interaction.error ? "Potential Match Between Users!" : "Not a Match This Time"}
                </p>
                <p className="text-sm">Match Potential Score (between CYRAiNOs): {interaction.matchPotential}%</p>
              </div>
            </div>

            {interaction.matchDecision === "YES" && !interaction.error && (
                 <p className="text-center text-sm text-green-400 mt-4">
                    {interaction.interactingAgents.otherAgent.agentName} has been added to your Matches!
                </p>
            )}
          </>
        )}
         <button 
            onClick={onClose} 
            className="mt-8 w-full bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-500 hover:to-slate-600 text-white font-semibold py-2.5 px-4 rounded-lg shadow-md hover:shadow-lg transition-all"
          >
            Close
          </button>
      </div>
    </div>
  );
};