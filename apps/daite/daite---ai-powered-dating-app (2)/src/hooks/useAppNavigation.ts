import { useState, useCallback } from 'react';
import { ViewType } from '../types';

export const useAppNavigation = (initialView: ViewType = 'discover') => {
  const [currentView, setCurrentView] = useState<ViewType>(initialView);

  const navigateTo = useCallback((view: ViewType) => {
    setCurrentView(view);
  }, []);

  return {
    currentView,
    setCurrentView: navigateTo, // Provide direct setter as well if needed, or stick to navigateTo
  };
};