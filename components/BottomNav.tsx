import React from 'react';
import { Home, Tv, LayoutGrid, Search, Settings } from 'lucide-react';
import { useStore } from '../store';
import { ViewState } from '../types';

export const BottomNav: React.FC = () => {
  const { view, setView } = useStore();

  const NavItem = ({ id, icon: Icon, label }: { id: ViewState, icon: any, label: string }) => (
    <button
      onClick={() => setView(id)}
      className={`flex flex-1 flex-col items-center justify-center py-2 transition-all duration-300
        ${view === id 
          ? 'text-orange-500' 
          : 'text-stone-500'
        }
      `}
    >
      <Icon className={`w-6 h-6 mb-1 ${view === id ? 'fill-current opacity-20' : ''}`} />
      <span className="text-[10px] font-bold tracking-wide uppercase">{label}</span>
    </button>
  );

  return (
    <div className="h-20 w-full bg-stone-950/90 backdrop-blur-xl border-t border-stone-800 flex items-center justify-around px-2 pb-2 md:hidden z-50 fixed bottom-0 left-0">
        <NavItem id="home" icon={Home} label="Home" />
        <NavItem id="guide" icon={LayoutGrid} label="Guide" />
        <NavItem id="player" icon={Tv} label="Watch" />
        <NavItem id="ai" icon={Search} label="Search" />
        <button onClick={() => {}} className="flex flex-1 flex-col items-center justify-center text-stone-500">
            <Settings className="w-6 h-6 mb-1" />
            <span className="text-[10px] font-bold tracking-wide uppercase">Set</span>
        </button>
    </div>
  );
};