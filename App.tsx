import React, { useEffect, useState } from 'react';
import { useStore } from './store';
import { Sidebar } from './components/Sidebar';
import { BottomNav } from './components/BottomNav';
import { VideoPlayer } from './components/VideoPlayer';
import { Dashboard } from './components/Dashboard';
import { Guide } from './components/Guide';
import { Assistant } from './components/Assistant';
import { TopBar } from './components/TopBar';
import { Loader2, Flame } from 'lucide-react';

const App: React.FC = () => {
  const { view, initialize, isLoading } = useStore();
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    initialize();
    const timer = setTimeout(() => setShowSplash(false), 2000); 
    return () => clearTimeout(timer);
  }, [initialize]);

  if (showSplash || isLoading) {
    return (
      <div className="h-screen w-screen bg-stone-950 flex flex-col items-center justify-center relative overflow-hidden">
        {/* Warm splash background */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-orange-900/30 via-stone-950 to-stone-950" />
        
        <div className="z-10 flex flex-col items-center animate-pulse">
          <div className="w-20 h-20 bg-gradient-to-tr from-orange-500 to-red-600 rounded-3xl rotate-45 mb-8 shadow-[0_0_60px_rgba(234,88,12,0.6)] flex items-center justify-center border border-orange-400/30">
             <Flame className="w-10 h-10 text-white -rotate-45" />
          </div>
          <h1 className="text-4xl font-black tracking-[0.3em] text-white">NEBULA<span className="text-orange-500">.OS</span></h1>
          <p className="text-stone-500 mt-3 text-sm tracking-widest font-mono uppercase">System Initialization</p>
        </div>
        <div className="absolute bottom-10 flex flex-col items-center">
          <Loader2 className="w-6 h-6 text-orange-500 animate-spin mb-2" />
          <span className="text-xs text-stone-600 font-mono">CONNECTING TO NEON DB</span>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-stone-950 text-stone-100 flex flex-col md:flex-row overflow-hidden font-sans selection:bg-orange-500/30">
      {/* Navigation: Sidebar for Desktop, BottomNav for Mobile */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative z-0 h-full">
        <TopBar />
        
        {/* Added padding-bottom for mobile to account for BottomNav */}
        <main className="flex-1 overflow-hidden relative p-4 md:p-6 pb-24 md:pb-6">
          {/* Background Ambient Glow - Warm */}
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-orange-900/10 via-stone-950 to-stone-950 -z-10 pointer-events-none" />

          {/* Views */}
          <div className={`h-full w-full transition-all duration-500 ${view === 'home' ? 'opacity-100 translate-y-0 z-10' : 'opacity-0 translate-y-4 hidden'}`}>
            <Dashboard />
          </div>
          
          <div className={`h-full w-full transition-all duration-500 ${view === 'guide' ? 'opacity-100 translate-y-0 z-10' : 'opacity-0 translate-y-4 hidden'}`}>
            <Guide />
          </div>

          <div className={`h-full w-full transition-all duration-500 ${view === 'ai' ? 'opacity-100 translate-y-0 z-10' : 'opacity-0 translate-y-4 hidden'}`}>
             <Assistant />
          </div>

          {/* Picture in Picture / Fullscreen Player Logic */}
          <div className={`fixed transition-all duration-500 ease-in-out shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden
            ${view === 'player' 
              ? 'inset-0 z-50 rounded-none' 
              : 'bottom-24 right-4 md:bottom-8 md:right-8 w-64 h-36 md:w-96 md:h-56 rounded-xl md:rounded-2xl border border-stone-700/50 z-40 bg-black hover:scale-105 cursor-pointer group hover:shadow-[0_0_30px_rgba(234,88,12,0.2)]'
            }
          `}>
             <VideoPlayer isMini={view !== 'player'} />
          </div>

        </main>
      </div>
      
      <BottomNav />
    </div>
  );
};

export default App;