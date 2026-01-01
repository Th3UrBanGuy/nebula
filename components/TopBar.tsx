import React, { useEffect, useState } from 'react';
import { Wifi, Signal, Bell, Search } from 'lucide-react';
import { format } from 'date-fns';
import { useStore } from '../store';

export const TopBar: React.FC = () => {
  const [time, setTime] = useState(new Date());
  const { activeChannelId, channels } = useStore();

  const currentChannel = channels.find(c => c.id === activeChannelId);

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full h-16 md:h-20 flex items-center justify-between px-4 md:px-8 z-20 pointer-events-none">
      <div className="flex items-center space-x-3 md:space-x-6 pointer-events-auto">
         {/* Live Status Badge */}
         <div className="flex items-center space-x-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-stone-900/80 border border-stone-800 backdrop-blur-md">
            <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] md:text-xs font-bold text-stone-400 tracking-wider">ONLINE</span>
         </div>

         {/* Active Provider Display - Hidden on Mobile */}
         {currentChannel && (
            <div className="hidden lg:flex flex-col">
                <span className="text-[10px] uppercase text-stone-500 font-bold tracking-widest">Current Provider</span>
                <span className="text-sm font-bold text-orange-500">{currentChannel.provider}</span>
            </div>
         )}
      </div>

      <div className="flex items-center space-x-3 md:space-x-6 pointer-events-auto">
        <div className="relative hidden md:block">
             <Search className="w-5 h-5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
             <input 
                type="text" 
                placeholder="Search channels..." 
                className="bg-stone-900/50 border border-stone-800 rounded-full pl-10 pr-4 py-2 text-sm text-stone-200 focus:outline-none focus:border-orange-500/50 w-48 transition-all hover:w-64 focus:w-64 placeholder:text-stone-600"
             />
        </div>

        <div className="h-8 w-px bg-stone-800 mx-2 hidden md:block" />

        <div className="flex items-center space-x-3 md:space-x-5 text-stone-400">
           <Search className="w-5 h-5 md:hidden" />
           <Bell className="w-5 h-5 hover:text-orange-400 cursor-pointer transition-colors" />
           <div className="hidden md:flex items-center space-x-1">
             <Signal className="w-4 h-4" />
             <Wifi className="w-5 h-5" />
           </div>
           <span className="text-sm md:text-lg font-bold text-stone-200">{format(time, 'h:mm')}</span>
        </div>
        
        <div className="w-8 h-8 md:w-11 md:h-11 rounded-full bg-gradient-to-tr from-stone-700 to-stone-600 p-0.5 shadow-lg cursor-pointer hover:ring-2 hover:ring-orange-500 transition-all">
            <img src="https://i.pravatar.cc/150?u=a042581f4e29026704d" alt="User" className="w-full h-full rounded-full object-cover border-2 border-stone-900" />
        </div>
      </div>
    </div>
  );
};