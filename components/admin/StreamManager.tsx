
import React, { useState } from 'react';
import { useStore } from '../../store';
import { Channel } from '../../types';
import { ArrowLeft, MonitorPlay, Trash2, Info } from 'lucide-react';

interface Props {
    onBack: () => void;
}

export const StreamManager: React.FC<Props> = ({ onBack }) => {
  const { channels, removeChannel, importChannels } = useStore();
  const [streamTab, setStreamTab] = useState<'list' | 'create' | 'import'>('list');
  const [m3uInput, setM3uInput] = useState('');
  const [parsedChannels, setParsedChannels] = useState<Channel[]>([]);
  const [manualForm, setManualForm] = useState({ name: '', logo: '', category: '', provider: 'Custom', streamUrl: '', description: '' });

  const parseM3U = () => {
      if (!m3uInput) return;
      const lines = m3uInput.split('\n');
      const newChannels: Channel[] = [];
      let currentInfo: Partial<Channel> = {};

      lines.forEach((line) => {
          line = line.trim();
          if (line.startsWith('#EXTINF')) {
              const logoMatch = line.match(/tvg-logo="([^"]*)"/);
              const groupMatch = line.match(/group-title="([^"]*)"/);
              const nameMatch = line.match(/,(.*)$/);
              
              currentInfo = {
                  name: nameMatch ? nameMatch[1].trim() : 'Unknown Stream',
                  logo: logoMatch ? logoMatch[1] : '',
                  category: groupMatch ? groupMatch[1] : 'Uncategorized',
                  provider: 'IPTV Stream',
                  color: 'bg-stone-800'
              };
          } else if (line.startsWith('http')) {
              if (currentInfo.name) {
                  newChannels.push({
                      id: 'imp_' + Math.random().toString(36).substr(2, 9),
                      number: (1000 + newChannels.length).toString(),
                      name: currentInfo.name!,
                      logo: currentInfo.logo || 'TV',
                      category: currentInfo.category!,
                      provider: 'IPTV',
                      color: currentInfo.color || 'bg-stone-800',
                      description: `Live stream from ${currentInfo.category}`,
                      streamUrl: line,
                  });
                  currentInfo = {};
              }
          }
      });
      setParsedChannels(newChannels);
  };

  const handleImport = () => {
      if (parsedChannels.length > 0) {
          importChannels(parsedChannels);
          setM3uInput('');
          setParsedChannels([]);
          setStreamTab('list');
      }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const newChannel: Channel = {
          id: 'man_' + Math.random().toString(36).substr(2, 9),
          number: 'MAN',
          name: manualForm.name,
          logo: manualForm.logo || manualForm.name.substring(0, 2).toUpperCase(),
          category: manualForm.category || 'General',
          provider: manualForm.provider,
          color: 'bg-stone-800',
          description: manualForm.description || 'Manual channel',
          streamUrl: manualForm.streamUrl
      };
      importChannels([newChannel]);
      setManualForm({ name: '', logo: '', category: '', provider: 'Custom', streamUrl: '', description: '' });
      setStreamTab('list');
  };

  return (
    <div className="w-full h-full flex flex-col bg-stone-950">
         <div className="bg-stone-900 border-b border-stone-800 p-4 flex items-center justify-between shadow-lg z-20">
             <div className="flex items-center space-x-4">
                 <button onClick={onBack} className="p-2 hover:bg-stone-800 rounded-lg text-stone-400 hover:text-white transition-colors">
                     <ArrowLeft className="w-6 h-6" />
                 </button>
                 <div className="h-8 w-px bg-stone-700 mx-2" />
                 <h2 className="text-xl font-black text-white uppercase tracking-wider flex items-center">
                     <MonitorPlay className="w-5 h-5 mr-3 text-orange-500" />
                     Stream Manager
                 </h2>
             </div>
             
             <div className="flex space-x-1 bg-black p-1 rounded-lg">
                 <button onClick={() => setStreamTab('list')} className={`px-4 py-2 rounded-md text-xs font-bold uppercase transition-all ${streamTab === 'list' ? 'bg-orange-600 text-white' : 'text-stone-500 hover:text-white'}`}>Active</button>
                 <button onClick={() => setStreamTab('create')} className={`px-4 py-2 rounded-md text-xs font-bold uppercase transition-all ${streamTab === 'create' ? 'bg-orange-600 text-white' : 'text-stone-500 hover:text-white'}`}>Create</button>
                 <button onClick={() => setStreamTab('import')} className={`px-4 py-2 rounded-md text-xs font-bold uppercase transition-all ${streamTab === 'import' ? 'bg-orange-600 text-white' : 'text-stone-500 hover:text-white'}`}>Import</button>
             </div>
         </div>

         <div className="flex-1 overflow-y-auto p-6 bg-stone-950 custom-scrollbar">
            
            {streamTab === 'list' && (
                <div className="space-y-4">
                    <div className="bg-orange-900/10 border border-orange-500/20 p-4 rounded-xl flex items-center text-orange-400 text-sm mb-6">
                        <Info className="w-4 h-4 mr-2" />
                        Displaying {channels.length} active broadcast signals.
                    </div>
                    <div className="grid grid-cols-1 gap-3">
                        {channels.map(ch => (
                            <div key={ch.id} className="bg-stone-900 border border-stone-800 p-4 rounded-xl flex items-center justify-between hover:border-stone-600 transition-all group">
                                <div className="flex items-center space-x-4">
                                    <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center overflow-hidden">
                                         {ch.logo.startsWith('http') ? <img src={ch.logo} className="w-full h-full object-cover" /> : <span className="text-xs font-bold text-stone-500">{ch.logo}</span>}
                                    </div>
                                    <div>
                                        <h3 className="text-white font-bold">{ch.name}</h3>
                                        <div className="flex items-center space-x-2 text-xs text-stone-500">
                                            <span className="bg-stone-800 px-1.5 rounded">{ch.category}</span>
                                            <span className="font-mono text-[10px]">{ch.id}</span>
                                        </div>
                                    </div>
                                </div>
                                <button onClick={() => removeChannel(ch.id)} className="p-2 bg-stone-800 text-stone-500 hover:bg-red-900 hover:text-red-500 rounded-lg transition-colors">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {streamTab === 'create' && (
                <div className="max-w-2xl mx-auto">
                    <div className="bg-stone-900 border border-stone-800 rounded-2xl p-8">
                        <h3 className="text-lg font-bold text-white mb-6">Manual Stream Injection</h3>
                        <form onSubmit={handleManualSubmit} className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <input required placeholder="Channel Name" value={manualForm.name} onChange={e => setManualForm({...manualForm, name: e.target.value})} className="bg-black border border-stone-700 p-3 rounded-xl text-white focus:border-orange-500 outline-none" />
                                <input placeholder="Category" value={manualForm.category} onChange={e => setManualForm({...manualForm, category: e.target.value})} className="bg-black border border-stone-700 p-3 rounded-xl text-white focus:border-orange-500 outline-none" />
                            </div>
                            <input required placeholder="Stream URL (M3U8)" value={manualForm.streamUrl} onChange={e => setManualForm({...manualForm, streamUrl: e.target.value})} className="w-full bg-black border border-stone-700 p-3 rounded-xl text-white focus:border-orange-500 outline-none font-mono text-sm" />
                            <input placeholder="Logo URL" value={manualForm.logo} onChange={e => setManualForm({...manualForm, logo: e.target.value})} className="w-full bg-black border border-stone-700 p-3 rounded-xl text-white focus:border-orange-500 outline-none text-sm" />
                            <button type="submit" className="w-full py-3 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl transition-all">DEPLOY STREAM</button>
                        </form>
                    </div>
                </div>
            )}

            {streamTab === 'import' && (
                <div className="max-w-4xl mx-auto">
                    <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 h-[70vh] flex flex-col">
                        <textarea 
                            value={m3uInput} onChange={e => setM3uInput(e.target.value)} 
                            className="flex-1 bg-black border border-stone-700 rounded-xl p-4 font-mono text-xs text-green-500 focus:outline-none mb-4 resize-none"
                            placeholder="#EXTM3U..."
                        />
                        <div className="flex space-x-4">
                            <button onClick={parseM3U} className="flex-1 py-3 bg-stone-800 text-white font-bold rounded-xl hover:bg-stone-700">Analyze</button>
                            {parsedChannels.length > 0 && <button onClick={handleImport} className="flex-1 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-500">Import {parsedChannels.length} Channels</button>}
                        </div>
                    </div>
                </div>
            )}

         </div>
    </div>
  );
};
