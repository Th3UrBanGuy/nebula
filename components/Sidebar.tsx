import React from 'react';
import { Home, Tv, LayoutGrid, Search, Settings, UserCircle, Shield } from 'lucide-react';
import { useStore } from '../store';
import { ViewState } from '../types';

export const Sidebar: React.FC = () => {
  const { view, setView, user } = useStore();

  const NavItem = ({ id, icon: Icon, label }: { id: ViewState, icon: any, label: string }) => (
    <button
      onClick={() => setView(id)}
      className={`group flex flex-col items-center justify-center w-20 h-20 rounded-2xl transition-all duration-300 mb-4 relative overflow-hidden
        ${view === id 
          ? 'bg-gradient-to-br from-orange-500 to-red-600 text-white shadow-[0_0_20px_rgba(234,88,12,0.4)] scale-105' 
          : 'text-stone-500 hover:bg-stone-900 hover:text-orange-200'
        }
      `}
    >
      <Icon className={`w-7 h-7 mb-2 transition-transform duration-300 ${view === id ? 'rotate-0' : 'group-hover:scale-110'}`} />
      <span className="text-[10px] font-bold tracking-wide uppercase">{label}</span>
      
      {/* Active Indicator Strip */}
      {view === id && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white/20 rounded-r-full" />
      )}
    </button>
  );

  return (
    <div className="hidden md:flex h-full w-28 bg-stone-950/80 backdrop-blur-xl border-r border-stone-800 flex-col items-center py-8 z-50 shadow-2xl">
      <div className="mb-10 w-14 h-14 bg-gradient-to-br from-stone-800 to-stone-900 rounded-2xl flex items-center justify-center shadow-lg border border-stone-800 group cursor-pointer hover:border-orange-500/30 transition-colors">
         <span className="font-black text-2xl text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500 group-hover:scale-110 transition-transform">N</span>
      </div>

      <nav className="flex-1 flex flex-col w-full px-4 items-center overflow-y-auto no-scrollbar space-y-2">
        <NavItem id="home" icon={Home} label="Home" />
        <NavItem id="guide" icon={LayoutGrid} label="Guide" />
        <NavItem id="player" icon={Tv} label="Watch" />
        <NavItem id="ai" icon={Search} label="Search" />
        
        <div className="mt-auto pt-8 border-t border-stone-800 w-full flex flex-col items-center space-y-4">
             {/* Admin Only Button */}
             {user?.role === 'admin' && (
                <button 
                  onClick={() => setView('admin')}
                  className={`p-4 rounded-xl transition-all border border-transparent ${view === 'admin' ? 'bg-red-900/30 text-red-500 border-red-500/30' : 'text-stone-600 hover:text-red-400 hover:bg-stone-900'}`}
                  title="Admin Control Panel"
                >
                  <Shield className="w-6 h-6" />
                </button>
             )}

             <button 
                onClick={() => setView('profile')}
                className={`p-4 rounded-xl transition-all ${view === 'profile' ? 'text-white bg-stone-800' : 'text-stone-600 hover:text-stone-300 hover:bg-stone-900'}`}
             >
                <UserCircle className="w-6 h-6" />
             </button>
             <button className="p-4 rounded-xl text-stone-600 hover:text-stone-300 hover:bg-stone-900 transition-all">
                <Settings className="w-6 h-6" />
             </button>
        </div>
      </nav>
    </div>
  );
};