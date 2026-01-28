

import React from 'react';
import { MatchRecord, AgentInteraction, PlannedDateDetails, FirstContactMode } from '../types';
import { SparklesIcon } from './icons/SparklesIcon'; 
import { ChatBubbleLeftRightIcon } from './icons/ChatBubbleLeftRightIcon';
import { CalendarDaysIcon } from './icons/CalendarDaysIcon';
import { PencilSquareIcon } from './icons/PencilSquareIcon';
import { ArrowRightCircleIcon } from './icons/ArrowRightCircleIcon'; // For "Choose First Contact"
import { PaperAirplaneIcon } from './icons/PaperAirplaneIcon'; // For simulated chat/video
import { VideoCameraIcon } from './icons/VideoCameraIcon';

type DateActionType = 'choose_first_contact' | 'plan' | 'continue_plan' | 'log_reflection' | 'view_reflection';

interface SmallAgentCardProps {
  match: MatchRecord;
  onViewInteraction: (interaction: AgentInteraction) => void;
  onDateAction: (match: MatchRecord, action: DateActionType) => void;
}

const SmallAgentCard: React.FC<SmallAgentCardProps> = ({ match, onViewInteraction, onDateAction }) => {
    const agent = match.agentTwo; 
    const interaction = match.interactionDetails;
    const plannedDate = match.plannedDateDetails;
    const firstContact = match.firstContact;

    let actionButtonText = 'Next Step';
    let actionButtonIcon = <ArrowRightCircleIcon className="w-5 h-5 mr-2" />;
    let currentAction: DateActionType = 'choose_first_contact';
    let actionButtonDisabled = false;
    let actionButtonClass = 'bg-gradient-to-r from-pink-500/80 to-purple-600/80 hover:from-pink-500 hover:to-purple-600 text-white focus:ring-pink-400';

    if (firstContact.status === 'pending_choice') {
        actionButtonText = 'Choose First Contact';
        currentAction = 'choose_first_contact';
        actionButtonIcon = <ArrowRightCircleIcon className="w-5 h-5 mr-2" />;
    } else if (firstContact.mode === 'text' && firstContact.status === 'initiated') {
        actionButtonText = 'Text Chat Active (Sim)';
        actionButtonIcon = <ChatBubbleLeftRightIcon className="w-5 h-5 mr-2" />;
        actionButtonDisabled = true; // No further action for simulated chat
        actionButtonClass = 'bg-slate-600 text-slate-400 cursor-default focus:ring-slate-500';
    } else if (firstContact.mode === 'video' && firstContact.status === 'initiated') {
        actionButtonText = 'Video Call Active (Sim)';
        actionButtonIcon = <VideoCameraIcon className="w-5 h-5 mr-2" />;
        actionButtonDisabled = true; // No further action for simulated video
        actionButtonClass = 'bg-slate-600 text-slate-400 cursor-default focus:ring-slate-500';
    } else if ((firstContact.mode === 'in_person' || firstContact.mode === 'blind_date') && firstContact.status === 'awaiting_date_plan' && !plannedDate) {
        actionButtonText = firstContact.mode === 'blind_date' ? 'Plan Blind Date' : 'Plan Meet-Up';
        currentAction = 'plan';
        actionButtonIcon = <CalendarDaysIcon className="w-5 h-5 mr-2" />;
        actionButtonClass = 'bg-gradient-to-r from-teal-500/80 to-cyan-600/80 hover:from-teal-500 hover:to-cyan-600 text-white focus:ring-teal-400';
    } else if (plannedDate) {
        // Existing logic for planned dates takes over
        switch (plannedDate.status) {
            case 'booked_by_cyrano':
                actionButtonText = 'Log Reflection';
                currentAction = 'log_reflection';
                actionButtonIcon = <PencilSquareIcon className="w-5 h-5 mr-2" />;
                actionButtonClass = 'bg-gradient-to-r from-indigo-500/80 to-blue-600/80 hover:from-indigo-500 hover:to-blue-600 text-white focus:ring-indigo-400';
                break;
            case 'date_completed_pending_reflection':
                actionButtonText = 'Continue Reflection';
                currentAction = 'log_reflection'; 
                actionButtonIcon = <PencilSquareIcon className="w-5 h-5 mr-2" />;
                actionButtonClass = 'bg-gradient-to-r from-indigo-500/80 to-blue-600/80 hover:from-indigo-500 hover:to-blue-600 text-white focus:ring-indigo-400';
                break;
            case 'reflection_submitted':
                actionButtonText = 'View Reflection';
                currentAction = 'view_reflection'; 
                actionButtonIcon = <PencilSquareIcon className="w-5 h-5 mr-2" />;
                actionButtonClass = 'bg-slate-600 text-slate-300 hover:bg-slate-500 focus:ring-slate-400';
                break;
            default: // ideas_generated, idea_selected, etc.
                actionButtonText = 'Continue Planning';
                currentAction = 'continue_plan';
                actionButtonIcon = <CalendarDaysIcon className="w-5 h-5 mr-2" />;
                actionButtonClass = 'bg-gradient-to-r from-teal-500/80 to-cyan-600/80 hover:from-teal-500 hover:to-cyan-600 text-white focus:ring-teal-400';
                break;
        }
    }


    return (
    <div className="bg-slate-800/70 backdrop-blur-md rounded-xl shadow-xl border border-slate-700 overflow-hidden transition-all duration-300 hover:shadow-pink-500/20 hover:border-pink-600/60 p-5 flex flex-col">
        <div className="flex items-center mb-3">
            {agent.profileImage && <img src={agent.profileImage} alt={agent.agentName} className="w-16 h-16 rounded-full object-cover mr-4 border-2 border-purple-500"/>}
            <div>
                <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">{agent.agentName}</h3>
                <p className="text-xs text-purple-300 uppercase tracking-wider">{agent.agentPersonaType}</p>
            </div>
        </div>
        <p className="text-sm text-slate-300 mb-1 line-clamp-1">Seeking: {agent.relationshipGoal}</p>
        <p className="text-sm text-slate-400 mb-1 line-clamp-2">Summary: "{interaction.summary}"</p>
        <div className="flex items-center text-xs text-pink-400 mb-3">
            Match Potential: {interaction.matchPotential}%
            <div className={`w-full h-1.5 rounded-full ml-2 ${interaction.matchPotential > 60 ? 'bg-green-500/50' : interaction.matchPotential > 30 ? 'bg-yellow-500/50' : 'bg-red-500/50'}`}>
                <div style={{ width: `${interaction.matchPotential}%`}} className={`h-1.5 rounded-full ${interaction.matchPotential > 60 ? 'bg-green-400' : interaction.matchPotential > 30 ? 'bg-yellow-400' : 'bg-red-400'}`}></div>
            </div>
        </div>
        
        {/* Display current first contact status if relevant */}
        {firstContact.status !== 'pending_choice' && !plannedDate && (
             <div className="mb-3 p-2 bg-sky-800/30 border border-sky-700/50 rounded-md text-sm">
                <p className="font-semibold text-sky-300">First Contact: 
                    <span className="ml-1 capitalize text-sky-400/90">
                        {firstContact.mode?.replace('_', ' ')} ({firstContact.status.replace('_', ' ')})
                    </span>
                </p>
             </div>
        )}


        {/* Display Date Status if a date is planned */}
        {plannedDate?.status === 'booked_by_cyrano' && (
            <div className="mb-3 p-2.5 bg-green-800/30 border border-green-600/50 rounded-md text-sm">
                <p className="font-semibold text-green-300">Date Planned!</p>
                <p className="text-green-400/80">{plannedDate.selectedDateIdea.activity} on {plannedDate.selectedTimeSlot}</p>
            </div>
        )}
         {plannedDate?.status === 'date_completed_pending_reflection' && (
            <div className="mb-3 p-2.5 bg-yellow-800/30 border border-yellow-600/50 rounded-md text-sm">
                <p className="font-semibold text-yellow-300">Reflection Pending</p>
                <p className="text-yellow-400/80">Log your thoughts on the date!</p>
            </div>
        )}
        {plannedDate?.status === 'reflection_submitted' && (
            <div className="mb-3 p-2.5 bg-sky-800/30 border border-sky-600/50 rounded-md text-sm">
                <p className="font-semibold text-sky-300">Reflection Logged!</p>
                {plannedDate.reflectionNotes && <p className="text-sky-400/80 italic line-clamp-1">"{plannedDate.reflectionNotes}"</p>}
                 {plannedDate.reflectionTags && plannedDate.reflectionTags.length > 0 && 
                    <p className="text-xs text-sky-500/90 mt-1">Tags: {plannedDate.reflectionTags.join(', ')}</p>
                 }
            </div>
        )}


        <div className="mt-auto space-y-2">
            <button 
                onClick={() => onViewInteraction(interaction)}
                className="w-full flex items-center justify-center bg-gradient-to-r from-purple-500/80 to-indigo-600/80 hover:from-purple-500 hover:to-indigo-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-opacity-50 text-sm"
            >
                <ChatBubbleLeftRightIcon className="w-4 h-4 mr-2" />
                View Vibe Check
            </button>
            <button
                onClick={() => onDateAction(match, currentAction)}
                disabled={actionButtonDisabled}
                className={`w-full flex items-center justify-center font-semibold py-2.5 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-opacity-50 text-sm ${actionButtonClass}`}
            >
                {actionButtonIcon}
                {actionButtonText}
            </button>
        </div>
    </div>
);
}

export const MatchesView: React.FC<{ 
    matches: MatchRecord[]; 
    onViewInteraction: (interaction: AgentInteraction) => void;
    onDateAction: (match: MatchRecord, action: DateActionType) => void;
}> = ({ matches, onViewInteraction, onDateAction }) => {
  if (matches.length === 0) {
    return (
      <div className="text-center py-10">
        <SparklesIcon className="w-16 h-16 text-slate-500 mx-auto mb-4 animate-pulse" />
        <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500 mb-4">Your Matches</h2>
        <p className="text-slate-400 text-lg">No matches yet. Explore the "Discover" section to let CYRAiNO find potential connections!</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="flex items-center text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-teal-300 mb-8">
        <SparklesIcon className="w-8 h-8 mr-3 text-teal-400 animate-pulse" />
        Successful Connections
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {matches.map(match => (
          <SmallAgentCard 
            key={match.id} 
            match={match}
            onViewInteraction={onViewInteraction}
            onDateAction={onDateAction}
          />
        ))}
      </div>
    </div>
  );
};