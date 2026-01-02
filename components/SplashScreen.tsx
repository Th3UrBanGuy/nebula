
import React from 'react';
import { Loader2, Flame } from 'lucide-react';

export const SplashScreen: React.FC = () => {
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
          <span className="text-xs text-stone-600 font-mono">ESTABLISHING CONNECTION</span>
        </div>
      </div>
    );
};
