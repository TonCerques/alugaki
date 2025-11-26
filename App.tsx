import React, { useState, useEffect, useCallback } from 'react';
import { AppView, Profile, KycStatus } from './types';
import SplashScreen from './views/SplashScreen';
import AuthScreen from './views/AuthScreen';
import KycScreen from './views/KycScreen';
import HomeScreen from './views/HomeScreen';
import { auth } from './lib/auth';
import { profileTable } from './lib/db';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.SPLASH);
  const [session, setSession] = useState<any | null>(null);
  const [userProfile, setUserProfile] = useState<Profile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);

  // Helper to fetch profile and determine next view
  const loadProfileAndRedirect = useCallback((userId: string) => {
    setIsLoadingProfile(true);
    // Simulate slight DB delay
    setTimeout(() => {
      const profile = profileTable.find(userId);
      if (profile) {
        setUserProfile(profile);
        
        // ROUTING LOGIC: Check KYC Status
        if (profile.kycStatus === KycStatus.VERIFIED) {
          setCurrentView(AppView.HOME);
        } else {
          setCurrentView(AppView.KYC);
        }
      }
      setIsLoadingProfile(false);
    }, 300);
  }, []);

  // Check for initial session
  useEffect(() => {
    auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user?.id) {
        loadProfileAndRedirect(session.user.id);
      }
    });

    const {
      data: { subscription },
    } = auth.onAuthStateChange((event, session) => {
      setSession(session);
      
      if (event === 'SIGNED_OUT') {
        setUserProfile(null);
        setCurrentView(AppView.AUTH);
      } else if (session?.user?.id) {
         // On Login or SignUp success
         loadProfileAndRedirect(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [loadProfileAndRedirect]);

  const handleSplashFinish = useCallback(() => {
    if (session?.user?.id) {
       // Profile loading is handled by useEffect, but if we are already loaded:
       if (userProfile) {
         if (userProfile.kycStatus === KycStatus.VERIFIED) {
           setCurrentView(AppView.HOME);
         } else {
           setCurrentView(AppView.KYC);
         }
       }
       // If profile is loading, the view will update when loadProfileAndRedirect finishes
    } else {
      setCurrentView(AppView.AUTH);
    }
  }, [session, userProfile]);

  const handleLogout = async () => {
    await auth.signOut();
  };

  const handleVerificationComplete = () => {
    // Called when user finishes KYC flow successfully
    if (userProfile) {
      // Re-fetch to ensure fresh state
      loadProfileAndRedirect(userProfile.id);
    }
  };

  const renderView = () => {
    switch (currentView) {
      case AppView.SPLASH:
        return <SplashScreen onFinish={handleSplashFinish} />;
      
      case AppView.AUTH:
        return <AuthScreen />;
      
      case AppView.KYC:
        if (!userProfile) return null; // Should not happen
        return (
          <KycScreen 
            userProfile={userProfile} 
            onVerificationComplete={handleVerificationComplete} 
          />
        );

      case AppView.HOME:
        if (!userProfile) return null;
        return (
          <HomeScreen 
            userProfile={userProfile} 
            onLogout={handleLogout} 
          />
        );

      default:
        return null;
    }
  };

  return (
    <>
      {currentView === AppView.SPLASH && <SplashScreen onFinish={handleSplashFinish} />}
      
      {currentView !== AppView.SPLASH && (
        <div className="animate-fade-in">
           {isLoadingProfile && !userProfile ? (
             // Loading state between Auth and App
             <div className="min-h-screen bg-background flex items-center justify-center">
               <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
             </div>
           ) : (
             renderView()
           )}
        </div>
      )}
    </>
  );
};

export default App;