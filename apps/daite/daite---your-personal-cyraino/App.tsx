
import React, { useState, useCallback, useEffect, useRef } from 'react';
// Fix: Import SparklesIcon
import { SparklesIcon } from './components/icons/SparklesIcon';
import { DAgentProfile, CommunicationTone, MatchRecord, AgentInteraction, DateIdea, PlannedDateDetails, ReflectionData, VisualPreferenceResponse, DateStatus, FirstContactMode, FirstContactDetails, ChatMessage, AgentPersonaType, /* JournalEntry removed */ ProfileChatResponse, RelationshipGoal } from './types';
import { DEFAULT_AGENT_PROFILE, POST_DATE_REFLECTION_TAGS, MOCK_VISUAL_PREFERENCE_PHOTOS, CYRANO_ASSISTANT_PROFILE, INITIAL_CHAT_MESSAGE_CONTENT, MOCK_AGENT_PROFILES } from './constants';
import { AppHeader } from './components/AppHeader';
import { AppNavigation, View } from './components/AppNavigation';
import { DAgentProfileForm } from './components/DAgentProfileForm';
import { AgentChatView } from './components/AgentChatView'; 
// import { JournalView } from './components/JournalView'; // Removed
import { DiscoverView } from './components/DiscoverView';
import { MatchesView } from './components/MatchesView';
import { VisualPreferenceView } from './components/VisualPreferenceView';
import { AgentInteractionModal } from './components/AgentInteractionModal';
import { DatePlannerModal } from './components/DatePlannerModal';
import { TokenPromptModal } from './components/TokenPromptModal';
import { PostDateReflectionModal } from './components/PostDateReflectionModal';
import { FirstContactModeModal } from './components/FirstContactModeModal';
// import { PremiumModal } from './components/PremiumModal'; // Removed
import { simulateAgentDialogue, generateDateIdeas, chatWithAgentAndExtractProfile } from './services/geminiService';

