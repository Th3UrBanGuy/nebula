
import React, { useState } from 'react';
import { useStore } from '../store';
import { Search, Play, LayoutGrid, X } from 'lucide-react';
import { Channel } from '../types';

export const Assistant: React.FC = () => {
  const { channels, setChannel, setView } = useStore();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Channel[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const performSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) {
        setResults([]);
        setHasSearched(false);
        return;
    }

    const lowerQuery = searchQuery.toLowerCase();
    const filtered = channels.filter(c => 
        c.name.toLowerCase().includes(lowerQuery) || 
        c.category.toLowerCase().includes(lowerQuery) ||
        c.provider.toLowerCase().includes(lowerQuery) ||
        c.description.toLowerCase().includes(lowerQuery)
    );

    setResults(filtered);
    setHasSearched(true);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(query);
  };

  // Real-time search update
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      setQuery(val);
      if(val.trim() === '') {
          setResults([]);
          setHasSearched(false);
      } else {
          performSearch(val);
      }
  };

  const clearSearch = () => {
      setQuery('');
      setResults([]);
      setHasSearched(false);
  };

  const quickTags = ['Sports', 'News', 'Movies', 'Music', 'Kids', 'Docu'];

  return (
    <div className="w-full h-full flex items-center justify-center p-0 md:p-12 relative z-30">
      
      {/* Container: Full height/width on mobile, Card on desktop */}
      <div className="w-full md:max-w-3xl bg-stone-950 md:bg-stone-900/60 backdrop-blur-2xl rounded-none md:rounded-[2.5rem] border-x-0 md:border border-stone-800 overflow-hidden shadow-none md:shadow-2xl flex flex-col h-full md:h-[75vh] transition-all">
        
        {/* Header */}
        <div className="p-6 md:p-10 border-b border-stone-800 bg-gradient-to-r from-stone-900 via-stone-900 to-stone-900/50 flex items-center space-x-4 md:space-x-6 shrink-0 pt-safe-top">
           <div className="w-12 h-12 md:w-20 md:h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 md:rotate-3 shrink-0">
              <Search className="w-6 h-6 md:w-10 md:h-10 text-white" />
           </div>
           <div className="flex-1">
              <h2 className="text-2xl md:text-3xl font-black text-white mb-0.5 md:mb-1">Search</h2>
              <p className="text-stone-400 font-medium text-xs md:text-base truncate">Find content instantly</p>
           </div>
           {hasSearched && (
               <button onClick={clearSearch} className="md:hidden p-2 bg-stone-800 rounded-full text-stone-400">
                   <X className="w-5 h-5" />
               </button>
           )}
        </div>

        {/* Content Area */}
        <div className="flex-1 p-4 md:p-8 flex flex-col overflow-y-auto bg-stone-950/30 custom-scrollbar overscroll-contain">
           
           {!hasSearched && (
             <div className="flex-1 flex flex-col items-center justify-center text-center text-stone-500 space-y-4 md:space-y-6">
                <LayoutGrid className="w-12 h-12 md:w-16 md:h-16 mx-auto text-stone-800 opacity-50" />
                <div className="space-y-1">
                    <h3 className="text-lg md:text-xl font-bold text-stone-300">Browse Categories</h3>
                    <p className="text-xs md:text-sm text-stone-600">Select a tag to quick filter</p>
                </div>
                <div className="flex flex-wrap gap-2 md:gap-3 justify-center max-w-xs md:max-w-md">
                    {quickTags.map(tag => (
                        <button 
                            key={tag} 
                            onClick={() => {setQuery(tag); performSearch(tag);}} 
                            className="px-4 py-2 rounded-lg md:rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-800 text-xs md:text-sm font-bold transition-colors text-stone-400 hover:text-white active:scale-95"
                        >
                            {tag}
                        </button>
                    ))}
                </div>
             </div>
           )}

           {hasSearched && results.length === 0 && (
               <div className="flex-1 flex flex-col items-center justify-center text-stone-500">
                   <Search className="w-12 h-12 mb-4 opacity-20" />
                   <p className="text-lg font-bold">No signals found</p>
                   <p className="text-sm text-stone-600">Try checking the spelling or category.</p>
               </div>
           )}

           {hasSearched && results.length > 0 && (
             <div className="space-y-3 md:space-y-4 animate-fade-in-up pb-20">
                <div className="flex justify-between items-end px-1">
                    <p className="text-[10px] md:text-xs font-bold text-stone-500 uppercase tracking-widest">
                        Results ({results.length})
                    </p>
                </div>
                
                {results.map(channel => (
                    <div 
                        key={channel.id}
                        onClick={() => { setChannel(channel.id); setView('player'); }}
                        className="group flex items-center bg-stone-900/50 md:bg-gradient-to-r md:from-stone-900 md:to-black border border-stone-800/50 rounded-xl md:rounded-2xl p-3 md:p-4 cursor-pointer hover:border-blue-500 transition-all shadow-sm active:bg-stone-800"
                    >
                        <div className={`w-12 h-12 md:w-16 md:h-16 rounded-lg md:rounded-xl ${channel.color || 'bg-stone-800'} flex items-center justify-center shrink-0 mr-4 shadow-lg overflow-hidden relative`}>
                            {channel.logo.startsWith('http') ? (
                                <img src={channel.logo} className="w-full h-full object-cover" alt={channel.name}/>
                            ) : (
                                <span className="text-lg md:text-xl font-black text-white/50">{channel.logo}</span>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-0.5">
                                <span className="text-[9px] font-bold text-stone-500 uppercase tracking-wider bg-stone-950 px-1.5 py-0.5 rounded border border-stone-800">
                                    {channel.category}
                                </span>
                            </div>
                            <h3 className="text-base md:text-xl font-bold text-white group-hover:text-blue-200 transition-colors truncate">
                                {channel.name}
                            </h3>
                            <p className="text-xs md:text-sm text-stone-500 truncate">{channel.description}</p>
                        </div>
                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-stone-800 group-hover:bg-white flex items-center justify-center transition-colors shrink-0 ml-2">
                            <Play className="w-3 h-3 md:w-4 md:h-4 text-white group-hover:text-black fill-current ml-0.5" />
                        </div>
                    </div>
                ))}
             </div>
           )}

        </div>

        {/* Input Area */}
        <form onSubmit={handleSearch} className="p-4 md:p-8 bg-stone-950/80 backdrop-blur-xl border-t border-stone-800 shrink-0 pb-safe md:pb-8 sticky bottom-0 z-20">
           <div className="relative group">
             <input
               type="text"
               value={query}
               onChange={handleInputChange}
               placeholder="Search channels..."
               className="w-full bg-stone-900 text-white pl-5 pr-12 py-3.5 md:py-5 rounded-xl md:rounded-2xl border border-stone-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-stone-600 font-bold text-sm md:text-lg shadow-inner"
               autoFocus
             />
             
             {query ? (
                 <button 
                    type="button"
                    onClick={clearSearch}
                    className="absolute right-2 top-2 bottom-2 w-10 md:w-12 flex items-center justify-center text-stone-500 hover:text-white transition-colors"
                 >
                    <X className="w-5 h-5" />
                 </button>
             ) : (
                 <div className="absolute right-2 top-2 bottom-2 w-10 md:w-12 flex items-center justify-center pointer-events-none">
                    <Search className="w-5 h-5 text-stone-600" />
                 </div>
             )}
           </div>
        </form>

      </div>
    </div>
  );
};
