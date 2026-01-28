
import React, { useState, useEffect } from 'react';
import { MatchRecord, ReflectionData } from '../types';
import { XMarkIcon } from './icons/XMarkIcon';
import { PencilSquareIcon } from './icons/PencilSquareIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';

interface PostDateReflectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  match: MatchRecord;
  onSubmitReflection: (matchId: string, reflectionData: ReflectionData) => void;
  reflectionTagsOptions: string[];
}

export const PostDateReflectionModal: React.FC<PostDateReflectionModalProps> = ({
  isOpen,
  onClose,
  match,
  onSubmitReflection,
  reflectionTagsOptions,
}) => {
  const [notes, setNotes] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isSubmittedOrViewing, setIsSubmittedOrViewing] = useState(false);

  useEffect(() => {
    if (match?.plannedDateDetails?.status === 'reflection_submitted') {
      setNotes(match.plannedDateDetails.reflectionNotes || '');
      setSelectedTags(match.plannedDateDetails.reflectionTags || []);
      setIsSubmittedOrViewing(true);
    } else {
      setNotes('');
      setSelectedTags([]);
      setIsSubmittedOrViewing(false);
    }
  }, [match, isOpen]);

  if (!isOpen || !match) return null;

  const handleTagToggle = (tag: string) => {
    if (isSubmittedOrViewing) return;
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = () => {
    if (isSubmittedOrViewing) {
      onClose(); // If just viewing, close button acts as expected
      return;
    }
    onSubmitReflection(match.id, { notes, tags: selectedTags });
  };
  
  const otherAgentName = match.agentTwo.agentName;
  const dateActivity = match.plannedDateDetails?.selectedDateIdea?.activity || 'your date';

  return (
    <div
      className="fixed inset-0 bg-slate-900/80 backdrop-blur-lg flex items-center justify-center p-4 z-[100]"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="reflection-modal-title"
    >
      <div
        className="bg-gradient-to-br from-slate-800 via-purple-900/20 to-slate-800 rounded-xl shadow-2xl border border-purple-700/60 p-6 sm:p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto relative flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-slate-400 hover:text-slate-200 transition-colors z-10"
          aria-label="Close reflection modal"
        >
          <XMarkIcon className="w-7 h-7" />
        </button>

        <div className="text-center mb-6">
          {isSubmittedOrViewing ? (
            <CheckCircleIcon className="w-12 h-12 text-green-400 mx-auto mb-2" />
          ) : (
            <PencilSquareIcon className="w-12 h-12 text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-sky-400 mx-auto mb-2" />
          )}
          <h2 id="reflection-modal-title" className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-sky-400 to-teal-300">
            {isSubmittedOrViewing ? 'Date Reflection Logged' : 'Post-Date Reflection'}
          </h2>
          <p className="text-slate-300 text-sm">
            For your date ({dateActivity}) with {otherAgentName}.
          </p>
        </div>

        <div className="space-y-5 mb-6">
          <div>
            <label htmlFor="reflectionNotes" className="block text-sm font-medium text-sky-300 mb-1">
              Your Notes & Thoughts:
            </label>
            <textarea
              id="reflectionNotes"
              value={notes}
              onChange={(e) => !isSubmittedOrViewing && setNotes(e.target.value)}
              rows={3}
              placeholder={isSubmittedOrViewing ? "No notes were added." : "How did it go? What stood out? Spill the tea..."}
              className="w-full p-3 bg-slate-700/60 border border-slate-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-colors text-gray-100 placeholder-slate-400 resize-y"
              readOnly={isSubmittedOrViewing}
              aria-label="Reflection notes"
            />
          </div>

          <div>
            <h3 className="block text-sm font-medium text-sky-300 mb-2">
              They were giving... (Select all that apply)
            </h3>
            <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto pr-1">
              {reflectionTagsOptions.map(tag => (
                <button
                  key={tag}
                  onClick={() => handleTagToggle(tag)}
                  disabled={isSubmittedOrViewing}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all
                    ${selectedTags.includes(tag)
                      ? 'bg-sky-500 text-white border-sky-400'
                      : 'bg-slate-700/50 text-slate-300 border-slate-600 hover:bg-slate-600/70 hover:border-sky-600/50'
                    }
                    ${isSubmittedOrViewing ? 'cursor-default opacity-80' : 'cursor-pointer'}
                  `}
                  aria-pressed={selectedTags.includes(tag)}
                >
                  {tag}
                </button>
              ))}
            </div>
             {isSubmittedOrViewing && selectedTags.length === 0 && <p className="text-xs text-slate-400 mt-1">No tags selected.</p>}
          </div>
        </div>
        
        <button
          onClick={handleSubmit}
          className={`w-full font-semibold py-3 px-4 rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-opacity-50
            ${isSubmittedOrViewing 
              ? 'bg-slate-600 hover:bg-slate-500 text-slate-200 focus:ring-slate-400'
              : 'bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white focus:ring-sky-400'
            }`}
        >
          {isSubmittedOrViewing ? 'Close' : 'Submit Reflection'}
        </button>
      </div>
    </div>
  );
};
