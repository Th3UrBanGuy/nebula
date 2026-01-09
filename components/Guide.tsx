
import React, { useState, useMemo } from 'react';
import { useStore } from '../store';
import { Play, SortAsc, Layers, Filter, MoreVertical } from 'lucide-react';
import { Channel, ViewState } from '../types';

export const Guide: React.FC = () => {
  const { channels, setChannel, setView } = useStore();
  const [filterMode, setFilterMode] = useState<'all' | 'az'>('all');
  const [activeCategory, setActiveCategory] = useState<string>('All');

  // Extract unique categories
  const categories = useMemo<string[]>(() => {
    const cats = new Set<string>(channels.map((c: Channel) => c.category));
    return ['All', ...Array.from(cats)];
  }, [channels]);

  // Filter and Sort Channels
  const displayedChannels = useMemo(() => {
    let filtered = activeCategory === 'All' 
        ? channels 
        : channels.filter(c => c.category === activeCategory);
    
    if (filterMode === 'az') {
        filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name));
    }
    return filtered;
  }, [channels, activeCategory, filterMode]);

  return (
    <div className="w-full h-full flex flex-col md:flex-row overflow-hidden bg-stone-950/40 md:rounded-[2rem] md:border border-stone-800 backdrop-blur-md shadow-2xl relative pt-safe-top pb-32 md:pb-0">
      
      {/* Sidebar Categories - DESKTOP ONLY */}
      <div className="hidden md:flex w-64 bg-stone-950/80 border-r border-stone-800 p-6 flex-col overflow-y-auto custom-scrollbar">
          <h2 className="text-xl font-black text-white mb-6 flex items-center">
              <Layers className="w-5 h-5 mr-2 text-orange-500" />
              All Channels
          </h2>
          <div className="space-y-2">
              {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all flex justify-between items-center
                        ${activeCategory === cat 
                            ? 'bg-gradient-to-r from-stone-800 to-stone-900 text-white border border-stone-700 shadow-lg' 
                            : 'text-stone-500 hover:text-stone-300 hover:bg-stone-900/50'
                        }
                    `}
                  >
                      <span>{cat}</span>
                      {cat !== 'All' && <span className="text-[10px] bg-stone-800 text-stone-400 px-1.5 rounded">{channels.filter(c => c.category === cat).length}</span>}
                  </button>
              ))}
          </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col bg-stone-950/30 relative h-full">
          
          {/* Header */}
          <div className="flex flex-col bg-stone-900/50 backdrop-blur-md border-b border-stone-800 z-20 shrink-0">
              
              {/* Toolbar */}
              <div className="h-16 md:h-20 flex items-center justify-between px-6 md:px-8">
                  <div className="flex items-center overflow-hidden">
                      <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight truncate mr-3">
                          {activeCategory === 'All' ? 'TV Guide' : activeCategory}
                      </h1>
                      <span className="text-[10px] font-mono bg-stone-800 text-stone-400 px-2 py-0.5 rounded-full">
                           {displayedChannels.length}
                      </span>
                  </div>
                  
                  <div className="flex items-center space-x-2 bg-stone-950 rounded-lg p-1 border border-stone-800 shrink-0">
                       <button 
                          onClick={() => setFilterMode('all')}
                          className={`px-3 py-1.5 rounded text-xs font-bold transition-all ${filterMode === 'all' ? 'bg-stone-800 text-white' : 'text-stone-500 hover:text-stone-300'}`}
                       >
                           Recent
                       </button>
                       <button 
                          onClick={() => setFilterMode('az')}
                          className={`px-3 py-1.5 rounded text-xs font-bold transition-all flex items-center ${filterMode === 'az' ? 'bg-stone-800 text-white' : 'text-stone-500 hover:text-stone-300'}`}
                       >
                           <SortAsc className="w-3 h-3 mr-1" /> A-Z
                       </button>
                  </div>
              </div>

              {/* Mobile Categories Scroll */}
              <div className="md:hidden w-full overflow-x-auto no-scrollbar pb-3 px-6 flex items-center space-x-2">
                   {categories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-bold border transition-all flex-shrink-0
                            ${activeCategory === cat 
                                ? 'bg-orange-600 border-orange-500 text-white shadow-[0_0_15px_rgba(234,88,12,0.4)]' 
                                : 'bg-stone-900 border-stone-800 text-stone-400 hover:bg-stone-800'
                            }
                        `}
                      >
                          {cat}
                      </button>
                   ))}
              </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
              
              {/* LIST VIEW (Mobile Optimized) */}
              <div className="flex flex-col space-y-3 md:hidden">
                  {displayedChannels.map(channel => (
                      <div 
                        key={channel.id}
                        onClick={() => { setChannel(channel.id); setView('player'); }}
                        className="flex items-center bg-stone-900/50 border border-stone-800 p-3 rounded-2xl active:bg-stone-800 active:scale-[0.98] transition-all"
                      >
                          <div className={`w-16 h-12 ${channel.color || 'bg-stone-800'} rounded-lg flex items-center justify-center mr-4 shrink-0 shadow-inner`}>
                              {channel.logo.startsWith('http') ? (
                                  <img src={channel.logo} className="w-full h-full object-contain p-1" />
                              ) : (
                                  <span className="font-black text-stone-600 text-xs">{channel.logo}</span>
                              )}
                          </div>
                          <div className="flex-1 min-w-0">
                              <h3 className="text-white font-bold text-sm truncate">{channel.name}</h3>
                              <p className="text-stone-500 text-xs truncate">{channel.description || channel.provider}</p>
                          </div>
                          <button className="w-10 h-10 flex items-center justify-center text-stone-500">
                              <Play className="w-5 h-5 fill-current" />
                          </button>
                      </div>
                  ))}
              </div>

              {/* GRID VIEW (Desktop) */}
              <div className="hidden md:grid grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 animate-fade-in-up">
                  {displayedChannels.map(channel => (
                      <ChannelCard key={channel.id} channel={channel} setChannel={setChannel} setView={setView} />
                  ))}
              </div>
              
              {/* Empty State */}
              {displayedChannels.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-48 text-stone-500">
                      <Filter className="w-12 h-12 mb-4 opacity-50" />
                      <p className="text-sm font-bold">No channels found in this category.</p>
                  </div>
              )}
          </div>
      </div>
    </div>
  );
};

