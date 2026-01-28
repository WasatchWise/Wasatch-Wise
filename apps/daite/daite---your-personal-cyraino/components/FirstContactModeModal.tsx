
import React from 'react';
import { MatchRecord, FirstContactMode } from '../types';
import { XMarkIcon } from './icons/XMarkIcon';
import { ChatBubbleBottomCenterTextIcon } from './icons/ChatBubbleBottomCenterTextIcon';
import { VideoCameraIcon } from './icons/VideoCameraIcon';
import { UserGroupIcon } from './icons/UserGroupIcon';
import { GiftIcon } from './icons/GiftIcon';
import { SparklesIcon } from './icons/SparklesIcon';

interface FirstContactModeModalProps {
  isOpen: boolean;
  onClose: () => void;
  match: MatchRecord;
  onSelectMode: (matchId: string, mode: FirstContactMode) => void;
}

interface ContactOptionProps {
  // Fix: Specify the icon prop type more precisely to ensure React.cloneElement understands
  // that 'className' is a valid prop for these SVG icon components.
  // The original 'React.ReactElement' was too generic, leading to type inference issues.
  icon: React.ReactElement<React.SVGProps<SVGSVGElement>>;
  title: string;
  description: string;
  onClick: () => void;
  mode: FirstContactMode;
}

const ContactOptionCard: React.FC<ContactOptionProps> = ({ icon, title, description, onClick, mode }) => (
  <button
    onClick={onClick}
    className="w-full text-left p-4 bg-slate-700/50 hover:bg-slate-600/70 rounded-lg border border-slate-600 hover:border-purple-500 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
    aria-label={`Select ${title} mode`}
  >
    <div className="flex items-start">
      {React.cloneElement(icon, { className: "w-8 h-8 mr-4 text-purple-400 flex-shrink-0 mt-1" })}
      <div>
        <h4 className="text-lg font-semibold text-slate-100">{title}</h4>
        <p className="text-sm text-slate-300">{description}</p>
      </div>
    </div>
  </button>
);

export const FirstContactModeModal: React.FC<FirstContactModeModalProps> = ({
  isOpen,
  onClose,
  match,
  onSelectMode,
}) => {
  if (!isOpen) return null;

  const { agentTwo } = match;

  const options: ContactOptionProps[] = [
    {
      mode: 'text',
      icon: <ChatBubbleBottomCenterTextIcon />,
      title: "Text Chat",
      description: "Wordsmiths & slow burners, start here. Your personal CYRAiNO listens in for vibe and pacing.",
      onClick: () => onSelectMode(match.id, 'text'),
    },
    {
      mode: 'video',
      icon: <VideoCameraIcon />,
      title: "Video Chat – AR Guided",
      description: "Cinematically guided connection with subtle cues & shared interest visuals. (Simulated for Demo)",
      onClick: () => onSelectMode(match.id, 'video'),
    },
    {
      mode: 'in_person',
      icon: <UserGroupIcon />,
      title: "In-Person Meet-Up",
      description: "Ready for IRL? Your personal CYRAiNO suggests vibe-matched public spots & helps schedule.",
      onClick: () => onSelectMode(match.id, 'in_person'),
    },
    {
      mode: 'blind_date',
      icon: <GiftIcon />,
      title: "The Blind Date Option",
      description: "For the bold! No photos, no prior chat. Just presence & agent-curated insights.",
      onClick: () => onSelectMode(match.id, 'blind_date'),
    },
  ];

  return (
    <div
      className="fixed inset-0 bg-slate-900/80 backdrop-blur-lg flex items-center justify-center p-4 z-[100]"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="first-contact-title"
    >
      <div
        className="bg-gradient-to-br from-slate-800 via-purple-900/40 to-slate-800 rounded-xl shadow-2xl border border-purple-700/60 p-6 sm:p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 transition-colors z-10"
          aria-label="Close first contact mode selection"
        >
          <XMarkIcon className="w-7 h-7" />
        </button>

        <div className="text-center mb-6">
          <SparklesIcon className="w-12 h-12 text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-500 mx-auto mb-2 animate-pulse" />
          <h2 id="first-contact-title" className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-500 to-orange-400">
            Connection Spark!
          </h2>
          <p className="text-slate-300 mt-1">
            Your personal CYRAiNO thinks there's potential with {agentTwo.agentName}'s CYRAiNO.
          </p>
          <p className="text-slate-400 text-sm">How would you like to feel it out?</p>
        </div>

        <div className="space-y-4">
          {options.map((opt) => (
            <ContactOptionCard key={opt.mode} {...opt} />
          ))}
        </div>

        <button
            onClick={onClose}
            className="mt-8 w-full bg-slate-700 hover:bg-slate-600 text-slate-300 font-medium py-2.5 px-6 rounded-lg transition-colors"
          >
            Decide Later
          </button>
      </div>
    </div>
  );
};