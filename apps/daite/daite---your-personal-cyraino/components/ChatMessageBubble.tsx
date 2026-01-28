
import React from 'react';
import { ChatMessage, DAgentProfile } from '../types';
import { UserCircleIcon } from './icons/UserCircleIcon'; // User avatar
import { SparklesIcon } from './icons/SparklesIcon'; // Agent avatar (example)

interface ChatMessageBubbleProps {
  message: ChatMessage;
  isLastMessage?: boolean; // For potential focus or scroll effects
}

export const ChatMessageBubble: React.FC<ChatMessageBubbleProps> = ({ message, isLastMessage }) => {
  const isUser = message.role === 'user';
  const isAgent = message.role === 'agent';
  const isSystem = message.role === 'system';

  const agentProfile = message.agentProfile as Partial<DAgentProfile> | undefined;
  const agentImage = agentProfile?.profileImage || 'https://source.unsplash.com/random/100x100/?abstract,bot';
  const agentName = agentProfile?.agentName || 'Agent';

  if (isSystem) {
    return (
      <div className="my-2 py-2 px-3 text-xs text-center text-slate-500 italic">
        {message.content}
      </div>
    );
  }

  return (
    <div className={`flex items-end mb-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <img
          src={agentImage}
          alt={agentName}
          className="w-8 h-8 sm:w-10 sm:h-10 rounded-full mr-2 sm:mr-3 border-2 border-purple-500 object-cover"
          onError={(e) => (e.currentTarget.src = 'https://source.unsplash.com/random/100x100/?bot,abstract')}
        />
      )}
      <div
        className={`max-w-[70%] sm:max-w-[60%] p-3 sm:p-4 rounded-2xl shadow-md break-words ${
          isUser
            ? 'bg-gradient-to-br from-pink-600 to-purple-700 text-white rounded-br-none'
            : 'bg-slate-700 text-slate-100 rounded-bl-none border border-slate-600'
        }`}
      >
        {!isUser && agentName && (
          <p className="text-xs font-semibold text-purple-300 mb-1">{agentName}</p>
        )}
        <p className="text-sm sm:text-base leading-relaxed whitespace-pre-wrap">{message.content}</p>
        <p className={`text-xs mt-1.5 ${isUser ? 'text-purple-200/70 text-right' : 'text-slate-400/70 text-left'}`}>
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
      {isUser && (
         <UserCircleIcon className="w-8 h-8 sm:w-10 sm:h-10 rounded-full ml-2 sm:ml-3 text-pink-300 border-2 border-pink-500 p-0.5" />
      )}
    </div>
  );
};
