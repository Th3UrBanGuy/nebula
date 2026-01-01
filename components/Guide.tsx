import React, { useState, useMemo } from 'react';
import { useStore } from '../store';
import { Play, SortAsc, Layers } from 'lucide-react';
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

  // Grouping for 'All' view (if not sorting A-Z)
  const groupedChannels = useMemo<Record<string, Channel[]> | null>(() => {
      if (activeCategory !== 'All' || filterMode === 'az') return null;
      
      const groups: Record<string, Channel[]> = {};
      channels.forEach(ch => {
          if (!groups[ch.category]) groups[ch.category] = [];
          groups[ch.category].push(ch);
      });
      return groups;
  }, [channels, activeCategory, filterMode]);

  return (
    <div className="w-full h-full flex overflow-hidden bg-stone-900/40 rounded-[2rem] border border-stone-800 backdrop-blur-md shadow-2xl">
      
      {/* Sidebar Categories */}
      <div className="w-48 md:w-64 bg-stone-950/80 border-r border-stone-800 p-6 flex flex-col overflow-y-auto custom-scrollbar">
          <h2 className="text-xl font-black text-white mb-6 flex items-center">
              <Layers className="w-5 h-5 mr-2 text-orange-500" />
              Library
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
      <div className="flex-1 flex flex-col bg-stone-950/30">
          
          {/* Toolbar */}
          <div className="h-20 border-b border-stone-800 flex items-center justify-between px-8 bg-stone-900/50 backdrop-blur-md">
              <h1 className="text-2xl font-bold text-white tracking-tight">
                  {activeCategory === 'All' ? 'All Channels' : activeCategory}
              </h1>
              
              <div className="flex items-center space-x-2 bg-stone-950 rounded-lg p-1 border border-stone-800">
                   <button 
                      onClick={() => setFilterMode('all')}
                      className={`px-3 py-1.5 rounded text-xs font-bold transition-all ${filterMode === 'all' ? 'bg-stone-800 text-white' : 'text-stone-500 hover:text-stone-300'}`}
                   >
                       Default
                   </button>
                   <button 
                      onClick={() => setFilterMode('az')}
                      className={`px-3 py-1.5 rounded text-xs font-bold transition-all flex items-center ${filterMode === 'az' ? 'bg-stone-800 text-white' : 'text-stone-500 hover:text-stone-300'}`}
                   >
                       <SortAsc className="w-3 h-3 mr-1" /> A-Z
                   </button>
              </div>
          </div>

          {/* Grid Area */}
          <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
              
              {/* If Grouped View (Default All) */}
              {groupedChannels ? (
                  Object.entries(groupedChannels).map(([group, groupChannels]) => (
                      <div key={group} className="mb-10 animate-fade-in-up">
                          <h3 className="text-lg font-bold text-stone-400 mb-4 flex items-center">
                              <span className="w-1.5 h-1.5 rounded-full bg-orange-500 mr-2" />
                              {group}
                          </h3>
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                              {(groupChannels as Channel[]).map(channel => (
                                  <ChannelCard key={channel.id} channel={channel} setChannel={setChannel} setView={setView} />
                              ))}
                          </div>
                      </div>
                  ))
              ) : (
                  // Flat Grid View (Filtered or Sorted)
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 animate-fade-in-up">
                      {displayedChannels.map(channel => (
                          <ChannelCard key={channel.id} channel={channel} setChannel={setChannel} setView={setView} />
                      ))}
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
        className="group relative aspect-[16/9] bg-stone-900 border border-stone-800 rounded-xl overflow-hidden cursor-pointer hover:border-orange-500/50 hover:shadow-[0_0_30px_rgba(0,0,0,0.5)] transition-all hover:scale-[1.02]"
    >
        {/* Background / Logo Area */}
        <div className={`absolute inset-0 flex items-center justify-center p-6 bg-gradient-to-br from-stone-800 to-stone-900`}>
             {channel.logo.startsWith('http') ? (
                 <img src={channel.logo} alt={channel.name} className="w-full h-full object-contain drop-shadow-lg opacity-80 group-hover:opacity-100 transition-opacity" />
             ) : (
                 <span className="text-4xl font-black text-stone-700 group-hover:text-stone-500">{channel.logo}</span>
             )}
        </div>
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

        {/* Text Info */}
        <div className="absolute bottom-0 left-0 right-0 p-3 transform translate-y-1 group-hover:translate-y-0 transition-transform">
            <p className="text-[10px] font-bold text-orange-500 uppercase tracking-widest mb-0.5">{channel.category}</p>
            <h4 className="text-white font-bold leading-tight line-clamp-1">{channel.name}</h4>
        </div>

        {/* Hover Play */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 backdrop-blur-[1px]">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg transform scale-50 group-hover:scale-100 transition-transform">
                <Play className="w-4 h-4 text-black fill-current ml-0.5" />
            </div>
        </div>
    </div>
);