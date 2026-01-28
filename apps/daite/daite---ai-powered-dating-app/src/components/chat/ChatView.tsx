import React from 'react';
import { Send, Bot, X as XIcon, ArrowLeft } from 'lucide-react';
import { useChat } from '../../contexts/ChatContext';
import { useCyrainoAI } from '../../contexts/CyrainoAIContext';
import { useAppNavigation } from '../../hooks/useAppNavigation';
import { ViewType } from '../../types';

const ChatView: React.FC = () => {
  const { 
    selectedProfileForChat, 
    chatMessages, 
    newMessage, 
    setNewMessage, 
    sendMessageHandler 
  } = useChat();
  const { cyraino, setCyrainoActive } = useCyrainoAI();
  const { setCurrentView } = useAppNavigation();

  if (!selectedProfileForChat) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500 p-4">
        No profile selected for chat. Please go back to Matches.
        <button onClick={() => setCurrentView('matches')} className="ml-2 text-pink-500 underline">Go to Matches</button>
      </div>
    );
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessageHandler();
    }
  };

  return (
    <div className="max-w-2xl mx-auto h-[calc(100vh-4rem)] sm:h-[calc(100vh-5rem)] flex flex-col bg-gray-50 p-0 sm:p-4">
      <div className="flex items-center mb-4 bg-white rounded-t-lg sm:rounded-lg shadow-md p-3 sm:p-4 sticky top-16 sm:top-20 z-10">
        <button
          onClick={() => setCurrentView('matches')}
          className="mr-3 text-gray-600 hover:text-pink-500 transition-colors p-2 rounded-full hover:bg-gray-100"
          aria-label="Back to matches"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <img src={selectedProfileForChat.image} alt={selectedProfileForChat.name} className="w-10 h-10 sm:w-12 sm:h-12 rounded-full mr-3 sm:mr-4 object-cover" />
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-gray-800">{selectedProfileForChat.name}</h2>
          <p className="text-gray-600 text-xs sm:text-sm">{selectedProfileForChat.location}</p>
        </div>
      </div>

      <div className="flex-1 bg-white sm:rounded-lg shadow-md p-3 sm:p-6 mb-3 sm:mb-4 overflow-y-auto">
        {chatMessages.map((message, index) => (
          <div key={index} className={`mb-4 flex ${message.sender === 'You' ? 'justify-end' : 'justify-start'}`}>
            <div className={`inline-block p-3 rounded-xl max-w-[80%] shadow-sm ${
              message.sender === 'You'
                ? 'bg-pink-500 text-white rounded-br-none'
                : message.sender === 'system'
                ? 'bg-gray-200 text-gray-700 text-center w-full mx-auto text-sm italic'
                : 'bg-gray-100 text-gray-800 rounded-bl-none'
            }`}>
              {message.sender !== 'system' && message.sender !== 'You' && (
                <p className="text-xs font-semibold mb-1 text-purple-600">{message.sender}</p>
              )}
              <p className="whitespace-pre-wrap">{message.text}</p>
            </div>
          </div>
        ))}
      </div>

      {cyraino.active && (
        <div className="bg-purple-50 border-l-4 border-purple-500 p-4 mb-3 sm:mb-4 rounded-r-lg shadow">
          <div className="flex items-start">
            <Bot className="w-6 h-6 text-purple-600 mr-3 flex-shrink-0 mt-0.5" />
            <div className="flex-grow">
              <h4 className="font-semibold text-purple-800">CYRAINO Suggestion</h4>
              <p className="text-purple-700 text-sm">{cyraino.suggestion}</p>
            </div>
            <button
              onClick={() => setCyrainoActive(false)}
              className="ml-2 text-purple-500 hover:text-purple-700 transition-colors p-1 rounded-full hover:bg-purple-100"
              aria-label="Close suggestion"
            >
              <XIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      <div className="bg-white sm:rounded-lg shadow-md p-3 sm:p-4 flex items-center space-x-2 sm:space-x-3 sticky bottom-0 sm:bottom-4">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your message..."
          className="flex-1 border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-shadow"
          aria-label="Message input"
        />
        <button
          onClick={sendMessageHandler}
          disabled={!newMessage.trim()}
          className="bg-pink-500 text-white px-4 py-2.5 rounded-lg hover:bg-pink-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          aria-label="Send message"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default ChatView;