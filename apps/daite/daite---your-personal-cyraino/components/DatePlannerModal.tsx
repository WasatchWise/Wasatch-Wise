
import React from 'react';
import { MatchRecord, DateIdea, PlannedDateDetails } from '../types';
import { LoadingSpinner } from './LoadingSpinner';
import { ErrorDisplay } from './ErrorDisplay';
import { XMarkIcon } from './icons/XMarkIcon';
import { CalendarDaysIcon } from './icons/CalendarDaysIcon';
import { ClipboardDocumentCheckIcon } from './icons/ClipboardDocumentCheckIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { LightBulbIcon } from './icons/LightBulbIcon';
import { GiftIcon } from './icons/GiftIcon'; // For blind date visual cue

interface DatePlannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  match: MatchRecord;
  isLoading: boolean;
  error: string | null;
  dateIdeas: DateIdea[] | null;
  plannedDetails: Partial<PlannedDateDetails> | null;
  isBlindDateContext: boolean; 
  onSelectIdea: (idea: DateIdea) => void;
  onConfirmTimeSlot: (timeSlot: string) => void;
}

export const DatePlannerModal: React.FC<DatePlannerModalProps> = ({
  isOpen,
  onClose,
  match,
  isLoading,
  error,
  dateIdeas,
  plannedDetails,
  isBlindDateContext,
  onSelectIdea,
  onConfirmTimeSlot,
}) => {
  if (!isOpen) return null;

  const otherAgentName = isBlindDateContext ? "your mystery match" : match.agentTwo.agentName;
  const modalTitle = isBlindDateContext ? "Blind Date Blueprint!" : "CYRAiNO's Date Blueprints!";
  const introText = isBlindDateContext 
    ? `The CYRAiNOs think you'll hit it off! Here's the setup for your serendipitous meeting with ${otherAgentName}:`
    : `Pick a vibe for your date with ${otherAgentName}:`;

  const renderContent = () => {
    if (isLoading && (!dateIdeas && !plannedDetails?.selectedDateIdea)) {
      return (
        <div className="text-center py-10">
          <LoadingSpinner />
          <p className="mt-4 text-lg text-slate-300">CYRAiNO is brainstorming date ideas...</p>
          <p className="text-sm text-slate-400">Hang tight, this is where the magic happens!</p>
        </div>
      );
    }

    if (error) {
      return <ErrorDisplay message={error} />;
    }
    
    if (dateIdeas && plannedDetails?.status === 'ideas_generated') {
      return (
        <>
          <h3 className="text-xl font-semibold text-center mb-2 text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-sky-400">{modalTitle}</h3>
          {isBlindDateContext && match.interactionDetails.blindDatePitch && (
            <div className="my-4 p-3 bg-purple-800/30 border border-purple-600/50 rounded-md text-sm text-purple-300 italic">
              <p className="font-semibold text-purple-200 mb-1">Your Agents' Insight:</p>
              "{match.interactionDetails.blindDatePitch}"
            </div>
          )}
          <p className="text-center text-sm text-slate-400 mb-6">{introText}</p>
          <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2">
            {dateIdeas.map((idea, index) => (
              <div key={index} className="bg-slate-700/50 p-4 rounded-lg border border-slate-600 hover:border-teal-500 transition-colors">
                <h4 className="text-lg font-bold text-teal-300">{idea.activity}</h4>
                <p className="text-xs text-teal-400/80 mb-1 uppercase tracking-wide">{idea.vibe} - {idea.quirkFactor} ({idea.budget})</p>
                <p className="text-sm text-slate-300 mb-3">{idea.description}</p>
                <button
                  onClick={() => onSelectIdea(idea)}
                  className="w-full bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white font-semibold py-2 px-4 rounded-md shadow-md hover:shadow-lg transition-all text-sm"
                >
                  Select This Vibe
                </button>
              </div>
            ))}
          </div>
        </>
      );
    }

    if (plannedDetails?.status === 'idea_selected' && plannedDetails.selectedDateIdea) {
      const idea = plannedDetails.selectedDateIdea;
      return (
        <>
          <h3 className="text-xl font-semibold text-center mb-1 text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-500">Vibe Locked: {idea.activity}!</h3>
          <p className="text-center text-sm text-slate-400 mb-4">CYRAiNO suggests these times. Which works best (virtually)?</p>
          {isLoading && <div className="my-4"><LoadingSpinner /> <p className="text-center text-sm text-slate-400 mt-2">CYRAiNO is pondering...</p></div>}
          <div className="space-y-3 mb-4">
            {idea.suggestedTimeSlots.map(slot => (
              <button
                key={slot}
                onClick={() => onConfirmTimeSlot(slot)}
                disabled={isLoading}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2.5 px-4 rounded-md transition-colors disabled:opacity-50"
              >
                {slot}
              </button>
            ))}
          </div>
        </>
      );
    }
    
    if (plannedDetails?.status === 'time_slot_confirmed' && (plannedDetails.calendarStatus === 'checking' || isLoading)) {
      return (
        <div className="text-center py-10">
          <LoadingSpinner />
          <p className="mt-4 text-lg text-slate-300">CYRAiNO is 'checking calendars' & 'clearing schedules'...</p>
          <p className="text-sm text-slate-400">(Virtually, of course! 😉 Shhh, don't tell the code.)</p>
        </div>
      );
    }

    if (plannedDetails?.status === 'booked_by_cyrano' && plannedDetails.selectedDateIdea && plannedDetails.selectedTimeSlot) {
        const { selectedDateIdea: idea, selectedTimeSlot: timeSlot } = plannedDetails;
         return (
            <>
                <div className="text-center mb-6">
                    {isBlindDateContext ? 
                        <GiftIcon className="w-16 h-16 text-transparent bg-clip-text bg-gradient-to-br from-yellow-400 to-orange-500 mx-auto mb-2 animate-pulse" />
                        : <SparklesIcon className="w-16 h-16 text-transparent bg-clip-text bg-gradient-to-br from-pink-400 to-orange-400 mx-auto mb-2 animate-pulse" />
                    }
                    <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-teal-300">
                        {isBlindDateContext ? "Blind Date Arranged!" : "Date Is Set!"}
                    </h3>
                    <p className="text-slate-300">CYRAiNO has (virtually) worked its magic for your date with {otherAgentName}.</p>
                </div>
                {isBlindDateContext && match.interactionDetails.blindDatePitch && (
                    <div className="my-4 p-3 bg-purple-800/30 border border-purple-600/50 rounded-md text-sm text-purple-300 italic">
                      <p className="font-semibold text-purple-200 mb-1">A Note from Your Agents:</p>
                      "{match.interactionDetails.blindDatePitch}"
                    </div>
                 )}
                <div className="bg-slate-700/50 p-4 rounded-lg border border-slate-600 mb-6">
                    <p className="text-lg font-semibold text-teal-300">{idea.activity}</p>
                    {!isBlindDateContext && <p className="text-sm text-slate-300">{idea.description}</p> }
                    <p className="mt-2 text-sm">
                        <span className="text-slate-400">When: </span><strong className="text-pink-400">{timeSlot}</strong>
                    </p>
                    <p className="text-sm">
                        <span className="text-slate-400">Vibe: </span><strong className="text-sky-400">{idea.vibe}</strong>
                    </p>
                    <p className="text-sm">
                        <span className="text-slate-400">Budget: </span><strong className="text-yellow-400">{idea.budget}</strong> | <span className="text-slate-400">Quirk: </span><strong className="text-purple-400">{idea.quirkFactor}</strong>
                    </p>
                    <p className="text-xs text-green-400 mt-2 animate-pulse">✓ Calendars 'cleared' & 'transport' vibes virtually sorted!</p>
                </div>
                <div>
                    <h4 className="text-lg font-semibold text-pink-400 mb-2 flex items-center">
                        <LightBulbIcon className="w-5 h-5 mr-2 text-pink-400/70" />
                        CYRAiNO's Convo Catalysts:
                    </h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-slate-300 pl-2">
                        {idea.cyranoConvoCatalysts.map((starter, i) => ( // Updated field name
                            <li key={i} className="italic">"{starter}"</li>
                        ))}
                    </ul>
                </div>
            </>
         );
    }

    return <p className="text-center text-slate-400 py-5">Loading date planner options...</p>;
  };

  return (
    <div
      className="fixed inset-0 bg-slate-900/80 backdrop-blur-lg flex items-center justify-center p-4 z-[100]"
      onClick={onClose} 
      role="dialog"
      aria-modal="true"
      aria-labelledby="date-planner-title"
    >
      <div
        className="bg-gradient-to-br from-slate-800 to-slate-800/90 rounded-xl shadow-2xl border border-slate-700 p-6 sm:p-8 max-w-md w-full max-h-[90vh] overflow-y-auto relative flex flex-col"
        onClick={(e) => e.stopPropagation()} 
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-slate-500 hover:text-slate-200 transition-colors z-10"
          aria-label="Close date planner"
        >
          <XMarkIcon className="w-7 h-7" />
        </button>
        
        <div id="date-planner-title" className="sr-only">Date Planner with CYRAiNO</div>

        <div className="flex-grow">
            {renderContent()}
        </div>

        {!isLoading && !(plannedDetails?.status === 'booked_by_cyrano') && (
          <button
            onClick={onClose}
            className="mt-6 w-full bg-slate-600 hover:bg-slate-500 text-slate-200 font-medium py-2.5 px-4 rounded-md transition-colors text-sm"
          >
            {plannedDetails?.selectedDateIdea ? "Maybe Later" : "Close"}
          </button>
        )}
         {plannedDetails?.status === 'booked_by_cyrano' && (
             <button
                onClick={onClose}
                className="mt-8 w-full bg-gradient-to-r from-pink-600 to-purple-700 hover:from-pink-700 hover:to-purple-800 text-white font-semibold py-2.5 px-4 rounded-lg shadow-lg transition-all"
            >
                Awesome, Got It!
            </button>
         )}
      </div>
    </div>
  );
};