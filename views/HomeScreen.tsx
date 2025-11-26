
import React, { useState } from 'react';
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

interface HomeScreenProps {
  userProfile: Profile;
  onLogout: () => void;
}

type Tab = 'browse' | 'inbox' | 'create' | 'profile';
type OverlayState = 'none' | 'details' | 'review' | 'success' | 'chat' | 'payment';

const HomeScreen: React.FC<HomeScreenProps> = ({ userProfile, onLogout }) => {
  const [currentTab, setCurrentTab] = useState<Tab>('browse');
  
  // Navigation State
  const [overlayState, setOverlayState] = useState<OverlayState>('none');
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [activeChatRoomId, setActiveChatRoomId] = useState<string | null>(null);
  
  // Booking Flow State
  const [bookingDates, setBookingDates] = useState<{start: string, end: string} | null>(null);

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
  
  const handlePayPress = () => {
    setOverlayState('payment');
  };
  
  const handlePaymentSuccess = () => {
    // Payment complete, go back to chat which should now update to "Confirmed"
    setOverlayState('chat');
  };

  const handleCloseOverlay = () => {
    setOverlayState('none');
    setSelectedItemId(null);
    setActiveChatRoomId(null);
    setBookingDates(null);
  };

  // Render Logic
  const renderOverlay = () => {
    switch (overlayState) {
      case 'details':
        if (!selectedItemId) return null;
        return (
          <ItemDetailScreen 
            itemId={selectedItemId} 
            onBack={handleCloseOverlay} 
            currentUser={userProfile}
            onRequestPress={handleRequestPress}
          />
        );
      
      case 'review':
        if (!selectedItemId || !bookingDates) return null;
        return (
          <BookingReviewScreen
            itemId={selectedItemId}
            startDate={bookingDates.start}
            endDate={bookingDates.end}
            currentUser={userProfile}
            onBack={() => setOverlayState('details')}
            onConfirm={handleBookingConfirmed}
          />
        );

      case 'success':
        return (
          <RequestSuccessScreen 
            onGoToChat={handleGoToChat}
            onClose={handleCloseOverlay}
          />
        );

      case 'chat':
        if (!activeChatRoomId) return null;
        return (
          <ChatScreen 
            chatRoomId={activeChatRoomId} 
            currentUser={userProfile} 
            onBack={handleCloseOverlay}
            onPayPress={handlePayPress}
          />
        );
        
      case 'payment':
        if (!activeChatRoomId) return null;
        return (
          <PaymentScreen
            chatRoomId={activeChatRoomId}
            currentUser={userProfile}
            onBack={handleGoToChat}
            onSuccess={handlePaymentSuccess}
          />
        );

      default:
        return null;
    }
  };

  const renderTabContent = () => {
    switch (currentTab) {
      case 'browse':
        return <BrowseScreen onItemPress={handleItemPress} />;
      case 'inbox':
        return <InboxScreen currentUser={userProfile} onChatSelect={(id) => { setActiveChatRoomId(id); setOverlayState('chat'); }} />;
      case 'create':
        return <CreateItemScreen userProfile={userProfile} onSuccess={() => setCurrentTab('browse')} />;
      case 'profile':
        return <ProfileScreen userProfile={userProfile} onLogout={onLogout} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background relative flex flex-col">
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {renderTabContent()}
      </div>
      
      {/* Overlays (Modal Stack) */}
      {overlayState !== 'none' && (
        <div className="fixed inset-0 z-50 bg-background">
          {renderOverlay()}
        </div>
      )}

      {overlayState === 'none' && (
        <BottomNav currentTab={currentTab} onTabChange={setCurrentTab} />
      )}
    </div>
  );
};

export default HomeScreen;