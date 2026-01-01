import React from 'react';
import { useStore } from '../store';
import { PlayCircle, Info, Radio, Zap, Globe } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { channels, setChannel, setView } = useStore();
  
  // Logic to group by providers or feature content
  const featured = channels[0];
  const providers = Array.from(new Set(channels.map(c => c.provider))) as string[];

  return (
    <div className="w-full h-full overflow-y-auto pb-32 no-scrollbar">
      
      {/* Provider Quick Select */}
      <div className="flex items-center space-x-3 md:space-x-4 mb-6 md:mb-8 overflow-x-auto no-scrollbar py-2">
         {providers.map((provider, idx) => (
             <button key={provider} className="flex items-center space-x-2 px-4 py-2 md:px-5 md:py-2.5 rounded-xl bg-stone-900 border border-stone-800 hover:border-orange-500 hover:bg-stone-800 transition-all group whitespace-nowrap">
                {idx === 0 ? <Zap className="w-3.5 h-3.5 md:w-4 md:h-4 text-orange-500" /> : <Globe className="w-3.5 h-3.5 md:w-4 md:h-4 text-stone-500 group-hover:text-orange-400" />}
                <span className="font-bold text-xs md:text-sm text-stone-300 group-hover:text-white">{provider}</span>
             </button>
         ))}
      </div>

      {/* Hero Section - Eye Catching */}
      {featured && (
        <div className="relative w-full h-[50vh] md:h-[65vh] rounded-2xl md:rounded-[2rem] overflow-hidden mb-8 md:mb-12 group border border-stone-800/50 shadow-2xl">
           <img 
             src={`https://picsum.photos/seed/${featured.id}hero/1600/900`} 
             alt="Featured" 
             className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[30s] ease-out"
           />
           {/* Warm gradient overlay */}
           <div className="absolute inset-0 bg-gradient-to-r from-stone-950 via-stone-950/40 to-transparent" />
           <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-transparent to-transparent" />
           
           <div className="absolute bottom-0 left-0 p-6 md:p-12 w-full md:w-3/4">
             <div className="flex items-center space-x-3 mb-4 md:mb-6">
                <span className="px-2 py-0.5 md:px-3 md:py-1 rounded-md bg-red-600 text-white text-[9px] md:text-[10px] font-black uppercase tracking-widest shadow-lg shadow-red-600/20">
                    Live
                </span>
                <span className="px-2 py-0.5 md:px-3 md:py-1 rounded-md bg-stone-800 text-orange-400 border border-stone-700 text-[9px] md:text-[10px] font-bold uppercase tracking-widest">
                    {featured.provider}
                </span>
             </div>
             
             <h1 className="text-4xl md:text-8xl font-black text-white mb-4 md:mb-6 leading-none tracking-tight">
               {featured.name} <br/>
               <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-600">UNLEASHED</span>
             </h1>
             
             <p className="text-stone-300 text-sm md:text-lg mb-6 md:mb-10 line-clamp-2 max-w-xl font-medium">
               {featured.description} Experience the highest fidelity streaming directly from the provider's native source.
             </p>
             
             <div className="flex space-x-3 md:space-x-4">
               <button 
                onClick={() => { setChannel(featured.id); setView('player'); }}
                className="flex items-center px-6 py-3 md:px-10 md:py-5 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl md:rounded-2xl font-bold transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(234,88,12,0.4)] text-sm md:text-base"
               >
                 <PlayCircle className="w-5 h-5 md:w-6 md:h-6 mr-2 fill-white text-orange-600" />
                 Start Watching
               </button>
               <button className="flex items-center px-4 py-3 md:px-8 md:py-5 bg-stone-900/60 backdrop-blur-md text-white rounded-xl md:rounded-2xl font-bold transition-all border border-stone-700 hover:bg-stone-800 text-sm md:text-base">
                 <Info className="w-5 h-5 md:w-6 md:h-6 mr-2" />
                 Details
               </button>
             </div>
           </div>
        </div>
      )}

      {/* Content Rows by Provider/Category */}
      {providers.map((provider) => {
          const providerChannels = channels.filter(c => c.provider === provider);
          return (
            <div key={provider} className="mb-8 md:mb-12">
                <div className="flex items-center justify-between mb-4 md:mb-6 px-1 md:px-2">
                    <h2 className="text-xl md:text-2xl font-bold text-white flex items-center">
                        <span className="w-1.5 h-6 md:h-8 bg-gradient-to-b from-orange-500 to-red-600 rounded-full mr-3 md:mr-4" />
                        {provider} <span className="ml-2 text-stone-600 text-base md:text-lg font-normal">Network</span>
                    </h2>
                    <button className="text-[10px] md:text-xs font-bold text-orange-500 uppercase tracking-widest hover:text-orange-400">View All</button>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                    {providerChannels.map(channel => (
                        <div 
                        key={channel.id}
                        onClick={() => { setChannel(channel.id); setView('player'); }}
                        className="group relative aspect-[16/10] rounded-xl md:rounded-2xl overflow-hidden cursor-pointer bg-stone-900 border border-stone-800 hover:border-orange-500/50 transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-orange-900/20"
                        >
                            <img src={`https://picsum.photos/seed/${channel.id}thumb/800/500`} alt={channel.name} className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity duration-500" />
                            
                            {/* Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/20 to-transparent" />
                            
                            {/* Logo Badge */}
                            <div className={`absolute top-3 right-3 md:top-4 md:right-4 w-8 h-8 md:w-10 md:h-10 rounded-lg flex items-center justify-center text-xs font-black text-white shadow-lg ${channel.color}`}>
                                {channel.logo}
                            </div>

                            <div className="absolute bottom-0 left-0 p-4 md:p-5 w-full">
                                <span className="text-[9px] md:text-[10px] font-bold text-orange-400 uppercase tracking-wider mb-1 block">{channel.category}</span>
                                <h3 className="text-lg md:text-xl font-bold text-white leading-tight group-hover:text-orange-100 transition-colors">{channel.name}</h3>
                            </div>
                            
                            {/* Live Indicator on Hover */}
                            <div className="absolute top-3 left-3 md:top-4 md:left-4 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity flex items-center bg-red-600/90 backdrop-blur-sm text-white text-[9px] md:text-[10px] font-bold px-2 py-1 rounded">
                                <Radio className="w-3 h-3 mr-1" /> LIVE
                            </div>
                        </div>
                    ))}
                </div>
            </div>
          );
      })}

    </div>
  );
};