const App: React.FC = () => {
  const [userProfile, setUserProfile] = useState<DAgentProfile>(DEFAULT_AGENT_PROFILE);
  const [isSavingProfile, setIsSavingProfile] = useState<boolean>(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<View>('agentChat'); 

  const [matches, setMatches] = useState<MatchRecord[]>([]);
  const [isInteracting, setIsInteracting] = useState<boolean>(false);
  const [currentInteraction, setCurrentInteraction] = useState<AgentInteraction | null>(null);
  const [showInteractionModal, setShowInteractionModal] = useState<boolean>(false);

  const [showDatePlannerModal, setShowDatePlannerModal] = useState<boolean>(false);
  const [currentMatchForPlanning, setCurrentMatchForPlanning] = useState<MatchRecord | null>(null);
  const [isPlanningDate, setIsPlanningDate] = useState<boolean>(false);
  const [datePlannerError, setDatePlannerError] = useState<string | null>(null);
  const [generatedDateIdeasState, setGeneratedDateIdeasState] = useState<DateIdea[] | null>(null);
  const [currentPlannedDetails, setCurrentPlannedDetails] = useState<Partial<PlannedDateDetails> | null>(null);
  const [currentDatePlanningOptions, setCurrentDatePlanningOptions] = useState<{ isBlindDate?: boolean }>({});

  const [vibeTokens, setVibeTokens] = useState<number>(3); 
  const [showTokenPromptModal, setShowTokenPromptModal] = useState<boolean>(false);

  const [showReflectionModal, setShowReflectionModal] = useState<boolean>(false);
  const [matchForReflection, setMatchForReflection] = useState<MatchRecord | null>(null);

  const [visualPreferences, setVisualPreferences] = useState<VisualPreferenceResponse[]>([]);
  const [isVisualCalibrationComplete, setIsVisualCalibrationComplete] = useState<boolean>(false);

  const [showFirstContactModeModal, setShowFirstContactModeModal] = useState<boolean>(false);
  const [matchForFirstContactMode, setMatchForFirstContactMode] = useState<MatchRecord | null>(null);

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isAgentTyping, setIsAgentTyping] = useState<boolean>(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const initializedChat = useRef(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null); 

  const [discoveredPotentialMatches, setDiscoveredPotentialMatches] = useState<MatchRecord[]>([]);
  const [isDiscoveringNewMatches, setIsDiscoveringNewMatches] = useState<boolean>(false);
  const [discoverError, setDiscoverError] = useState<string | null>(null);

  // const [isPremiumUser, setIsPremiumUser] = useState<boolean>(false); // Removed
  // const [showPremiumModal, setShowPremiumModal] = useState<boolean>(false); // Removed

  useEffect(() => {
    if (!initializedChat.current && chatMessages.length === 0) {
      setChatMessages([
        {
          id: `system-cyrano-greeting-${Date.now()}`,
          role: 'agent', 
          content: INITIAL_CHAT_MESSAGE_CONTENT,
          timestamp: new Date(),
          agentProfile: CYRANO_ASSISTANT_PROFILE, 
        }
      ]);
      initializedChat.current = true;
    }
  }, [chatMessages.length]);

  const displayToast = (message: string, duration: number = 3000) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), duration);
  };

  const handleProfileChange = useCallback(<K extends keyof DAgentProfile>(field: K, value: DAgentProfile[K]) => {
    setUserProfile(prevProfile => ({
      ...prevProfile,
      [field]: value,
    }));
  }, []);

  const handleToneChange = useCallback((toneKey: keyof CommunicationTone, value: number) => {
    setUserProfile(prevProfile => ({
      ...prevProfile,
      communicationTone: {
        ...prevProfile.communicationTone,
        [toneKey]: value,
      }
    }));
  }, []);

  const handleSaveProfile = useCallback(async () => { 
    setIsSavingProfile(true);
    setProfileError(null);
    console.log("Saving user's personal CYRAiNO profile (simulated):", userProfile);
    await new Promise(resolve => setTimeout(resolve, 1000)); 
    setIsSavingProfile(false);
    displayToast("Your CYRAiNO's profile saved!"); 
  }, [userProfile]);

  const handleSendMessageToAgent = useCallback(async (messageContent: string) => {
    if (!messageContent.trim()) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: messageContent,
      timestamp: new Date(),
    };
    setChatMessages(prev => [...prev, userMessage]);
    setIsAgentTyping(true);
    setChatError(null);

    const response: ProfileChatResponse | {error: string} = await chatWithAgentAndExtractProfile(
      [...chatMessages, userMessage], 
      userProfile, 
      messageContent
    );

    setIsAgentTyping(false);
    if ('error' in response) {
      setChatError(response.error);
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        role: 'system',
        content: `Error: ${response.error}`,
        timestamp: new Date(),
      };
      setChatMessages(prev => [...prev, errorMessage]);
    } else {
      const agentResponse: ChatMessage = {
        id: `agent-${Date.now()}`, 
        role: 'agent',
        content: response.chatResponse,
        timestamp: new Date(),
        agentProfile: CYRANO_ASSISTANT_PROFILE, 
      };
      setChatMessages(prev => [...prev, agentResponse]);

      if (response.profileUpdate) {
        setUserProfile(prevProfile => {
          const updatedProfile = { ...prevProfile };
          for (const key in response.profileUpdate) {
            const typedKey = key as keyof DAgentProfile;
            const newValue = response.profileUpdate[typedKey]; 

            if (newValue === undefined) { 
              continue;
            }
            const existingValue = updatedProfile[typedKey];
            if ((typedKey === 'coreValues' || typedKey === 'hobbiesInterests' || typedKey === 'dealbreakers') &&
                Array.isArray(existingValue) &&
                Array.isArray(newValue)) {
              updatedProfile[typedKey] = Array.from(new Set([...(existingValue as string[]), ...(newValue as string[])])) as DAgentProfile[typeof typedKey];
            } else if (typedKey === 'communicationTone' &&
                       typeof existingValue === 'object' && existingValue !== null && !Array.isArray(existingValue) &&
                       typeof newValue === 'object' && newValue !== null && !Array.isArray(newValue)) {
              updatedProfile[typedKey] = {
                ...(existingValue as CommunicationTone),
                ...(newValue as Partial<CommunicationTone>)
              } as DAgentProfile[typeof typedKey];
            } else if (
                !( (typedKey === 'coreValues' || typedKey === 'hobbiesInterests' || typedKey === 'dealbreakers') && Array.isArray(existingValue) ) &&
                !( typedKey === 'communicationTone' && typeof existingValue === 'object' && existingValue !== null ) &&
                 (typedKey === 'agentName' || typedKey === 'agentPersonaType' || typedKey === 'personaBackstory' || typedKey === 'relationshipGoal' || typedKey === 'profileImage')
            ) {
              (updatedProfile as any)[typedKey] = newValue as any;
            }
          }
          console.log("User's personal CYRAiNO profile updated via chat with System CYRAiNO:", updatedProfile);
          displayToast("Your CYRAiNO's profile was subtly updated by the Coach!", 2000);
          return updatedProfile;
        });
      }
    }
  }, [chatMessages, userProfile]);
  
  const handleRunGlobalVibeCheck = useCallback(async () => {
    if (vibeTokens <= 0) {
      setShowTokenPromptModal(true); 
      return;
    }
    
    setIsDiscoveringNewMatches(true);
    setDiscoveredPotentialMatches([]);
    setDiscoverError(null);
    setVibeTokens(prev => prev - 1); 

    const potentialCandidates = MOCK_AGENT_PROFILES.filter(
      p => p.id !== userProfile.id && 
           !matches.some(m => m.agentTwo.id === p.id) &&
           !discoveredPotentialMatches.some(dpm => dpm.agentTwo.id === p.id) 
    ).slice(0, 3); 

    if (potentialCandidates.length === 0) {
        setDiscoverError("No new CYRAiNOs available to check vibes with at the moment. Try again later!");
        setIsDiscoveringNewMatches(false);
        return;
    }

    const newDiscoveries: MatchRecord[] = [];
    let anyErrorOccurred = false;

    for (const candidateAgent of potentialCandidates) {
      const interactionResult = await simulateAgentDialogue(userProfile, candidateAgent);
      if (interactionResult.error) {
        console.error(`Error simulating dialogue with ${candidateAgent.agentName}: ${interactionResult.error}`);
        anyErrorOccurred = true; 
        continue; 
      }

      if (interactionResult.matchDecision === "YES") {
        const fullInteraction: AgentInteraction = {
          ...interactionResult,
          interactingAgents: { userAgent: userProfile, otherAgent: candidateAgent },
        };
        const newMatchRecord: MatchRecord = {
          id: `${userProfile.id}-${candidateAgent.id}-${new Date().getTime()}-discovered`,
          agentOne: userProfile,
          agentTwo: candidateAgent,
          interactionDetails: fullInteraction,
          matchedAt: new Date().toISOString(), 
          firstContact: { mode: null, status: 'pending_choice' }, 
          plannedDateDetails: null,
        };
        newDiscoveries.push(newMatchRecord);
      }
    }

    setDiscoveredPotentialMatches(newDiscoveries);
    setIsDiscoveringNewMatches(false);

    if (newDiscoveries.length === 0 && !anyErrorOccurred) {
      setDiscoverError("No strong vibes found this round. Your CYRAiNO will keep searching!");
    } else if (newDiscoveries.length === 0 && anyErrorOccurred) {
      setDiscoverError("Some vibe checks had issues. Try again, or if problems persist, check console.");
    } else if (newDiscoveries.length > 0) {
      displayToast(`${newDiscoveries.length} potential new vibe(s) found!`, 2500);
    }

  }, [userProfile, matches, vibeTokens, discoveredPotentialMatches]);

  const handleAcceptDiscoveredMatch = useCallback((matchToAccept: MatchRecord) => {
    setMatches(prevMatches => [...prevMatches, { ...matchToAccept, id: `${matchToAccept.agentOne.id}-${matchToAccept.agentTwo.id}-${Date.now()}-accepted` }]);
    setDiscoveredPotentialMatches(prev => prev.filter(m => m.id !== matchToAccept.id));
    setMatchForFirstContactMode(matchToAccept); 
    setShowFirstContactModeModal(true); 
    displayToast(`${matchToAccept.agentTwo.agentName}'s CYRAiNO added to your Matches! Choose your first contact.`, 3500);
  }, []); 

  const handleDeclineDiscoveredMatch = useCallback((matchIdToDecline: string) => {
    setDiscoveredPotentialMatches(prev => prev.filter(m => m.id !== matchIdToDecline));
    const declinedMatch = discoveredPotentialMatches.find(m => m.id === matchIdToDecline);
     if(declinedMatch) {
        displayToast(`You've passed on the vibe with ${declinedMatch.agentTwo.agentName}'s CYRAiNO.`, 2500);
     }
  }, [discoveredPotentialMatches]);

  const handleViewInteractionForDiscovered = useCallback((interaction: AgentInteraction) => {
    setCurrentInteraction(interaction);
    setShowInteractionModal(true);
  }, []);

  const handleConnectWithAgent = useCallback(async (otherAgent: DAgentProfile) => {
    if (vibeTokens <= 0) {
      setShowTokenPromptModal(true);
      return;
    }
    setIsInteracting(true);
    setCurrentInteraction(null); 
    setShowInteractionModal(true); 
    setVibeTokens(prev => prev - 1);

    const result = await simulateAgentDialogue(userProfile, otherAgent);
    const fullInteraction: AgentInteraction = {
      ...result,
      interactingAgents: { userAgent: userProfile, otherAgent: otherAgent },
    };
    setCurrentInteraction(fullInteraction);
    setIsInteracting(false);

    if (result.matchDecision === "YES" && !result.error) {
      setMatches(prevMatches => {
        if (prevMatches.some(m => m.agentTwo.id === otherAgent.id)) {
          return prevMatches; 
        }
        const newMatch: MatchRecord = {
          id: `${userProfile.id}-${otherAgent.id}-${new Date().getTime()}`,
          agentOne: userProfile,
          agentTwo: otherAgent,
          interactionDetails: fullInteraction,
          matchedAt: new Date().toISOString(),
          firstContact: { mode: null, status: 'pending_choice' },
          plannedDateDetails: null,
        };
        return [...prevMatches, newMatch];
      });
    }
  }, [userProfile, vibeTokens]);

  const handleCloseInteractionModal = useCallback(() => {
    setShowInteractionModal(false);
    setCurrentInteraction(null);
  }, []);

  const handleDateAction = useCallback((match: MatchRecord, action: 'choose_first_contact' | 'plan' | 'continue_plan' | 'log_reflection' | 'view_reflection') => {
    setDatePlannerError(null);
    setGeneratedDateIdeasState(null);

    if (action === 'choose_first_contact') {
        setMatchForFirstContactMode(match);
        setShowFirstContactModeModal(true);
    } else if (action === 'plan' || action === 'continue_plan') {
        setCurrentMatchForPlanning(match);
        setCurrentDatePlanningOptions({ isBlindDate: match.firstContact.mode === 'blind_date' });
        
        if (match.plannedDateDetails && match.plannedDateDetails.selectedDateIdea) {
            setCurrentPlannedDetails(match.plannedDateDetails); 
            setGeneratedDateIdeasState([match.plannedDateDetails.selectedDateIdea]); 
        } else {
             setCurrentPlannedDetails({ status: DateStatus.IDEAS_GENERATED }); 
        }
        setShowDatePlannerModal(true);
        
        if (!match.plannedDateDetails?.selectedDateIdea && action === 'plan') { 
            fetchDateIdeas(userProfile, match.agentTwo, match.interactionDetails.summary, match.firstContact.mode === 'blind_date');
        }

    } else if (action === 'log_reflection' || action === 'view_reflection') {
        setMatchForReflection(match);
        setShowReflectionModal(true);
    }
  }, [userProfile]);

  const handleCloseDatePlannerModal = useCallback(() => {
    setShowDatePlannerModal(false);
    setCurrentMatchForPlanning(null);
    setGeneratedDateIdeasState(null);
    setCurrentPlannedDetails(null);
    setDatePlannerError(null);
  }, []);

  const fetchDateIdeas = async (agentOne: DAgentProfile, agentTwo: DAgentProfile, summary: string, isBlindDate?: boolean) => {
    setIsPlanningDate(true);
    setDatePlannerError(null);
    setGeneratedDateIdeasState(null);
    const ideasResult = await generateDateIdeas(agentOne, agentTwo, summary, isBlindDate);
    if ('error' in ideasResult) {
      setDatePlannerError(ideasResult.error);
    } else {
      setGeneratedDateIdeasState(ideasResult);
      setCurrentPlannedDetails(prev => ({ ...prev, status: DateStatus.IDEAS_GENERATED }));
    }
    setIsPlanningDate(false);
  };

  const handleSelectDateIdea = useCallback((idea: DateIdea) => {
    if (!currentMatchForPlanning) return;
    setCurrentPlannedDetails({
      selectedDateIdea: idea,
      status: DateStatus.IDEA_SELECTED,
      calendarStatus: 'pending_check',
      transportationStatus: 'pending',
      isBlindDate: currentMatchForPlanning.firstContact.mode === 'blind_date'
    });
  }, [currentMatchForPlanning]);

  const handleConfirmTimeSlot = useCallback(async (timeSlot: string) => {
    if (!currentMatchForPlanning || !currentPlannedDetails?.selectedDateIdea) return;
    setIsPlanningDate(true); 
    
    const updatedPlannedDetails: PlannedDateDetails = {
      ...currentPlannedDetails,
      selectedTimeSlot: timeSlot,
      status: DateStatus.TIME_SLOT_CONFIRMED, 
      calendarStatus: 'checking', 
    } as PlannedDateDetails; 

    setCurrentPlannedDetails(updatedPlannedDetails);
    
    await new Promise(resolve => setTimeout(resolve, 1500)); 
    
    const finalDetails: PlannedDateDetails = {
        ...updatedPlannedDetails,
        status: DateStatus.BOOKED_BY_CYRANO,
        calendarStatus: 'virtual_all_clear',
        transportationStatus: 'virtually_sorted',
    };
    setCurrentPlannedDetails(finalDetails);

    setMatches(prevMatches => prevMatches.map(m => 
      m.id === currentMatchForPlanning.id ? { ...m, plannedDateDetails: finalDetails } : m
    ));
    setIsPlanningDate(false); 
  }, [currentMatchForPlanning, currentPlannedDetails]);


  const handleGrantDemoToken = useCallback(() => {
    setVibeTokens(prev => prev + 1);
    setShowTokenPromptModal(false);
    displayToast("1 Free Demo Vibe Token granted!", 2000);
  }, []);

  const handleSubmitReflection = useCallback((matchId: string, reflectionData: ReflectionData) => {
    setMatches(prevMatches => prevMatches.map(m => {
      if (m.id === matchId) {
        return {
          ...m,
          plannedDateDetails: {
            ...(m.plannedDateDetails as PlannedDateDetails), 
            reflectionNotes: reflectionData.notes,
            reflectionTags: reflectionData.tags,
            status: DateStatus.REFLECTION_SUBMITTED,
            reflectionGivenAt: new Date().toISOString(),
          }
        };
      }
      return m;
    }));
    setShowReflectionModal(false);
    setMatchForReflection(null);
    displayToast("Reflection submitted! CYRAiNO is learning.", 2500);
  }, []);

 const handleVisualPreferencesSubmit = useCallback((responses: VisualPreferenceResponse[]) => {
    setVisualPreferences(responses);
    setIsVisualCalibrationComplete(true); 
    console.log("Visual DNA Preferences Submitted:", responses);
    setUserProfile(prev => ({
      ...prev,
    }));
    displayToast("Visual DNA calibrated! Your personal CYRAiNO is now even more attuned to your vibe.", 3000);
  }, []);

  const handleSelectFirstContactMode = useCallback((matchId: string, mode: FirstContactMode) => {
    setMatches(prevMatches => prevMatches.map(m => {
        if (m.id === matchId) {
            const updatedMatch = {
                ...m,
                firstContact: {
                    mode: mode,
                    status: (mode === 'text' || mode === 'video') ? 'initiated' : 'awaiting_date_plan',
                    initiatedAt: new Date().toISOString(),
                } as FirstContactDetails,
            };
            if (mode === 'in_person' || mode === 'blind_date') {
                handleDateAction(updatedMatch, 'plan');
            } else {
                 displayToast(`Simulated ${mode} chat initiated with ${m.agentTwo.agentName}'s CYRAiNO!`, 2500);
            }
            return updatedMatch;
        }
        return m;
    }));
    setShowFirstContactModeModal(false);
    setMatchForFirstContactMode(null);
  }, [handleDateAction]);

   const handlePurchaseTokenPack = useCallback((tokensToAdd: number, packName: string) => {
    setVibeTokens(prev => prev + tokensToAdd);
    displayToast(`${packName} purchased! ${tokensToAdd} Vibe Tokens added.`, 2500);
    setShowTokenPromptModal(false); 
  }, []);

  // Removed handleUpgradeToPremium callback


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-purple-900/30 text-slate-100 font-sans">
      <AppHeader vibeTokens={vibeTokens} />
      <AppNavigation currentView={currentView} setCurrentView={setCurrentView} />

      <main className="container mx-auto px-4 py-2 sm:py-4">
        {currentView === 'profile' && (
          <DAgentProfileForm 
            profile={userProfile} 
            onProfileChange={handleProfileChange}
            onToneChange={handleToneChange}
            onSave={handleSaveProfile}
            isSaving={isSavingProfile}
            error={profileError}
          />
        )}
        {currentView === 'agentChat' && (
           <AgentChatView 
             userProfile={userProfile}
             chatMessages={chatMessages}
             onSendMessage={handleSendMessageToAgent}
             isAgentTyping={isAgentTyping}
             chatError={chatError}
             cyranoAssistantProfile={CYRANO_ASSISTANT_PROFILE}
           />
        )}
        {currentView === 'visualCalibration' && (
          <VisualPreferenceView 
            photos={MOCK_VISUAL_PREFERENCE_PHOTOS} 
            onSubmit={handleVisualPreferencesSubmit}
            isComplete={isVisualCalibrationComplete}
          />
        )}
        {currentView === 'discover' && (
          <DiscoverView 
            userProfile={userProfile}
            discoveredPotentialMatches={discoveredPotentialMatches}
            isDiscovering={isDiscoveringNewMatches}
            error={discoverError}
            onRunGlobalVibeCheck={handleRunGlobalVibeCheck}
            onAcceptMatch={handleAcceptDiscoveredMatch}
            onDeclineMatch={handleDeclineDiscoveredMatch}
            onViewInteraction={handleViewInteractionForDiscovered}
          />
        )}
        {currentView === 'matches' && (
          <MatchesView 
            matches={matches} 
            onViewInteraction={(interaction) => {
              setCurrentInteraction(interaction);
              setShowInteractionModal(true);
            }}
            onDateAction={handleDateAction}
          />
        )}
      </main>

      {showInteractionModal && (
        <AgentInteractionModal 
          isOpen={showInteractionModal}
          onClose={handleCloseInteractionModal}
          interaction={currentInteraction}
          isLoading={isInteracting}
        />
      )}

      {showDatePlannerModal && currentMatchForPlanning && (
        <DatePlannerModal
          isOpen={showDatePlannerModal}
          onClose={handleCloseDatePlannerModal}
          match={currentMatchForPlanning}
          isLoading={isPlanningDate}
          error={datePlannerError}
          dateIdeas={generatedDateIdeasState}
          plannedDetails={currentPlannedDetails}
          isBlindDateContext={currentDatePlanningOptions.isBlindDate || false}
          onSelectIdea={handleSelectDateIdea}
          onConfirmTimeSlot={handleConfirmTimeSlot}
        />
      )}
      
      {showTokenPromptModal && (
        <TokenPromptModal
          isOpen={showTokenPromptModal}
          onClose={() => setShowTokenPromptModal(false)}
          onGrantToken={handleGrantDemoToken} 
        />
      )}

      {showReflectionModal && matchForReflection && (
        <PostDateReflectionModal
          isOpen={showReflectionModal}
          onClose={() => { setShowReflectionModal(false); setMatchForReflection(null); }}
          match={matchForReflection}
          onSubmitReflection={handleSubmitReflection}
          reflectionTagsOptions={POST_DATE_REFLECTION_TAGS}
        />
      )}

      {showFirstContactModeModal && matchForFirstContactMode && (
        <FirstContactModeModal
            isOpen={showFirstContactModeModal}
            onClose={() => { setShowFirstContactModeModal(false); setMatchForFirstContactMode(null);}}
            match={matchForFirstContactMode}
            onSelectMode={handleSelectFirstContactMode}
        />
      )}

      {/* PremiumModal rendering removed */}


      {toastMessage && (
        <div className="fixed bottom-5 right-5 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-3 rounded-lg shadow-xl animate-pulse z-[200]">
          {toastMessage}
        </div>
      )}

    </div>
  );
};

export default App;
