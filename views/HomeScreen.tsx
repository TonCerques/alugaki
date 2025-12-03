
import React, { useState, useEffect } from 'react';
import { Profile } from '../types';
import BottomNav from '../components/BottomNav';
import BrowseScreen from './BrowseScreen';
import CreateItemScreen from './CreateItemScreen';
import ProfileScreen from './ProfileScreen';
import ItemDetailScreen from './ItemDetailScreen';
import InboxScreen from './InboxScreen';
import ChatScreen from './ChatScreen';
import BookingReviewScreen from './BookingReviewScreen';
import RequestSuccessScreen from './RequestSuccessScreen';
import PaymentScreen from './PaymentScreen';
import LessorDashboardScreen from './LessorDashboardScreen';
import TutorialOverlay from '../components/TutorialOverlay';

interface HomeScreenProps {
  userProfile: Profile;
  onLogout: () => void;
}

type Tab = 'browse' | 'inbox' | 'create' | 'profile';
type OverlayState = 'none' | 'details' | 'review' | 'success' | 'chat' | 'payment' | 'lessor_dashboard';

const HomeScreen: React.FC<HomeScreenProps> = ({ userProfile, onLogout }) => {
  const [currentTab, setCurrentTab] = useState<Tab>('browse');
  
  // Navigation State
  const [overlayState, setOverlayState] = useState<OverlayState>('none');
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [activeChatRoomId, setActiveChatRoomId] = useState<string | null>(null);
  const [showTutorial, setShowTutorial] = useState(false);
  
  // Booking Flow State
  const [bookingDates, setBookingDates] = useState<{start: string, end: string} | null>(null);

  // Check for Tutorial on mount
  useEffect(() => {
    const hasSeenTutorial = localStorage.getItem('alugaki_tutorial_seen');
    if (!hasSeenTutorial) {
      // Delay slightly to let animations finish and UI settle
      setTimeout(() => setShowTutorial(true), 1000);
    }
  }, []);

  const handleTutorialClose = () => {
    setShowTutorial(false);
    localStorage.setItem('alugaki_tutorial_seen', 'true');
  };

  // Flow Handlers
  const handleItemPress = (itemId: string) => {
    setSelectedItemId(itemId);
    setBookingDates(null); // Ensure fresh dates
    setOverlayState('details');
  };

  const handleRequestPress = (startDate: string, endDate: string) => {
    setBookingDates({ start: startDate, end: endDate });
    setOverlayState('review');
  };

  const handleBookingConfirmed = (chatRoomId: string) => {
    setActiveChatRoomId(chatRoomId);
    setOverlayState('success');
  };

  const handleGoToChat = () => {
    setOverlayState('chat');
  };

  const handleChatSelect = (chatRoomId: string) => {
    setActiveChatRoomId(chatRoomId);
    setOverlayState('chat');
  };
  
  const handlePayPress = () => {
    setOverlayState('payment');
  };

  const handlePaymentSuccess = () => {
    setOverlayState('chat'); // Return to chat after payment
  };

  const closeOverlay = () => {
    setOverlayState('none');
    // Reset transient states
    if (overlayState === 'details' || overlayState === 'review') {
      setBookingDates(null);
    }
  };

  const renderContent = () => {
    switch (currentTab) {
      case 'browse':
        return <BrowseScreen onItemPress={handleItemPress} />;
      case 'inbox':
        return (
          <InboxScreen 
            currentUser={userProfile} 
            onChatSelect={handleChatSelect} 
            onNavigateToCreate={() => setCurrentTab('create')}
            onNavigateToBrowse={() => setCurrentTab('browse')}
          />
        );
      case 'create':
        return <CreateItemScreen userProfile={userProfile} onSuccess={() => setCurrentTab('browse')} />;
      case 'profile':
        return (
          <ProfileScreen 
            userProfile={userProfile} 
            onLogout={onLogout} 
            onOpenDashboard={() => setOverlayState('lessor_dashboard')}
          />
        );
      default:
        return <BrowseScreen onItemPress={handleItemPress} />;
    }
  };

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden relative">
      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar pb-20">
        {renderContent()}
      </div>

      {/* Bottom Navigation */}
      <BottomNav currentTab={currentTab} onTabChange={setCurrentTab} />

      {/* --- OVERLAYS (Modals) --- */}
      
      {/* 1. Item Detail */}
      {overlayState === 'details' && selectedItemId && (
        <div className="fixed inset-0 z-50">
          <ItemDetailScreen 
            itemId={selectedItemId} 
            onBack={closeOverlay}
            currentUser={userProfile}
            onRequestPress={handleRequestPress}
          />
        </div>
      )}

      {/* 2. Booking Review */}
      {overlayState === 'review' && selectedItemId && bookingDates && (
        <div className="fixed inset-0 z-50">
          <BookingReviewScreen 
            itemId={selectedItemId}
            startDate={bookingDates.start}
            endDate={bookingDates.end}
            currentUser={userProfile}
            onBack={() => setOverlayState('details')} // Back to details
            onConfirm={handleBookingConfirmed}
          />
        </div>
      )}

      {/* 3. Request Success */}
      {overlayState === 'success' && (
        <div className="fixed inset-0 z-50">
          <RequestSuccessScreen 
            onGoToChat={handleGoToChat}
            onClose={closeOverlay}
          />
        </div>
      )}

      {/* 4. Chat Room */}
      {overlayState === 'chat' && activeChatRoomId && (
        <div className="fixed inset-0 z-50">
          <ChatScreen 
            chatRoomId={activeChatRoomId}
            currentUser={userProfile}
            onBack={closeOverlay}
            onPayPress={handlePayPress}
          />
        </div>
      )}

      {/* 5. Payment Screen */}
      {overlayState === 'payment' && activeChatRoomId && (
        <div className="fixed inset-0 z-50">
          <PaymentScreen
            chatRoomId={activeChatRoomId}
            currentUser={userProfile}
            onBack={() => setOverlayState('chat')}
            onSuccess={handlePaymentSuccess}
          />
        </div>
      )}

      {/* 6. Lessor Dashboard */}
      {overlayState === 'lessor_dashboard' && (
        <div className="fixed inset-0 z-50">
          <LessorDashboardScreen
            currentUser={userProfile}
            onBack={closeOverlay}
          />
        </div>
      )}

      {/* Tutorial Overlay */}
      {showTutorial && (
        <TutorialOverlay onClose={handleTutorialClose} />
      )}
    </div>
  );
};

export default HomeScreen;
