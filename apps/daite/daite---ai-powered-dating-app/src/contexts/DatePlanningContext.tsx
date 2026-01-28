import React, { createContext, useState, useContext, ReactNode, Dispatch, SetStateAction, useCallback } from 'react';
import { ProfileType, DatePlanType, UserProfileType } from '../types';
import { BASE_DATE_PLANS } from '../constants';
import { useTokens } from './TokenContext';
import { useUser } from './UserContext';

interface DatePlanningContextType {
  showDatePlanModal: boolean;
  setShowDatePlanModal: Dispatch<SetStateAction<boolean>>;
  profileToPlanFor: ProfileType | null;
  setProfileToPlanFor: Dispatch<SetStateAction<ProfileType | null>>;
  dateRecommendations: DatePlanType[];
  setDateRecommendations: Dispatch<SetStateAction<DatePlanType[]>>;
  planDateHandler: (profile: ProfileType) => void;
  bookDateHandler: (datePlan: DatePlanType) => void;
}

const DatePlanningContext = createContext<DatePlanningContextType | undefined>(undefined);

export const DatePlanningProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [showDatePlanModal, setShowDatePlanModal] = useState<boolean>(false);
  const [profileToPlanFor, setProfileToPlanFor] = useState<ProfileType | null>(null);
  const [dateRecommendations, setDateRecommendations] = useState<DatePlanType[]>([]);
  const { spendTokens } = useTokens();
  const { userProfile } = useUser();

  const generateDateRecommendations = useCallback((profile: ProfileType, currentUserProfile: UserProfileType): DatePlanType[] => {
        const commonInterests = profile.interests.filter(interest =>
            currentUserProfile.interests.some(userInt => userInt.toLowerCase().includes(interest.toLowerCase()) ||
            interest.toLowerCase().includes(userInt.toLowerCase()))
        );
        return BASE_DATE_PLANS.map((date, index) => ({
            ...date,
            id: Date.now() + index,
            customization: commonInterests.length > 0 
            ? `Tailored for your shared love of ${commonInterests.join(' and ')}.`
            : "A curated experience just for you two."
        }));
  }, []);

  const planDateHandler = useCallback((profile: ProfileType) => {
    setProfileToPlanFor(profile);
    const recommendations = generateDateRecommendations(profile, userProfile);
    setDateRecommendations(recommendations);
    setShowDatePlanModal(true);
  }, [generateDateRecommendations, userProfile]);

  const bookDateHandler = useCallback((datePlan: DatePlanType) => {
    if (spendTokens(datePlan.totalTokens)) {
      alert(`🎉 Date booked! Reservations confirmed for "${datePlan.type}" with ${profileToPlanFor?.name}. Check your email for details! Cost: ${datePlan.totalTokens} tokens.`);
      setShowDatePlanModal(false);
      setProfileToPlanFor(null);
    } else {
      alert("Not enough tokens to book this date.");
    }
  }, [spendTokens, profileToPlanFor]);

  return (
    <DatePlanningContext.Provider value={{
      showDatePlanModal, setShowDatePlanModal,
      profileToPlanFor, setProfileToPlanFor,
      dateRecommendations, setDateRecommendations,
      planDateHandler,
      bookDateHandler
    }}>
      {children}
    </DatePlanningContext.Provider>
  );
};

export const useDatePlanning = (): DatePlanningContextType => {
  const context = useContext(DatePlanningContext);
  if (!context) {
    throw new Error('useDatePlanning must be used within a DatePlanningProvider');
  }
  return context;
};