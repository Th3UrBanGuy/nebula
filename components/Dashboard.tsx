
import React from 'react';
import { useStore } from '../store';
import { Play, Radio, TrendingUp, Heart, Film, Globe, Tv, Sparkles } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { channels, setChannel, setView } = useStore();
  
  const quickCategories = [
    { label: 'Trending', icon: TrendingUp, color: 'text-orange-500' },
    { label: 'Favorites', icon: Heart, color: 'text-red-500' },
    { label: 'Movies', icon: Film, color: 'text-blue-500' },
    { label: 'News', icon: Globe, color: 'text-green-500' },
    { label: 'Shows', icon: Tv, color: 'text-purple-500' },
  ];

  // Mock "Recommended" list (just slice the channels for now)
  const recommended = channels.slice(0, 5);

  return (
    <div className="w-full h-full flex flex-col pt-safe-top pb-32 md:pb-10 overflow-y-auto custom-scrollbar">
      
      {/* Header */}
      <div className="px-6 md:px-12 pt-6 md:pt-10 mb-4 md:mb-6 shrink-0">
          <div className="flex items-center space-x-3 mb-2">
              <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-red-600 animate-pulse shadow-[0_0_10px_rgba(220,38,38,0.6)]" />
              <h1 className="text-2xl md:text-4xl font-black text-white tracking-tight">
                  Live <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-600">Now</span>
              </h1>
          </div>
          <p className="text-xs md:text-base text-stone-500 font-medium tracking-wide">Happening currently in the Nebula Network</p>
      </div>

      {/* Main Focus Carousel (Phone Optimized) */}
      <div className="w-full overflow-x-auto overflow-y-visible snap-x snap-mandatory flex items-center space-x-4 md:space-x-8 px-6 md:px-[15vw] py-4 no-scrollbar scroll-smooth min-h-[250px] md:min-h-[400px]">
         {channels.map((channel) => (
             <div 
                key={channel.id}
                onClick={() => { setChannel(channel.id); setView('player'); }}
                className="group relative flex-shrink-0 snap-center transition-all duration-300 ease-out transform cursor-pointer
                           w-[85vw] md:w-[600px] aspect-video rounded-2xl md:rounded-3xl overflow-hidden hover:scale-[1.02] md:hover:scale-105 active:scale-95 shadow-lg shadow-black/50 border border-stone-800/50"
             >
                {/* Background Image */}
                <img 
                    src={`https://picsum.photos/seed/${channel.id}tv/800/450`} 
                    alt={channel.name} 
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                />
                
                {/* Gradients for readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-90" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent opacity-60" />

                {/* Content Overlay */}
                <div className="absolute inset-0 p-5 md:p-8 flex flex-col justify-end">
                     
                     {/* Top Badges */}
                     <div className="absolute top-4 left-4 md:top-6 md:left-6 flex items-center space-x-2">
                        <div className={`px-2 py-1 rounded-md text-[9px] md:text-[10px] font-black uppercase tracking-widest text-white shadow-lg backdrop-blur-md bg-white/10 border border-white/10`}>
                            {channel.provider}
                        </div>
                        <div className="flex items-center bg-red-600/90 backdrop-blur-md text-white px-2 py-1 rounded-md text-[9px] md:text-[10px] font-black uppercase tracking-widest animate-pulse shadow-red-900/50 shadow-lg">
                            <Radio className="w-3 h-3 mr-1" /> LIVE
                        </div>
                     </div>

                     {/* Main Text */}
                     <div className="transform transition-transform duration-300 md:translate-y-2 md:group-hover:translate-y-0">
                         <h2 className="text-xl md:text-4xl font-black text-white leading-none mb-1 md:mb-2 drop-shadow-xl line-clamp-1">
                            {channel.name}
                         </h2>
                         <div className="flex items-center space-x-2 text-stone-300 text-xs md:text-sm font-medium">
                            <span className="text-orange-500 font-bold">{channel.category}</span>
                            <span className="text-stone-600">•</span>
                            <span className="line-clamp-1 opacity-80">{channel.description}</span>
                         </div>
                     </div>

                     {/* Play Button (Centered & Subtle) */}
                     <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 md:w-16 md:h-16 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/20 opacity-0 group-hover:opacity-100 scale-50 group-hover:scale-100 transition-all duration-300 pointer-events-none">
                         <Play className="w-5 h-5 md:w-7 md:h-7 text-white fill-white ml-1" />
                     </div>
                </div>
             </div>
         ))}
         {/* End Spacer */}
         <div className="w-2 flex-shrink-0" />
      </div>

      {/* Discover / Moods (Horizontal Scroll) */}
      <div className="px-6 md:px-12 mt-6">
           <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold text-stone-500 uppercase tracking-[0.2em]">Discover</h3>
              <button className="text-orange-500 text-xs font-bold hover:text-orange-400 transition-colors">View All</button>
           </div>
           
           <div className="flex space-x-3 overflow-x-auto no-scrollbar pb-4 snap-x">
               {quickCategories.map((cat, i) => (
                   <button 
                      key={i} 
                      className="snap-start flex-shrink-0 flex items-center space-x-3 px-5 py-3 rounded-2xl bg-stone-900/50 border border-stone-800 hover:bg-stone-800 hover:border-stone-700 active:scale-95 transition-all group min-w-[130px] backdrop-blur-md"
                   >
                       <div className={`w-8 h-8 rounded-full bg-stone-950 flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner ${cat.color}`}>
                           <cat.icon className="w-4 h-4 fill-current opacity-70" />
                       </div>
                       <span className="text-sm font-bold text-stone-300 group-hover:text-white transition-colors">{cat.label}</span>
                   </button>
               ))}
           </div>
      </div>

      {/* For You / Recommended (Vertical List) */}
      <div className="px-6 md:px-12 mt-6 mb-24">
          <h3 className="text-xs font-bold text-stone-500 uppercase tracking-[0.2em] mb-4 flex items-center">
             <Sparkles className="w-4 h-4 mr-2 text-orange-500" /> For You
          </h3>
          <div className="space-y-4">
              {recommended.map(channel => (
                  <div 
                    key={channel.id}
                    onClick={() => { setChannel(channel.id); setView('player'); }}
                    className="flex bg-stone-900/40 border border-stone-800 rounded-xl p-3 active:bg-stone-800 transition-all cursor-pointer"
                  >
                      <div className="w-24 h-16 rounded-lg overflow-hidden shrink-0 relative mr-4">
                           <img src={`https://picsum.photos/seed/${channel.id}tv/400/300`} className="w-full h-full object-cover" />
                           <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                               <Play className="w-5 h-5 text-white/80" />
                           </div>
                      </div>
                      <div className="flex flex-col justify-center">
                          <h4 className="text-white font-bold text-sm leading-tight mb-1">{channel.name}</h4>
                          <p className="text-stone-500 text-xs line-clamp-1">{channel.description}</p>
                      </div>
                  </div>
              ))}
          </div>
      </div>

    </div>
  );
};
    