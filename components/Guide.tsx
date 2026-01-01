import React from 'react';
import { useStore } from '../store';
import { format } from 'date-fns';
import { Play } from 'lucide-react';

export const Guide: React.FC = () => {
  const { channels, programs, activeChannelId, setChannel, setView } = useStore();

  const getChannelPrograms = (channelId: string) => programs.filter(p => p.channelId === channelId);

  return (
    <div className="w-full h-full flex flex-col overflow-hidden bg-stone-900/40 rounded-[2rem] border border-stone-800 backdrop-blur-md shadow-2xl">
      <div className="p-8 border-b border-stone-800 bg-stone-950/80 flex justify-between items-center">
        <div>
            <h2 className="text-3xl font-black text-white">Live Guide</h2>
            <p className="text-stone-500 text-sm font-medium mt-1">Today's Schedule across all providers</p>
        </div>
        <div className="flex space-x-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-orange-500" />
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 custom-scrollbar">
         {channels.map(channel => (
           <div key={channel.id} className="flex mb-2 group hover:bg-stone-800/30 rounded-2xl transition-colors p-3 border border-transparent hover:border-stone-800">
             {/* Channel Info */}
             <div className="w-56 flex-shrink-0 flex items-center space-x-4 p-2 border-r border-stone-800/50 mr-4">
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg transform transition-transform group-hover:scale-105 ${channel.color}`}>
                   {channel.logo}
                </div>
                <div>
                   <h3 className="font-bold text-stone-200 text-lg leading-none mb-1">{channel.name}</h3>
                   <span className="text-[10px] text-orange-500 font-bold uppercase tracking-widest bg-orange-500/10 px-2 py-0.5 rounded">{channel.provider}</span>
                </div>
             </div>

             {/* Programs Timeline */}
             <div className="flex-1 flex space-x-3 overflow-x-auto no-scrollbar items-center py-2">
                {getChannelPrograms(channel.id).map((program, idx) => {
                    const isActive = channel.id === activeChannelId && idx === 0;
                    return (
                        <div 
                           key={program.id}
                           onClick={() => { setChannel(channel.id); setView('player'); }}
                           className={`relative flex-shrink-0 h-28 rounded-xl overflow-hidden cursor-pointer transition-all border
                             ${isActive 
                                ? 'border-orange-500 w-96 shadow-[0_0_15px_rgba(234,88,12,0.3)]' 
                                : 'w-72 border-stone-800 hover:border-stone-600 bg-stone-900/50'
                             }
                           `}
                        >
                           <img src={program.thumbnail} className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:opacity-40 transition-opacity" alt="" />
                           
                           <div className="absolute inset-0 bg-gradient-to-r from-stone-950 via-stone-950/80 to-transparent p-5 flex flex-col justify-center">
                              <div className="flex items-center justify-between mb-2">
                                <span className={`text-xs font-mono font-bold ${isActive ? 'text-orange-400' : 'text-stone-500'}`}>
                                    {format(program.startTime, 'h:mm')} - {format(program.endTime, 'h:mm')}
                                </span>
                                {isActive && (
                                    <span className="flex h-2 w-2 relative">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                                    </span>
                                )}
                              </div>
                              <h4 className="font-bold text-white text-lg leading-tight line-clamp-2">{program.title}</h4>
                           </div>
                           
                           {/* Hover Play Button */}
                           <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 bg-stone-950/60 backdrop-blur-sm transition-opacity">
                              <Play className="w-10 h-10 text-white fill-white drop-shadow-lg" />
                           </div>
                        </div>
                    );
                })}
             </div>
           </div>
         ))}
      </div>
    </div>
  );
};