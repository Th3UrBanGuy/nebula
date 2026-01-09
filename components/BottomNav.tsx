
import React, { useState } from 'react';
import { Home, Tv, LayoutGrid, Search, Settings, Shield, UserCircle, Mic } from 'lucide-react';
import { useStore } from '../store';
import { ViewState } from '../types';

export const BottomNav: React.FC = () => {
  const { view, setView, user, activeChannelId } = useStore();
  const [searchFocused, setSearchFocused] = useState(false);

  const DockItem = ({ id, icon: Icon, label, color = "text-stone-400" }: { id: ViewState, icon: any, label: string, color?: string }) => (
    <button
      onClick={() => setView(id)}
      className={`group relative flex flex-col items-center justify-center w-12 h-12 md:w-16 md:h-16 rounded-full transition-all duration-300 ease-out active:scale-90
        ${view === id 
          ? 'bg-stone-800 shadow-[0_0_30px_rgba(234,88,12,0.2)] scale-110' 
          : 'hover:bg-stone-800/50 hover:scale-105'
        }
      `}
    >
      <Icon className={`w-5 h-5 md:w-7 md:h-7 transition-colors ${view === id ? 'text-white' : color}`} />
      
      {view === id && (
        <div className="absolute -bottom-2 w-1.5 h-1.5 bg-orange-600 rounded-full shadow-[0_0_10px_rgba(234,88,12,0.8)]" />
      )}
    </button>
  );

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pb-safe pt-2 bg-gradient-to-t from-black via-black/40 to-transparent pointer-events-none">
        
        <div className="pointer-events-auto flex items-center px-4 py-3 md:px-6 md:py-4 bg-stone-950/80 backdrop-blur-3xl border border-stone-800/50 rounded-full shadow-[0_10px_50px_rgba(0,0,0,0.8)] space-x-3 md:space-x-6 mb-6 mx-4">
            
            <DockItem id="home" icon={Home} label="Home" />
            <DockItem id="guide" icon={LayoutGrid} label="All Channels" />
            
            {activeChannelId && (
              <DockItem id="player" icon={Tv} label="Now Playing" color="text-orange-500" />
            )}
            
            <div className="w-px h-8 bg-stone-800 hidden md:block" />

            <div 
                className={`items-center hidden md:flex transition-all duration-300 bg-stone-900 border border-stone-800 rounded-full px-4 h-14 cursor-text
                ${searchFocused ? 'w-64 ring-2 ring-orange-500/20' : 'w-48'}
                `}
                onClick={() => { setView('ai'); setSearchFocused(true); }}
            >
                <Search className="w-5 h-5 text-stone-500 shrink-0" />
                <span className="ml-3 text-sm font-medium text-stone-500 truncate">Search...</span>
            </div>

            <div className="w-px h-8 bg-stone-800" />
            
            <button onClick={() => setView('ai')} className="md:hidden flex items-center justify-center w-12 h-12 rounded-full bg-stone-900 active:scale-90">
                <Search className="w-5 h-5 text-stone-400" />
            </button>
            
            {user?.role === 'admin' && (
               <DockItem id="admin" icon={Shield} label="Admin" color="text-red-500" />
            )}
            
            <DockItem id="profile" icon={UserCircle} label="Profile" />
        </div>
    </div>
  );
};
