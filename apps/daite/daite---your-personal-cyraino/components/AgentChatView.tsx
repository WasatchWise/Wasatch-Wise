
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, DAgentProfile } from '../types';
import { ChatMessageBubble } from './ChatMessageBubble';
import { PaperAirplaneIcon } from './icons/PaperAirplaneIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { LoadingSpinner } from './LoadingSpinner'; // Simple text-based spinner for typing

interface AgentChatViewProps {
  userProfile: DAgentProfile; // The user's personal CYRAiNO profile being built
  chatMessages: ChatMessage[];
  onSendMessage: (messageContent: string) => void;
  isAgentTyping: boolean;
  chatError: string | null;
  cyranoAssistantProfile: DAgentProfile; // Profile of CYRAiNO the assistant
}

export const AgentChatView: React.FC<AgentChatViewProps> = ({
  userProfile,
  chatMessages,
  onSendMessage,
  isAgentTyping,
  chatError,
  cyranoAssistantProfile,
}) => {
  const [newMessage, setNewMessage] = useState('');
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to bottom when new messages arrive or agent starts/stops typing
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages, isAgentTyping]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewMessage(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() && !isAgentTyping) {
      onSendMessage(newMessage.trim());
      setNewMessage('');
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-var(--header-height-lg)-var(--header-height-sm)-8rem)] max-h-[700px] max-w-2xl mx-auto bg-slate-800/70 backdrop-blur-md shadow-2xl rounded-xl border border-slate-700 overflow-hidden">
      {/* Header for the chat view */}
      <div className="p-4 border-b border-slate-700 flex items-center space-x-3 bg-slate-800/50">
        <img 
            src={cyranoAssistantProfile.profileImage || 'https://source.unsplash.com/random/100x100/?bot,wise'} 
            alt={cyranoAssistantProfile.agentName} 
            className="w-10 h-10 rounded-full border-2 border-purple-500 object-cover"
        />
        <div>
            <h2 className="text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
              Chat with {cyranoAssistantProfile.agentName}
            </h2>
            <p className="text-xs text-slate-400">Your AI guide to crafting your personal CYRAiNO profile.</p>
        </div>
      </div>

      {/* Chat Messages Area */}
      <div ref={chatContainerRef} className="flex-1 p-4 sm:p-6 space-y-2 overflow-y-auto scroll-smooth">
        {chatMessages.map((msg, index) => (
          <ChatMessageBubble 
            key={msg.id} 
            message={msg}
            isLastMessage={index === chatMessages.length - 1}
          />
        ))}
        {isAgentTyping && (
          <div className="flex items-end mb-3 justify-start">
            <img src={cyranoAssistantProfile.profileImage} alt={cyranoAssistantProfile.agentName} className="w-10 h-10 rounded-full mr-3 border-2 border-purple-500 object-cover"/>
            <div className="max-w-[70%] sm:max-w-[60%] p-4 rounded-2xl shadow-md bg-slate-700 text-slate-100 rounded-bl-none border border-slate-600">
                <div className="flex space-x-1 items-center">
                    <span className="text-sm text-slate-300">{cyranoAssistantProfile.agentName} is typing</span>
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse delay-75"></div>
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse delay-150"></div>
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse delay-300"></div>
                </div>
            </div>
          </div>
        )}
        {chatError && (
           <div className="my-2 py-2 px-3 rounded-md bg-red-800/30 border border-red-600 text-red-200 text-sm">
            <strong>Error:</strong> {chatError}
          </div>
        )}
      </div>

      {/* Input Area */}
      <form onSubmit={handleSubmit} className="p-3 sm:p-4 border-t border-slate-700 bg-slate-800/50">
        <div className="flex items-center space-x-2 sm:space-x-3">
          <textarea
            value={newMessage}
            onChange={handleInputChange}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            placeholder="Talk to CYRAiNO..."
            rows={1}
            className="flex-1 p-3 bg-slate-700/50 border border-slate-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition-colors text-gray-100 placeholder-slate-400 resize-none scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-700/50"
            aria-label="Chat message input"
            disabled={isAgentTyping}
          />
          <button
            type="submit"
            disabled={isAgentTyping || !newMessage.trim()}
            className="p-3 rounded-lg bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-pink-400 focus:ring-opacity-50"
            aria-label="Send message"
          >
            <PaperAirplaneIcon className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>
      </form>
    </div>
  );
};