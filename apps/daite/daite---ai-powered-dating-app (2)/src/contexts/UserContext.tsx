import React, { createContext, useState, useContext, ReactNode } from 'react';
import { UserProfileType } from '../types';

interface UserContextType {
  userProfile: UserProfileType;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

// Define a default or initial user profile. This could also be fetched or set dynamically.
const initialUserProfile: UserProfileType = {
  name: 'You',
  age: 28,
  location: 'San Francisco, CA',
  interests: ['Photography', 'Hiking', 'Coffee', 'Books', 'Cooking'],
};

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [userProfile] = useState<UserProfileType>(initialUserProfile);

  return (
    <UserContext.Provider value={{ userProfile }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};