import React, { useState, useEffect } from 'react';
import { X as XIcon, Bot } from 'lucide-react';
import { useDatePlanning } from '../../contexts/DatePlanningContext';
import { useTokens } from '../../contexts/TokenContext';
import DatePlanCard from './DatePlanCard'; // Import the extracted component

const DatePlanningModal: React.FC = () => {
  const {
    showDatePlanModal,
    setShowDatePlanModal,
    profileToPlanFor,
    setProfileToPlanFor,
    dateRecommendations,
    bookDateHandler,
  } = useDatePlanning();
  const { tokens } = useTokens();

  const [internalShowContent, setInternalShowContent] = useState(false);

  useEffect(() => {
    if (showDatePlanModal) {
      const timer = setTimeout(() => setInternalShowContent(true), 50);
      return () => clearTimeout(timer);
    } else {
      setInternalShowContent(false);
    }
  }, [showDatePlanModal]);

  const handleClose = () => {
    setShowDatePlanModal(false);
    // Delay clearing profile to allow modal to animate out
    setTimeout(() => {
        setProfileToPlanFor(null);
    }, 300); 
  };

  if (!showDatePlanModal || !profileToPlanFor) return null;

  return (
    <div className={`fixed inset-0 bg-black flex items-center justify-center z-50 p-4 transition-opacity duration-300 ease-in-out ${showDatePlanModal ? 'bg-opacity-75 opacity-100' : 'bg-opacity-0 opacity-0 pointer-events-none'}`}>
      <div 
        className={`bg-gradient-to-br from-gray-50 to-purple-50 rounded-xl max-w-3xl w-full mx-auto max-h-[90vh] overflow-hidden flex flex-col shadow-2xl transform transition-all duration-300 ease-in-out ${internalShowContent ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
      >
        <div className="p-5 sm:p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <img src={profileToPlanFor.image} alt={profileToPlanFor.name} className="w-12 h-12 sm:w-14 sm:h-14 rounded-full mr-3 sm:mr-4 object-cover shadow-md" />
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Plan Date with {profileToPlanFor.name}</h2>
                <p className="text-gray-600 text-sm">CYRAINO's curated experiences for you!</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-full hover:bg-gray-100"
              aria-label="Close date planning"
            >
              <XIcon className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-5 sm:p-6 overflow-y-auto flex-grow">
          {dateRecommendations.length === 0 ? (
             <div className="text-center py-10">
                <Bot className="w-16 h-16 text-purple-300 mx-auto mb-4" />
                <p className="text-gray-600">CYRAINO is thinking... or no recommendations available.</p>
             </div>
          ) : (
            <div className="space-y-5">
            {dateRecommendations.map(date => (
              <DatePlanCard
                key={date.id}
                datePlan={date}
                currentTokens={tokens}
                onBook={bookDateHandler}
              />
            ))}
          </div>
          )}
          
          <div className="mt-6 p-4 bg-purple-100 rounded-lg border border-purple-200">
            <div className="flex items-start">
              <Bot className="w-6 h-6 text-purple-600 mr-2.5 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-purple-800">CYRAINO Date Intelligence</h4>
                <p className="text-purple-700 text-sm">
                  These ideas are AI-personalized from shared interests and compatibility. Each includes real-time coaching to foster deeper connections.
                </p>
              </div>
            </div>
          </div>
        </div>
         <div className="p-4 bg-gray-100 border-t border-gray-200 text-right">
            <button
                onClick={handleClose}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
                Close
            </button>
        </div>
      </div>
    </div>
  );
};

export default DatePlanningModal;
