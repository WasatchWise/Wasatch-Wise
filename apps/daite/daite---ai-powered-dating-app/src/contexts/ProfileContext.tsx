import React, { createContext, useState, useContext, ReactNode, Dispatch, SetStateAction, useCallback } from 'react';
import { ProfileType } from '../types';
import { MOCK_PROFILES } from '../constants';

interface ProfileContextType {
  profiles: ProfileType[];
  setProfiles: Dispatch<SetStateAction<ProfileType[]>>;
  visibleProfiles: ProfileType[];
  setVisibleProfiles: Dispatch<SetStateAction<ProfileType[]>>;
  matches: ProfileType[];
  setMatches: Dispatch<SetStateAction<ProfileType[]>>;
  updateProfileInState: (profileId: number, updates: Partial<ProfileType>) => void;
  removeProfileFromDiscover: (profileId: number) => void;
  addMatch: (profile: ProfileType) => void;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const ProfileProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [profiles, setProfiles] = useState<ProfileType[]>(
    MOCK_PROFILES.map(p => ({ ...p, aiFirstImpression: null, isFetchingImpression: false }))
  );
  const [visibleProfiles, setVisibleProfiles] = useState<ProfileType[]>(
    MOCK_PROFILES.map(p => ({ ...p, aiFirstImpression: null, isFetchingImpression: false }))
  );
  const [matches, setMatches] = useState<ProfileType[]>([]);

  const updateProfileInState = useCallback((profileId: number, updates: Partial<ProfileType>) => {
    const updater = (prevProfiles: ProfileType[]) =>
      prevProfiles.map(p => (p.id === profileId ? { ...p, ...updates } : p));
    setProfiles(updater);
    setVisibleProfiles(updater);
  }, []);

  const removeProfileFromDiscover = useCallback((profileId: number) => {
    setVisibleProfiles(prev => prev.filter(p => p.id !== profileId));
  }, []);

  const addMatch = useCallback((profile: ProfileType) => {
    setMatches(prevMatches => {
      if (!prevMatches.find(m => m.id === profile.id)) {
        return [...prevMatches, profile];
      }
      return prevMatches;
    });
  }, []);

  return (
    <ProfileContext.Provider value={{
      profiles, setProfiles,
      visibleProfiles, setVisibleProfiles,
      matches, setMatches,
      updateProfileInState,
      removeProfileFromDiscover,
      addMatch
    }}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfilesContext = (): ProfileContextType => {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfilesContext must be used within a ProfileProvider');
  }
  return context;
};