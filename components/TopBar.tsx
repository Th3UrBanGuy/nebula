import React, { useEffect, useState } from 'react';
import { Wifi, Signal, Cloud, ShieldCheck, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import { useStore } from '../store';
import { CONFIG } from '../config';

export const TopBar: React.FC = () => {
  const [time, setTime] = useState(new Date());
  const { activeChannelId, channels, user, setView } = useStore();
  
  const isSecureMode = !!CONFIG.DATABASE_URL;

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full h-20 flex items-start justify-between px-6 md:px-10 py-6 z-20 pointer-events-none">
      
      {/* Left: Branding & Status */}
      <div className="flex flex-col pointer-events-auto">
         <div className="flex items-center space-x-2 mb-1">
             <div className="w-8 h-8 bg-gradient-to-br from-stone-800 to-stone-900 rounded-lg flex items-center justify-center border border-stone-700/50 shadow-lg">
                <span className="font-black text-lg text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">N</span>
             </div>
             <span className="text-sm font-bold text-stone-300 tracking-widest uppercase">Nebula OS</span>
         </div>
         
         <div className="flex items-center space-x-3 text-[10px] font-mono text-stone-500 ml-1">
            <span className="flex items-center"><Signal className="w-3 h-3 mr-1" /> 5G</span>
            <span>•</span>
            <span className="flex items-center"><Wifi className="w-3 h-3 mr-1" /> Connected</span>
         </div>
      </div>

      {/* Right: Time & Widget */}
      <div className="flex items-center space-x-4 pointer-events-auto">
        
        {/* Weather Widget (Mock) */}
        <div className="hidden md:flex items-center bg-stone-950/30 backdrop-blur-md border border-stone-800/50 rounded-full px-4 py-2 space-x-3 shadow-lg">
            <div className="flex items-center space-x-1 text-stone-300">
                <Cloud className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-bold">24°C</span>
            </div>
            <div className="w-px h-3 bg-stone-700" />
            <div className="flex items-center space-x-1 text-stone-400">
                <MapPin className="w-3 h-3" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Tokyo, JP</span>
            </div>
        </div>

        {/* Time Display */}
        <div className="text-right">
           <h2 className="text-3xl font-black text-white leading-none tracking-tight drop-shadow-md">
               {format(time, 'HH:mm')}
           </h2>
           <p className="text-xs font-bold text-orange-500 uppercase tracking-widest text-right">
               {format(time, 'EEE, MMM d')}
           </p>
        </div>

        <button 
          onClick={() => setView('profile')}
          className="ml-2 w-10 h-10 rounded-full bg-gradient-to-tr from-stone-700 to-stone-600 p-0.5 shadow-lg cursor-pointer hover:ring-2 hover:ring-orange-500 transition-all group relative"
        >
            <img 
              src={user?.avatar || "https://i.pravatar.cc/150?u=def"} 
              alt="User" 
              className="w-full h-full rounded-full object-cover border-2 border-stone-900 group-hover:brightness-110" 
            />
            {user?.role === 'admin' && (
                <div className="absolute -top-1 -right-1 bg-red-600 text-[8px] font-black px-1.5 py-0.5 rounded text-white border border-black">ADM</div>
            )}
        </button>
      </div>
    </div>
  );
};