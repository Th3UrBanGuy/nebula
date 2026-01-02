
import React, { useEffect, useState } from 'react';
import { useStore } from './store';
import { BottomNav } from './components/BottomNav';
import { VideoPlayer } from './components/VideoPlayer';
import { Dashboard } from './components/Dashboard';
import { Guide } from './components/Guide';
import { Assistant } from './components/Assistant';
import { TopBar } from './components/TopBar';
import { Auth } from './components/Auth';
import { Profile } from './components/Profile';
import { AdminPanel } from './components/AdminPanel';
import { SubscriptionWall } from './components/SubscriptionWall';
import { SplashScreen } from './components/SplashScreen';

const App: React.FC = () => {
  const { view, initialize, isLoading, user, activeChannelId } = useStore();
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    initialize();
    const timer = setTimeout(() => setShowSplash(false), 2000); 
    return () => clearTimeout(timer);
  }, [initialize]);

  if (showSplash || isLoading) {
    return <SplashScreen />;
  }

  // Auth Guard
  if (!user) {
    return <Auth />;
  }

  // License Guard: If not admin, and license is missing or expired
  const hasValidLicense = user.role === 'admin' || (user.license && user.license.status === 'active' && user.license.expiryDate > Date.now());
  
  if (!hasValidLicense) {
    return <SubscriptionWall />;
  }

  // Determine if Mini Player should be hidden
  // Hidden in: Profile, Search (AI), Admin
  const isPlayerHidden = view === 'profile' || view === 'ai' || view === 'admin';
  
  // Distraction Free Mode: Hide Navs when in full player mode
  const isDistractionFree = view === 'player';

  return (
    <div className="h-screen w-screen bg-stone-950 text-stone-100 flex flex-col overflow-hidden font-sans selection:bg-orange-500/30 relative">
      
      {/* IMMERSIVE BACKGROUND LAYER */}
      <div className="absolute inset-0 z-0">
          {/* High-res abstract architecture background to mimic the living room/TV feel */}
          <img 
            src="https://images.unsplash.com/photo-1600607686527-6fb886090705?q=80&w=2700&auto=format&fit=crop" 
            alt="Background" 
            className="w-full h-full object-cover opacity-40 blur-sm scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/60 to-stone-950/40" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orange-500/10 via-transparent to-transparent" />
      </div>

      {/* Main Content Area - Full Width */}
      <div className="flex-1 flex flex-col relative z-10 h-full">
        {!isDistractionFree && <TopBar />}
        
        <main className={`flex-1 overflow-hidden relative ${isDistractionFree ? 'p-0' : 'p-4 md:p-8 pb-32'}`}>
          
          {/* Views Layering - Centered Container for TV Feel */}
          <div className="w-full h-full max-w-[1600px] mx-auto relative">
              <div className={`h-full w-full transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] ${view === 'home' ? 'opacity-100 scale-100 blur-0' : 'opacity-0 scale-95 blur-xl pointer-events-none absolute inset-0'}`}>
                <Dashboard />
              </div>
              
              <div className={`h-full w-full transition-all duration-500 ${view === 'guide' ? 'opacity-100 translate-y-0 z-10' : 'opacity-0 translate-y-10 absolute inset-0 pointer-events-none'}`}>
                <Guide />
              </div>

              <div className={`h-full w-full transition-all duration-500 ${view === 'ai' ? 'opacity-100 translate-y-0 z-10' : 'opacity-0 translate-y-10 absolute inset-0 pointer-events-none'}`}>
                <Assistant />
              </div>
              
              <div className={`h-full w-full transition-all duration-500 ${view === 'profile' ? 'opacity-100 translate-y-0 z-10' : 'opacity-0 translate-y-10 absolute inset-0 pointer-events-none'}`}>
                <Profile />
              </div>
              
              <div className={`h-full w-full transition-all duration-500 ${view === 'admin' ? 'opacity-100 translate-y-0 z-10' : 'opacity-0 translate-y-10 absolute inset-0 pointer-events-none'}`}>
                <AdminPanel />
              </div>
          </div>

          {/* Persistent Player (PIP) - Responsive Size & Auto-Hide. ONLY RENDER IF CHANNEL ACTIVE */}
          <div className={`fixed transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] shadow-[0_20px_60px_rgba(0,0,0,0.8)] overflow-hidden bg-black
            ${view === 'player' 
              ? 'inset-0 z-50 rounded-none' 
              : `
                 z-40 rounded-xl border border-stone-700/50 cursor-pointer group hover:scale-105 hover:shadow-[0_0_40px_rgba(234,88,12,0.3)] hover:border-orange-500/50
                 bottom-24 right-4 w-36 h-20 md:bottom-32 md:right-8 md:w-80 md:h-44
                 ${(isPlayerHidden || !activeChannelId) ? 'opacity-0 pointer-events-none translate-y-10 scale-90' : 'opacity-100'}
                `
            }
          `}>
             <VideoPlayer isMini={view !== 'player'} />
          </div>

        </main>
      </div>
      
      {/* Floating Dock Navigation */}
      {!isDistractionFree && <BottomNav />}
    </div>
  );
};

export default App;
