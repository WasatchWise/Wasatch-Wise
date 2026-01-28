import React, { createContext, useState, useContext, ReactNode, Dispatch, SetStateAction } from 'react';
import { INITIAL_TOKENS } from '../constants';

interface TokenContextType {
  tokens: number;
  setTokens: Dispatch<SetStateAction<number>>;
  spendTokens: (amount: number) => boolean; // Returns true if successful
  earnTokens: (amount: number) => void;
}

const TokenContext = createContext<TokenContextType | undefined>(undefined);

export const TokenProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [tokens, setTokens] = useState<number>(INITIAL_TOKENS);

  const spendTokens = (amount: number): boolean => {
    if (tokens >= amount) {
      setTokens(prevTokens => prevTokens - amount);
      return true;
    }
    return false;
  };

  const earnTokens = (amount: number): void => {
    setTokens(prevTokens => prevTokens + amount);
  };

  return (
    <TokenContext.Provider value={{ tokens, setTokens, spendTokens, earnTokens }}>
      {children}
    </TokenContext.Provider>
  );
};

export const useTokens = (): TokenContextType => {
  const context = useContext(TokenContext);
  if (!context) {
    throw new Error('useTokens must be used within a TokenProvider');
  }
  return context;
};