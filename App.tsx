import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { Footer } from './components/Footer';
import { About } from './components/About';
import { RequestForm } from './components/RequestForm';
import { RequestList } from './components/RequestList';
import { MyTasks } from './components/MyTasks';
import { Resources } from './components/Resources';
import { MyRequests } from './components/MyRequests';
import { GroceryHelperModal } from './components/GroceryHelperModal';
import { WelcomeModal } from './components/WelcomeModal';
import { InstallBanner } from './components/InstallBanner';
import { CommunityGuidelines } from './components/CommunityGuidelines';
import { Request, RequestStatus, AvailableRequest, PrivacyLevel } from './types';
import { HelpListAPI } from './services/supabaseService';
import { openNotificationPrompt } from './utils/notifications';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<'home' | 'about' | 'safety'>('home');
  const [availableRequests, setAvailableRequests] = useState<AvailableRequest[]>([]);
  const [myTasks, setMyTasks] = useState<Request[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'needHelp' | 'offerHelp'>('offerHelp');
  const [needHelpView, setNeedHelpView] = useState<'form' | 'myRequests' | 'resources'>('form');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<Request | AvailableRequest | null>(null);
  const [showWelcome, setShowWelcome] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const HELPER_ID = "00000000-0000-0000-0000-000000000001"; // Placeholder UUID
  const HELPER_DISPLAY_NAME = "HelperBunny42";

  const fetchAllRequests = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const [availableRes, myTasksRes] = await Promise.all([
        HelpListAPI.getAvailableRequests(),
        HelpListAPI.getMyTasks(HELPER_ID)
      ]);

      if (availableRes.error) throw new Error(availableRes.error.message);
      setAvailableRequests(availableRes.data || []);

      if (myTasksRes.error) throw new Error(myTasksRes.error.message);
      setMyTasks(myTasksRes.data || []);

      setLastUpdated(new Date());

    } catch (e: any) {
      setError(`Could not load requests: ${e.message}. Please try refreshing the page.`);
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllRequests();

    // Real-time subscriptions (only if using Supabase)
    if (typeof window !== 'undefined') {
      // Poll for updates every 30 seconds as fallback
      const interval = setInterval(() => {
        fetchAllRequests();
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [fetchAllRequests]);

  // Check for first visit
  useEffect(() => {
    const hasVisited = localStorage.getItem('helplist::has_visited');
    if (!hasVisited) {
      setShowWelcome(true);
    }
  }, []);

  const handleCloseWelcome = useCallback(() => {
    localStorage.setItem('helplist::has_visited', 'true');
    setShowWelcome(false);
  }, []);

  const addRequest = useCallback(async (newRequestData: { displayName: string, need: string, city: string, contactMethod: 'text' | 'email', contactInfo: string, urgency: 'today' | 'tomorrow' | 'this_week' | 'flexible' }) => {
    try {
      const res = await HelpListAPI.createRequest(newRequestData);
      if (res.error) throw new Error(res.error.message);

      // Track this request in localStorage for "My Requests"
      if (res.data?.id) {
        const myRequestIds = JSON.parse(localStorage.getItem('helplist::my_request_ids') || '[]');
        localStorage.setItem('helplist::my_request_ids', JSON.stringify([...myRequestIds, res.data.id]));
      }

      await fetchAllRequests();
    } catch (e: any) {
      console.error("Failed to add request:", e);
      alert(`There was an error submitting your request: ${e.message}. Please try again.`);
      throw e;
    }
  }, [fetchAllRequests]);

  const claimRequest = useCallback(async (id: string) => {
    try {
      // Find the request before claiming to get requester info
      const requestToClaim = availableRequests.find(req => req.id === id);

      const res = await HelpListAPI.claimRequest(id, HELPER_ID, HELPER_DISPLAY_NAME);
      if (res.error) throw new Error(res.error.message);

      // Prompt helper to notify requester
      if (requestToClaim && requestToClaim.contactInfo && requestToClaim.contactMethod) {
        setTimeout(() => {
          openNotificationPrompt({
            requesterName: requestToClaim.requester_display_name,
            helperName: HELPER_DISPLAY_NAME,
            need: requestToClaim.need,
            contactMethod: requestToClaim.contactMethod,
            contactInfo: requestToClaim.contactInfo,
            urgency: requestToClaim.urgency_level,
          });
        }, 500); // Small delay so the UI updates first
      }

      await fetchAllRequests();
    } catch (e: any) {
      console.error("Failed to claim request:", e);
      alert(`There was an error claiming this request: ${e.message}. Please try again.`);
    }
  }, [fetchAllRequests, availableRequests]);

  const completeRequest = useCallback(async (id: string) => {
    try {
      const res = await HelpListAPI.updateRequestStatus(id, RequestStatus.DELIVERED);
      if (res.error) throw new Error(res.error.message);
      await fetchAllRequests();
    } catch (e: any) {
      console.error("Failed to complete request:", e);
      alert(`There was an error completing this request: ${e.message}. Please try again.`);
    }
  }, [fetchAllRequests]);
  
  const openGroceryHelper = useCallback((request: Request | AvailableRequest) => {
    setSelectedRequest(request);
    setIsModalOpen(true);
  }, []);

  const closeGroceryHelper = useCallback(() => {
    setIsModalOpen(false);
    setSelectedRequest(null);
  }, []);

  const handleShareRequest = useCallback(async (request: AvailableRequest) => {
    if (navigator.share) {
        try {
            await navigator.share({
                title: 'Help Needed: The Help List',
                text: `A neighbor in ${request.city || request.location_description} needs help. \n\nNeed: "${request.need}"\n\nCan you help? Find this request on The Help List.`,
            });
        } catch (error) {
            console.error('Error sharing:', error);
        }
    }
  }, []);

  const SubNavButton: React.FC<{
      label: string;
      isActive: boolean;
      onClick: () => void;
    }> = ({ label, isActive, onClick }) => {
      const baseClasses = "flex-1 text-center px-4 py-2 rounded-md font-semibold transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-dignity-purple text-sm";
      const activeClasses = "bg-dignity-purple text-white shadow";
      const inactiveClasses = "bg-transparent text-dignity-purple hover:bg-surface-private";
      return (
        <button onClick={onClick} className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}>
          {label}
        </button>
      );
  };

  const LoadingIndicator = () => (
    <div className="text-center py-10">
      <p className="text-lg font-semibold text-dignity-purple">Loading requests...</p>
    </div>
  );

  const ErrorIndicator = () => (
    <div className="text-center py-10 px-6 bg-red-50 rounded-xl shadow-md border border-red-200">
        <h3 className="text-xl font-semibold font-display text-red-700">Something went wrong</h3>
        <p className="text-red-600 mt-2">{error}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-surface-secondary flex flex-col">
      <Navigation currentPage={currentPage} onNavigate={setCurrentPage} onShowHelp={() => setShowWelcome(true)} />

      {currentPage === 'about' ? (
        <About />
      ) : currentPage === 'safety' ? (
        <main className="container mx-auto p-4 sm:p-6 lg:p-8 flex-grow">
          <CommunityGuidelines />
        </main>
      ) : (
        <>
          <Header activeView={activeView} setActiveView={setActiveView} />
          <main className="container mx-auto p-4 sm:p-6 lg:p-8 flex-grow">
            {activeView === 'needHelp' ? (
              <div className="max-w-2xl mx-auto">
                <div className="mb-6 bg-surface-primary p-1 rounded-lg shadow-sm border border-surface-tertiary flex space-x-1">
                  <SubNavButton label="Make a Request" isActive={needHelpView === 'form'} onClick={() => setNeedHelpView('form')} />
                  <SubNavButton label="My Requests" isActive={needHelpView === 'myRequests'} onClick={() => setNeedHelpView('myRequests')} />
                  <SubNavButton label="Find Resources" isActive={needHelpView === 'resources'} onClick={() => setNeedHelpView('resources')} />
                </div>
                {needHelpView === 'form' ? (
                  <RequestForm addRequest={addRequest} />
                ) : needHelpView === 'myRequests' ? (
                  <MyRequests />
                ) : (
                  <Resources />
                )}
              </div>
            ) : (
              <div>
                {isLoading ? <LoadingIndicator /> : error ? <ErrorIndicator /> : (
                  <>
                    <RequestList requests={availableRequests} claimRequest={claimRequest} onOpenGroceryHelper={openGroceryHelper} onShare={handleShareRequest} lastUpdated={lastUpdated} />
                    <MyTasks tasks={myTasks} onComplete={completeRequest} onOpenGroceryHelper={openGroceryHelper} />
                  </>
                )}
              </div>
            )}
          </main>
        </>
      )}

      <Footer />
      {isModalOpen && <GroceryHelperModal request={selectedRequest} onClose={closeGroceryHelper} />}
      {showWelcome && <WelcomeModal onClose={handleCloseWelcome} />}
      <InstallBanner />
    </div>
  );
};

export default App;
