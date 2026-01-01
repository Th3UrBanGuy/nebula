import React from 'react';
import { useStore } from '../store';
import { Play, Info, Radio, Zap, Globe, TrendingUp } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { channels, setChannel, setView } = useStore();
  
  // Use first channel as "Hero" focus
  const featured = channels[0];
  const trendingChannels = channels.slice(1, 5);
  const otherChannels = channels.slice(5);

  return (
    <div className="w-full h-full flex flex-col justify-center pb-10">
      
      {/* Main Focus Carousel */}
      <div className="flex-1 flex flex-col justify-center mb-8">
          <div className="flex items-end px-4 md:px-12 mb-4 space-x-4">
              <h1 className="text-2xl md:text-4xl font-black text-white tracking-tight drop-shadow-2xl">
                  Live <span className="text-orange-500">Now</span>
              </h1>
              <div className="h-px flex-1 bg-gradient-to-r from-stone-500/50 to-transparent mb-3" />
          </div>

          {/* Horizontal Scroll Snap Area */}
          <div className="w-full overflow-x-auto overflow-y-visible snap-x snap-mandatory flex items-center space-x-6 px-8 md:px-[15vw] pb-12 pt-4 no-scrollbar scroll-smooth perspective-1000">
             {channels.map((channel, idx) => (
                 <div 
                    key={channel.id}
                    onClick={() => { setChannel(channel.id); setView('player'); }}
                    className="group relative flex-shrink-0 snap-center transition-all duration-500 ease-out transform cursor-pointer
                               w-[70vw] md:w-[600px] aspect-video rounded-3xl overflow-visible hover:z-20 hover:scale-110"
                 >
                    {/* Glass Container */}
                    <div className="absolute inset-0 rounded-3xl overflow-hidden bg-stone-900 border border-stone-700/50 shadow-2xl transition-all duration-500 group-hover:border-orange-500 group-hover:shadow-[0_0_50px_rgba(234,88,12,0.4)]">
                        <img 
                            src={`https://picsum.photos/seed/${channel.id}tv/800/450`} 
                            alt={channel.name} 
                            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500" 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-90" />
                        
                        {/* Content Overlay */}
                        <div className="absolute bottom-0 left-0 p-6 md:p-8 w-full transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                             <div className="flex items-center space-x-3 mb-2">
                                <div className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-widest text-white shadow-lg ${channel.color}`}>
                                    {channel.provider}
                                </div>
                                <div className="flex items-center text-red-500 font-bold text-xs animate-pulse">
                                    <Radio className="w-3 h-3 mr-1" /> LIVE
                                </div>
                             </div>
                             <h2 className="text-2xl md:text-4xl font-black text-white leading-none mb-2 drop-shadow-lg">
                                {channel.name}
                             </h2>
                             <p className="text-stone-300 text-sm md:text-base line-clamp-1 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-75">
                                {channel.description}
                             </p>
                        </div>

                        {/* Play Icon (appears on hover) */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 opacity-0 group-hover:opacity-100 scale-50 group-hover:scale-100 transition-all duration-500">
                             <Play className="w-6 h-6 text-white fill-white ml-1" />
                        </div>
                    </div>
                    
                    {/* Reflection Effect */}
                    <div className="absolute -bottom-6 left-2 right-2 h-4 bg-black/50 blur-xl rounded-[100%] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                 </div>
             ))}
             
             {/* Spacer for end of scroll */}
             <div className="w-[10vw] flex-shrink-0" />
          </div>
      </div>

      {/* Quick Access Grid (Bottom Section) */}
      <div className="h-32 px-12 hidden md:grid grid-cols-4 gap-4">
           {['Trending', 'Favorites', 'News', 'Movies'].map((cat, i) => (
               <div key={i} className="bg-stone-900/40 border border-stone-800/50 backdrop-blur-md rounded-2xl flex items-center justify-center space-x-3 hover:bg-stone-800/60 hover:border-stone-600 transition-all cursor-pointer group">
                   <div className="w-10 h-10 rounded-full bg-stone-800 group-hover:bg-orange-600 transition-colors flex items-center justify-center">
                       {i === 0 ? <TrendingUp className="w-5 h-5 text-stone-400 group-hover:text-white" /> : <Zap className="w-5 h-5 text-stone-400 group-hover:text-white" />}
                   </div>
                   <span className="font-bold text-stone-300 group-hover:text-white">{cat}</span>
               </div>
           ))}
      </div>
    </div>
  );
};