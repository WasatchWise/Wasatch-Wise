import React, { createContext, useState, useContext, ReactNode, Dispatch, SetStateAction, useCallback } from 'react';
import { ProfileType, ChatMessageType } from '../types';
import { useCyrainoAI } from './CyrainoAIContext';


interface ChatContextType {
  selectedProfileForChat: ProfileType | null;
  setSelectedProfileForChat: Dispatch<SetStateAction<ProfileType | null>>;
  chatMessages: ChatMessageType[];
  setChatMessages: Dispatch<SetStateAction<ChatMessageType[]>>;
  newMessage: string;
  setNewMessage: Dispatch<SetStateAction<string>>;
  startChatHandler: (profile: ProfileType) => void;
  sendMessageHandler: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedProfileForChat, setSelectedProfileForChat] = useState<ProfileType | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessageType[]>([]);
  const [newMessage, setNewMessage] = useState<string>('');
  const { generateCyrainoChatSuggestion, isAIServiceAvailable } = useCyrainoAI();


  const startChatHandler = useCallback((profile: ProfileType) => {
    setSelectedProfileForChat(profile);
    setChatMessages([
      { sender: 'system', text: `You matched with ${profile.name}! Start the conversation.` },
      { sender: profile.name, text: `Hi! I saw we have some common interests. I love your profile! 😊` }
    ]);
  }, []);

  const sendMessageHandler = useCallback(() => {
    if (newMessage.trim() && selectedProfileForChat) {
      setChatMessages(prevMessages => [...prevMessages, { sender: 'You', text: newMessage }]);
      setNewMessage('');

      if(isAIServiceAvailable) {
        setTimeout(() => {
          generateCyrainoChatSuggestion();
        }, 1000);
      }
      
      setTimeout(() => {
         setChatMessages(prevMessages => [...prevMessages, { sender: selectedProfileForChat.name, text: "That's intriguing! How about we explore that idea further?" }]);
      }, 2500);
    }
  }, [newMessage, selectedProfileForChat, generateCyrainoChatSuggestion, isAIServiceAvailable]);

  return (
    <ChatContext.Provider value={{
      selectedProfileForChat, setSelectedProfileForChat,
      chatMessages, setChatMessages,
      newMessage, setNewMessage,
      startChatHandler,
      sendMessageHandler
    }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = (): ChatContextType => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};