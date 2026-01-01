import React, { useState } from 'react';
import { Home, Tv, LayoutGrid, Search, Settings, Shield, UserCircle, Mic } from 'lucide-react';
import { useStore } from '../store';
import { ViewState } from '../types';

export const BottomNav: React.FC = () => {
  const { view, setView, user } = useStore();
  const [searchFocused, setSearchFocused] = useState(false);

  // Reusable Dock Icon
  const DockItem = ({ id, icon: Icon, label, color = "text-stone-400" }: { id: ViewState, icon: any, label: string, color?: string }) => (
    <button
      onClick={() => setView(id)}
      className={`group relative flex flex-col items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-full transition-all duration-300 ease-out hover:-translate-y-2
        ${view === id 
          ? 'bg-stone-800/80 shadow-[0_0_20px_rgba(255,255,255,0.1)] scale-110' 
          : 'hover:bg-stone-800/50 hover:scale-105'
        }
      `}
    >
      <Icon className={`w-5 h-5 md:w-6 md:h-6 transition-colors ${view === id ? 'text-white' : color} group-hover:text-white`} />
      
      {/* Tooltip Label */}
      <span className="absolute -top-10 px-2 py-1 bg-black/80 backdrop-blur text-white text-[10px] font-bold rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-stone-800">
        {label}
      </span>
      
      {/* Active Dot */}
      {view === id && (
        <div className="absolute -bottom-2 w-1 h-1 bg-white rounded-full shadow-[0_0_5px_rgba(255,255,255,0.8)]" />
      )}
    </button>
  );

  return (
    <div className="fixed bottom-6 left-0 right-0 z-50 flex justify-center pointer-events-none">
        
        {/* The Dock Container */}
        <div className="pointer-events-auto flex items-center p-3 md:p-4 bg-stone-950/40 backdrop-blur-2xl border border-stone-800/50 rounded-[2rem] shadow-[0_20px_40px_rgba(0,0,0,0.6)] space-x-2 md:space-x-4 transition-all duration-300 hover:bg-stone-950/60 hover:border-stone-700/50">
            
            <DockItem id="home" icon={Home} label="Home" />
            <DockItem id="guide" icon={LayoutGrid} label="Guide" />
            <DockItem id="player" icon={Tv} label="Now Playing" color="text-orange-500" />
            
            {/* Divider */}
            <div className="w-px h-8 bg-stone-800 mx-2" />

            {/* Integrated Search Bar */}
            <div 
                tabIndex={0}
                className={`flex items-center transition-all duration-300 bg-stone-900/50 border border-stone-700/50 rounded-full px-4 h-12 md:h-14 cursor-text group outline-none
                ${searchFocused ? 'w-40 md:w-64 bg-stone-900/80 border-orange-500/50 ring-2 ring-orange-500/20' : 'w-12 md:w-48 hover:bg-stone-800/50'}
                `}
                onClick={() => { setView('ai'); setSearchFocused(true); }}
                onBlur={() => setSearchFocused(false)}
            >
                <Search className="w-5 h-5 text-stone-400 group-hover:text-white shrink-0" />
                <span className={`ml-3 text-sm font-medium text-stone-400 group-hover:text-stone-200 truncate ${searchFocused ? 'opacity-0 hidden' : 'hidden md:block'}`}>
                    Find channels...
                </span>
                <Mic className={`w-4 h-4 text-stone-500 ml-auto hidden md:block ${searchFocused ? 'hidden' : ''}`} />
            </div>

            {/* Divider */}
            <div className="w-px h-8 bg-stone-800 mx-2" />
            
            {user?.role === 'admin' && (
               <DockItem id="admin" icon={Shield} label="Control Center" color="text-red-500" />
            )}
            
            <DockItem id="profile" icon={UserCircle} label="Profile" />

        </div>
    </div>
  );
};