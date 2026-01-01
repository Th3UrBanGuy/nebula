import React, { useState } from 'react';
import { useStore } from '../store';
import { Search, Sparkles, Flame, Play, LayoutGrid } from 'lucide-react';
import { Channel } from '../types';

export const Assistant: React.FC = () => {
  const { channels, setChannel, setView } = useStore();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Channel[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) {
        setResults([]);
        setHasSearched(false);
        return;
    }

    const lowerQuery = query.toLowerCase();
    const filtered = channels.filter(c => 
        c.name.toLowerCase().includes(lowerQuery) || 
        c.category.toLowerCase().includes(lowerQuery) ||
        c.provider.toLowerCase().includes(lowerQuery) ||
        c.description.toLowerCase().includes(lowerQuery)
    );

    setResults(filtered);
    setHasSearched(true);
  };

  // Real-time search update
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      setQuery(val);
      if(val.trim() === '') {
          setResults([]);
          setHasSearched(false);
      }
  };

  return (
    <div className="w-full h-full flex items-center justify-center p-4 md:p-12">
      <div className="w-full max-w-3xl bg-stone-900/60 backdrop-blur-2xl rounded-[2.5rem] border border-stone-800 overflow-hidden shadow-2xl flex flex-col h-[75vh]">
        
        {/* Header */}
        <div className="p-10 border-b border-stone-800 bg-gradient-to-r from-stone-900 via-stone-900 to-stone-900/50 flex items-center space-x-6">
           <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 rotate-3">
              <Search className="w-10 h-10 text-white" />
           </div>
           <div>
              <h2 className="text-3xl font-black text-white mb-1">Channel Search</h2>
              <p className="text-stone-400 font-medium">Find your favorite content instantly</p>
           </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-8 flex flex-col overflow-y-auto bg-stone-950/30 custom-scrollbar">
           
           {!hasSearched && (
             <div className="flex-1 flex flex-col items-center justify-center text-center text-stone-500 space-y-6">
                <LayoutGrid className="w-16 h-16 mx-auto text-stone-800" />
                <h3 className="text-xl font-bold text-stone-300">Browse the frequencies</h3>
                <div className="flex flex-wrap gap-3 justify-center max-w-md">
                    <button onClick={() => {setQuery("Sports"); setHasSearched(false);}} className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-800 text-sm transition-colors text-stone-400 hover:text-white">Sports</button>
                    <button onClick={() => {setQuery("Movies"); setHasSearched(false);}} className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-800 text-sm transition-colors text-stone-400 hover:text-white">Movies</button>
                    <button onClick={() => {setQuery("News"); setHasSearched(false);}} className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-800 text-sm transition-colors text-stone-400 hover:text-white">News</button>
                </div>
             </div>
           )}

           {hasSearched && results.length === 0 && (
               <div className="flex-1 flex flex-col items-center justify-center text-stone-500">
                   <p className="text-lg">No channels found for "{query}"</p>
               </div>
           )}

           {hasSearched && results.length > 0 && (
             <div className="space-y-4 animate-fade-in-up">
                <p className="text-xs font-bold text-stone-500 uppercase tracking-widest mb-4">Found {results.length} Channels</p>
                {results.map(channel => (
                    <div 
                    key={channel.id}
                    onClick={() => { setChannel(channel.id); setView('player'); }}
                    className="group flex items-center bg-gradient-to-r from-stone-900 to-black border border-stone-800 rounded-2xl p-4 cursor-pointer hover:border-blue-500 transition-all shadow-lg"
                    >
                    <div className={`w-16 h-16 rounded-xl ${channel.color} flex items-center justify-center text-xl font-black text-white mr-6 shadow-lg`}>
                        {channel.logo}
                    </div>
                    <div className="flex-1">
                        <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1 block">{channel.provider} • {channel.category}</span>
                        <h3 className="text-xl font-bold text-white group-hover:text-blue-200 transition-colors">{channel.name}</h3>
                        <p className="text-sm text-stone-500 truncate">{channel.description}</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-stone-800 group-hover:bg-white flex items-center justify-center transition-colors">
                        <Play className="w-4 h-4 text-white group-hover:text-black fill-current ml-0.5" />
                    </div>
                    </div>
                ))}
             </div>
           )}

        </div>

        {/* Input Area */}
        <form onSubmit={handleSearch} className="p-8 bg-stone-950 border-t border-stone-800">
           <div className="relative group">
             <input
               type="text"
               value={query}
               onChange={handleInputChange}
               placeholder="Search for channels, categories, or providers..."
               className="w-full bg-stone-900 text-white pl-6 pr-16 py-5 rounded-2xl border border-stone-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-stone-600 font-medium"
             />
             <button 
                type="submit"
                className="absolute right-3 top-3 bottom-3 w-12 bg-gradient-to-br from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-xl flex items-center justify-center transition-all shadow-lg"
             >
                <Search className="w-5 h-5 text-white" />
             </button>
           </div>
        </form>

      </div>
    </div>
  );
};