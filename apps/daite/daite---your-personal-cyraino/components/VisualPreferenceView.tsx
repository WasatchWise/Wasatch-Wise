
import React, { useState } from 'react';
import { VisualPreferencePhoto, VisualPreferenceResponse } from '../types';
import { EyeIcon } from './icons/EyeIcon';
import { CheckIcon } from './icons/CheckIcon';
import { XMarkIcon as CloseIcon } from './icons/XMarkIcon'; // Alias for clarity
import { SparklesIcon } from './icons/SparklesIcon';

interface VisualPreferenceViewProps {
  photos: VisualPreferencePhoto[];
  onSubmit: (responses: VisualPreferenceResponse[]) => void;
  isComplete: boolean; // To show a completed state if already done
}

export const VisualPreferenceView: React.FC<VisualPreferenceViewProps> = ({ photos, onSubmit, isComplete }) => {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [responses, setResponses] = useState<VisualPreferenceResponse[]>([]);
  
  const [currentWouldTalk, setCurrentWouldTalk] = useState<boolean | null>(null);
  const [currentEmotionallySafe, setCurrentEmotionallySafe] = useState<boolean | null>(null);
  const [currentVibeNotes, setCurrentVibeNotes] = useState('');

  const totalPhotos = photos.length;

  const handleNextPhoto = () => {
    const currentPhoto = photos[currentPhotoIndex];
    const newResponse: VisualPreferenceResponse = {
      photoId: currentPhoto.id,
      wouldTalk: currentWouldTalk,
      emotionallySafe: currentEmotionallySafe,
      vibeNotes: currentVibeNotes,
    };
    const updatedResponses = [...responses, newResponse];
    setResponses(updatedResponses);

    // Reset for next photo
    setCurrentWouldTalk(null);
    setCurrentEmotionallySafe(null);
    setCurrentVibeNotes('');

    if (currentPhotoIndex < totalPhotos - 1) {
      setCurrentPhotoIndex(currentPhotoIndex + 1);
    } else {
      onSubmit(updatedResponses); // Submit all responses
    }
  };
  
  if (isComplete && responses.length === 0) { // If marked complete externally but no local responses (e.g. page reloaded after completion)
     return (
      <div className="max-w-2xl mx-auto bg-slate-800/50 backdrop-blur-md p-6 sm:p-10 rounded-xl shadow-2xl border border-slate-700 text-center">
        <SparklesIcon className="w-16 h-16 text-green-400 mx-auto mb-4" />
        <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-teal-300 mb-4">
          Visual DNA Calibrated!
        </h2>
        <p className="text-slate-300 text-lg mb-6">
          Your personal CYRAiNO has updated its understanding of your visual preferences.
        </p>
        <p className="text-sm text-slate-400">You can revisit your personal CYRAiNO profile or explore other features.</p>
      </div>
    );
  }


  if (currentPhotoIndex >= totalPhotos || (isComplete && responses.length > 0)) {
    // All photos rated or process already completed
    return (
      <div className="max-w-2xl mx-auto bg-slate-800/50 backdrop-blur-md p-6 sm:p-10 rounded-xl shadow-2xl border border-slate-700 text-center">
        <SparklesIcon className="w-16 h-16 text-green-400 mx-auto mb-4 animate-pulse" />
        <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-teal-300 mb-4">
          Visual DNA Calibration Complete!
        </h2>
        <p className="text-slate-300 text-lg mb-6">
          CYRAiNO has processed your preferences. This will help in finding more aligned Vibe Checks!
        </p>
        <p className="text-sm text-slate-400">Total preferences logged: {responses.length}</p>
      </div>
    );
  }

  const currentPhoto = photos[currentPhotoIndex];

  const ResponseButton: React.FC<{
    onClick: () => void;
    label: string;
    isActive: boolean;
    Icon: React.FC<React.SVGProps<SVGSVGElement>>;
    activeColor: string; // e.g. 'green' or 'red'
  }> = ({ onClick, label, isActive, Icon, activeColor }) => (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 p-3 rounded-lg border-2 transition-all duration-200 flex items-center justify-center space-x-2 font-medium
        ${isActive 
          ? `bg-${activeColor}-500/20 border-${activeColor}-500 text-${activeColor}-300 shadow-lg` 
          : 'bg-slate-700/40 border-slate-600 hover:border-slate-500 text-slate-300 hover:text-white'
        }`}
    >
      <Icon className={`w-5 h-5 ${isActive ? `text-${activeColor}-400` : 'text-slate-400'}`} />
      <span>{label}</span>
    </button>
  );


  return (
    <div className="max-w-2xl mx-auto bg-slate-800/50 backdrop-blur-md p-6 sm:p-8 rounded-xl shadow-2xl border border-slate-700">
      <div className="text-center mb-6">
        <EyeIcon className="w-12 h-12 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500 mx-auto mb-2" />
        <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-orange-400">
          Calibrate Your Visual DNA
        </h2>
        <p className="text-slate-400 text-sm mt-1">Help your personal CYRAiNO understand your initial visual impressions.</p>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-slate-400 mb-1">
          <span>Progress</span>
          <span>Photo {currentPhotoIndex + 1} of {totalPhotos}</span>
        </div>
        <div className="w-full bg-slate-700 rounded-full h-2.5">
          <div 
            className="bg-gradient-to-r from-pink-500 to-purple-600 h-2.5 rounded-full transition-all duration-300 ease-out" 
            style={{ width: `${((currentPhotoIndex + 1) / totalPhotos) * 100}%` }}
          ></div>
        </div>
      </div>

      <div className="mb-6 rounded-lg overflow-hidden shadow-lg border border-slate-700">
        <img 
            src={currentPhoto.url} 
            alt={currentPhoto.alt} 
            className="w-full h-auto max-h-[60vh] object-contain aspect-[3/4]" // Maintain aspect ratio, object-contain to see full image
            onError={(e) => (e.currentTarget.src = 'https://source.unsplash.com/random/500x600/?abstract,pattern')} // Fallback
        />
      </div>

      <form onSubmit={(e) => { e.preventDefault(); handleNextPhoto(); }}>
        <div className="space-y-6 mb-8">
          {/* Question 1 */}
          <div>
            <label className="block text-md font-semibold text-sky-300 mb-2">Would you want to talk to them?</label>
            <div className="flex space-x-3">
              <ResponseButton onClick={() => setCurrentWouldTalk(true)} label="Yes" isActive={currentWouldTalk === true} Icon={CheckIcon} activeColor="green" />
              <ResponseButton onClick={() => setCurrentWouldTalk(false)} label="No" isActive={currentWouldTalk === false} Icon={CloseIcon} activeColor="red" />
            </div>
          </div>

          {/* Question 2 */}
          <div>
            <label className="block text-md font-semibold text-sky-300 mb-2">Do they look emotionally safe?</label>
            <div className="flex space-x-3">
              <ResponseButton onClick={() => setCurrentEmotionallySafe(true)} label="Yes" isActive={currentEmotionallySafe === true} Icon={CheckIcon} activeColor="green" />
              <ResponseButton onClick={() => setCurrentEmotionallySafe(false)} label="No" isActive={currentEmotionallySafe === false} Icon={CloseIcon} activeColor="red" />
            </div>
          </div>
          
          {/* Question 3 */}
          <div>
            <label htmlFor="vibeNotes" className="block text-md font-semibold text-sky-300 mb-2">
              What vibe do you feel from them? (Optional)
            </label>
            <textarea
              id="vibeNotes"
              value={currentVibeNotes}
              onChange={(e) => setCurrentVibeNotes(e.target.value)}
              rows={2}
              placeholder="e.g., Friendly, intense, creative, reserved..."
              className="w-full p-3 bg-slate-700/60 border border-slate-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition-colors text-gray-100 placeholder-slate-400 resize-y"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-gradient-to-r from-pink-600 to-purple-700 hover:from-pink-700 hover:to-purple-800 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-pink-400 focus:ring-opacity-50 disabled:opacity-70"
          disabled={currentWouldTalk === null || currentEmotionallySafe === null} // Require main questions to be answered
        >
          {currentPhotoIndex < totalPhotos - 1 ? 'Next Photo' : 'Finish Calibration'}
        </button>
      </form>
    </div>
  );
};