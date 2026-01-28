import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';
import { CyrainoStateType, ProfileType } from '../types';
import { getIsAIServiceAvailable, generateAIContent } from '../api/genai';
import { useTokens } from './TokenContext';
import { useProfilesContext } from './ProfileContext';
import { CYRAINO_SUGGESTIONS } from '../constants';

interface CyrainoAIContextType {
  cyraino: CyrainoStateType;
  setCyrainoActive: (active: boolean) => void;
  isAIServiceAvailable: boolean;
  getAIFirstImpressionHandler: (profileId: number) => Promise<void>;
  generateCyrainoChatSuggestion: () => void;
}

const CyrainoAIContext = createContext<CyrainoAIContextType | undefined>(undefined);

export const CyrainoAIProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cyraino, setCyraino] = useState<CyrainoStateType>({ active: false, suggestion: '' });
  const { spendTokens, earnTokens } = useTokens();
  const { profiles, updateProfileInState } = useProfilesContext();
  const isAIServiceAvailable = getIsAIServiceAvailable();

  const setCyrainoActive = useCallback((active: boolean) => {
    setCyraino(prev => ({ ...prev, active }));
  }, []);

  const getAIFirstImpressionHandler = useCallback(async (profileId: number) => {
    if (!isAIServiceAvailable) {
      alert("CYRAINO AI features are currently unavailable.");
      return;
    }

    const profileToUpdate = profiles.find(p => p.id === profileId);
    if (!profileToUpdate || profileToUpdate.aiFirstImpression || profileToUpdate.isFetchingImpression) {
      return;
    }

    const glimpseCost = 1;
    if (!spendTokens(glimpseCost)) {
      alert("Not enough tokens to get CYRAINO's Glimpse.");
      return;
    }

    updateProfileInState(profileId, { isFetchingImpression: true });

    try {
      const prompt = `Generate a very short (1-2 sentences, under 25 words) and intriguing first impression for a dating app user. Their pseudonym is '${profileToUpdate.name}' and they have a ${profileToUpdate.compatibility}% compatibility score with the viewer. Be friendly and slightly mysterious, like an AI companion hinting at potential. Do not mention the compatibility score directly in the output.`;
      const impression = await generateAIContent(prompt);
      updateProfileInState(profileId, { aiFirstImpression: impression, isFetchingImpression: false });
    } catch (error) {
      console.error("Error fetching AI Glimpse:", error);
      alert("CYRAINO had trouble forming a thought... Try again later?");
      updateProfileInState(profileId, { isFetchingImpression: false });
      earnTokens(glimpseCost); // Refund token
    }
  }, [isAIServiceAvailable, profiles, spendTokens, earnTokens, updateProfileInState]);
  
  const generateCyrainoChatSuggestion = useCallback(() => {
    if (!isAIServiceAvailable) return;
    const suggestion = CYRAINO_SUGGESTIONS[Math.floor(Math.random() * CYRAINO_SUGGESTIONS.length)];
    setCyraino({ active: true, suggestion });
  }, [isAIServiceAvailable]);


  return (
    <CyrainoAIContext.Provider value={{ 
        cyraino, 
        setCyrainoActive, 
        isAIServiceAvailable, 
        getAIFirstImpressionHandler,
        generateCyrainoChatSuggestion
    }}>
      {children}
    </CyrainoAIContext.Provider>
  );
};

export const useCyrainoAI = (): CyrainoAIContextType => {
  const context = useContext(CyrainoAIContext);
  if (!context) {
    throw new Error('useCyrainoAI must be used within a CyrainoAIProvider');
  }
  return context;
};