interface ChannelCardProps {
    channel: Channel;
    setChannel: (id: string) => void;
    setView: (view: ViewState) => void;
}

const ChannelCard: React.FC<ChannelCardProps> = ({ channel, setChannel, setView }) => (
    <div 
        onClick={() => { setChannel(channel.id); setView('player'); }}
        className="group relative aspect-[16/9] bg-stone-900 border border-stone-800 rounded-xl overflow-hidden cursor-pointer active:scale-95 hover:border-orange-500/50 hover:shadow-[0_0_30px_rgba(0,0,0,0.5)] transition-all md:hover:scale-[1.02]"
    >
        {/* Background / Logo Area */}
        <div className={`absolute inset-0 flex items-center justify-center p-6 bg-gradient-to-br from-stone-800 to-stone-900`}>
             {channel.logo.startsWith('http') ? (
                 <img src={channel.logo} alt={channel.name} loading="lazy" className="w-full h-full object-contain drop-shadow-lg opacity-80 group-hover:opacity-100 transition-opacity" />
             ) : (
                 <span className="text-4xl font-black text-stone-700 group-hover:text-stone-500">{channel.logo}</span>
             )}
        </div>
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

        {/* Text Info */}
        <div className="absolute bottom-0 left-0 right-0 p-3 transform translate-y-1 group-hover:translate-y-0 transition-transform">
            <p className="text-[10px] font-bold text-orange-500 uppercase tracking-widest mb-0.5">{channel.category}</p>
            <h4 className="text-white font-bold leading-tight line-clamp-1 text-base">{channel.name}</h4>
        </div>

        {/* Play Icon Hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 backdrop-blur-[1px]">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg transform scale-50 group-hover:scale-100 transition-transform">
                <Play className="w-4 h-4 text-black fill-current ml-0.5" />
            </div>
        </div>
    </div>
);
    