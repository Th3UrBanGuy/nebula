import React, { useState } from 'react';
import { useStore } from '../store';
import { Channel } from '../types';
import { ShieldAlert, Server, Activity, Users, Trash2, Edit, Plus, Database, AlertTriangle, CheckCircle, ArrowLeft, Upload, FileText, PlayCircle } from 'lucide-react';

export const AdminPanel: React.FC = () => {
  const { channels, user, removeChannel, setView, importChannels } = useStore();
  const [activeTab, setActiveTab] = useState<'overview' | 'channels' | 'import'>('overview');
  const [m3uInput, setM3uInput] = useState('');
  const [parsedChannels, setParsedChannels] = useState<Channel[]>([]);

  // Security Gate
  if (user?.role !== 'admin') {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-black text-red-500 p-8">
        <ShieldAlert className="w-24 h-24 mb-4 animate-pulse" />
        <h1 className="text-4xl font-black uppercase tracking-widest">Access Denied</h1>
        <p className="font-mono text-sm mt-2">Insufficient Clearance Level. This incident will be reported.</p>
        <button onClick={() => setView('home')} className="mt-8 px-6 py-2 bg-stone-800 rounded-lg text-white">Return Home</button>
      </div>
    );
  }

  const parseM3U = () => {
      if (!m3uInput) return;

      const lines = m3uInput.split('\n');
      const newChannels: Channel[] = [];
      let currentInfo: Partial<Channel> = {};

      lines.forEach((line) => {
          line = line.trim();
          if (line.startsWith('#EXTINF')) {
              // Extract metadata
              const logoMatch = line.match(/tvg-logo="([^"]*)"/);
              const groupMatch = line.match(/group-title="([^"]*)"/);
              const nameMatch = line.match(/,(.*)$/);
              
              const logo = logoMatch ? logoMatch[1] : '';
              const category = groupMatch ? groupMatch[1] : 'Uncategorized';
              const name = nameMatch ? nameMatch[1].trim() : 'Unknown Stream';

              // Map colors based on category loosely
              let color = 'bg-stone-800';
              if (category.toLowerCase().includes('sport')) color = 'bg-gradient-to-br from-red-700 to-red-500';
              else if (category.toLowerCase().includes('news')) color = 'bg-gradient-to-br from-red-600 to-orange-600';
              else if (category.toLowerCase().includes('movie')) color = 'bg-gradient-to-br from-purple-600 to-blue-600';
              else if (category.toLowerCase().includes('kid')) color = 'bg-gradient-to-br from-pink-500 to-orange-400';
              else if (category.toLowerCase().includes('bangla')) color = 'bg-gradient-to-br from-green-600 to-emerald-600';

              currentInfo = {
                  name,
                  logo,
                  category,
                  color,
                  provider: 'IPTV Stream'
              };
          } else if (line.startsWith('http')) {
              // Extract URL and finalize channel
              if (currentInfo.name) {
                  newChannels.push({
                      id: 'imp_' + Math.random().toString(36).substr(2, 9),
                      number: (1000 + newChannels.length).toString(),
                      name: currentInfo.name!,
                      logo: currentInfo.logo || 'TV',
                      category: currentInfo.category!,
                      provider: 'IPTV',
                      color: currentInfo.color!,
                      description: `Live stream from ${currentInfo.category}`,
                      streamUrl: line,
                  });
                  currentInfo = {}; // Reset
              }
          }
      });
      setParsedChannels(newChannels);
  };

  const handleImport = () => {
      if (parsedChannels.length > 0) {
          importChannels(parsedChannels);
          alert(`Successfully imported ${parsedChannels.length} channels.`);
          setM3uInput('');
          setParsedChannels([]);
          setActiveTab('channels');
      }
  };

  return (
    <div className="w-full h-full flex flex-col bg-stone-950 text-stone-200 overflow-hidden relative">
      {/* Background Matrix Effect */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(12,10,9,0.9),rgba(12,10,9,0.9)),url('https://media.istockphoto.com/id/1183318269/vector/hud-ui-gui-future-futuristic-screen-system-virtual-reality.jpg?s=612x612&w=0&k=20&c=L_oYx4pGzFq7tHkQzE_gWzJg_p_1y_q_x_x_x_x')] bg-cover bg-center opacity-10 pointer-events-none" />

      {/* Header */}
      <div className="p-6 border-b border-red-900/30 bg-stone-900/50 backdrop-blur-xl flex flex-col md:flex-row justify-between items-start md:items-center z-10 gap-4">
        <div className="flex items-center space-x-4">
            {/* Mobile Back Button */}
            <button onClick={() => setView('home')} className="md:hidden p-2 bg-stone-800 rounded-lg text-stone-400">
                <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="w-12 h-12 bg-red-600/20 border border-red-500 rounded-lg flex items-center justify-center">
                <ShieldAlert className="w-6 h-6 text-red-500" />
            </div>
            <div>
                <h1 className="text-xl md:text-2xl font-black text-white tracking-widest uppercase">Command Center</h1>
                <p className="text-xs font-mono text-red-400 hidden md:block">ADMINISTRATOR: {user.name.toUpperCase()}</p>
            </div>
        </div>
        <div className="flex space-x-2 w-full md:w-auto overflow-x-auto">
            <button 
                onClick={() => setActiveTab('overview')}
                className={`flex-1 md:flex-none px-4 py-2 rounded text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${activeTab === 'overview' ? 'bg-red-600 text-white' : 'bg-stone-900 border border-stone-800 text-stone-500 hover:text-white'}`}
            >
                System
            </button>
            <button 
                onClick={() => setActiveTab('channels')}
                className={`flex-1 md:flex-none px-4 py-2 rounded text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${activeTab === 'channels' ? 'bg-red-600 text-white' : 'bg-stone-900 border border-stone-800 text-stone-500 hover:text-white'}`}
            >
                Streams
            </button>
             <button 
                onClick={() => setActiveTab('import')}
                className={`flex-1 md:flex-none px-4 py-2 rounded text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${activeTab === 'import' ? 'bg-red-600 text-white' : 'bg-stone-900 border border-stone-800 text-stone-500 hover:text-white'}`}
            >
                Import
            </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-10 z-10 custom-scrollbar">
        
        {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 animate-fade-in-up">
                {/* Stats Cards */}
                <div className="bg-stone-900/80 border border-stone-800 p-6 rounded-2xl relative overflow-hidden group">
                    <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Activity className="w-24 h-24 text-green-500" />
                    </div>
                    <div className="flex items-center space-x-2 mb-4 text-green-500">
                        <Server className="w-5 h-5" />
                        <span className="text-xs font-bold uppercase tracking-widest">System Status</span>
                    </div>
                    <h3 className="text-4xl font-black text-white">ONLINE</h3>
                    <p className="text-stone-500 text-xs mt-2 font-mono">Uptime: 482h 12m</p>
                </div>

                <div className="bg-stone-900/80 border border-stone-800 p-6 rounded-2xl relative overflow-hidden group">
                     <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Users className="w-24 h-24 text-blue-500" />
                    </div>
                    <div className="flex items-center space-x-2 mb-4 text-blue-500">
                        <Users className="w-5 h-5" />
                        <span className="text-xs font-bold uppercase tracking-widest">Active Users</span>
                    </div>
                    <h3 className="text-4xl font-black text-white">8,492</h3>
                    <p className="text-stone-500 text-xs mt-2 font-mono">Peak: 12,300 @ 20:00</p>
                </div>

                <div className="bg-stone-900/80 border border-stone-800 p-6 rounded-2xl relative overflow-hidden group">
                    <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Database className="w-24 h-24 text-orange-500" />
                    </div>
                    <div className="flex items-center space-x-2 mb-4 text-orange-500">
                        <Database className="w-5 h-5" />
                        <span className="text-xs font-bold uppercase tracking-widest">Channels</span>
                    </div>
                    <h3 className="text-4xl font-black text-white">{channels.length}</h3>
                    <p className="text-stone-500 text-xs mt-2 font-mono">Bandwidth: 4.2 TB/s</p>
                </div>

                <div className="bg-stone-900/80 border-2 border-red-900/30 p-6 rounded-2xl relative overflow-hidden group">
                     <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <AlertTriangle className="w-24 h-24 text-red-500" />
                    </div>
                    <div className="flex items-center space-x-2 mb-4 text-red-500">
                        <AlertTriangle className="w-5 h-5" />
                        <span className="text-xs font-bold uppercase tracking-widest">Alerts</span>
                    </div>
                    <h3 className="text-4xl font-black text-white">0</h3>
                    <p className="text-stone-500 text-xs mt-2 font-mono">System Nominal</p>
                </div>

                {/* Server Logs Mockup */}
                <div className="md:col-span-2 lg:col-span-4 bg-black border border-stone-800 rounded-2xl p-6 font-mono text-xs text-stone-400">
                    <h4 className="text-white font-bold mb-4 flex items-center">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></span>
                        Live Kernel Logs
                    </h4>
                    <div className="space-y-1 h-32 overflow-y-auto custom-scrollbar">
                        <p>[20:14:02] <span className="text-blue-400">INFO</span> Connection established from 192.168.1.12</p>
                        <p>[20:14:05] <span className="text-orange-400">WARN</span> Latency spike detected on Node US-EAST-4</p>
                        <p>[20:14:06] <span className="text-blue-400">INFO</span> Optimized routing protocols initiated...</p>
                        <p>[20:14:10] <span className="text-green-400">SUCCESS</span> Stream ID #a2 buffered successfully (4k/60fps)</p>
                        <p>[20:14:12] <span className="text-blue-400">INFO</span> User Auth validation passed for session ID x892</p>
                    </div>
                </div>
            </div>
        )}

        {activeTab === 'channels' && (
            <div className="space-y-6 animate-fade-in-up">
                 <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-white">Active Broadcasting Streams</h2>
                    <button onClick={() => setActiveTab('import')} className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-all">
                        <Plus className="w-4 h-4 mr-2" /> Add Channel
                    </button>
                 </div>

                 <div className="bg-stone-900/50 border border-stone-800 rounded-2xl overflow-x-auto">
                    <table className="w-full text-left min-w-[600px]">
                        <thead className="bg-stone-950 text-stone-500 font-bold uppercase text-[10px] tracking-widest">
                            <tr>
                                <th className="p-4">Status</th>
                                <th className="p-4">Channel Name</th>
                                <th className="p-4">Category</th>
                                <th className="p-4">Stream Info</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-800 text-sm">
                            {channels.map((channel) => (
                                <tr key={channel.id} className="hover:bg-stone-800/50 transition-colors group">
                                    <td className="p-4">
                                        <div className="flex items-center text-green-500 text-xs font-bold">
                                            <CheckCircle className="w-4 h-4 mr-2" /> Active
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-8 h-8 rounded bg-stone-700 overflow-hidden flex items-center justify-center">
                                                {channel.logo.startsWith('http') ? (
                                                    <img src={channel.logo} alt="L" className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="text-[10px] font-bold text-white">{channel.logo}</span>
                                                )}
                                            </div>
                                            <span className="font-bold text-white">{channel.name}</span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className="px-2 py-1 bg-stone-800 rounded text-xs text-stone-300">{channel.category}</span>
                                    </td>
                                    <td className="p-4 text-stone-500 text-xs truncate max-w-[150px]">
                                        {channel.streamUrl ? 'HLS Stream' : 'Mock Source'}
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex justify-end space-x-2 opacity-50 group-hover:opacity-100 transition-opacity">
                                            <button 
                                                onClick={() => removeChannel(channel.id)}
                                                className="p-2 hover:bg-red-900/30 rounded text-stone-400 hover:text-red-500 transition-colors"
                                                title="Terminate Stream"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                 </div>
            </div>
        )}

        {activeTab === 'import' && (
            <div className="space-y-6 animate-fade-in-up">
                <div className="bg-stone-900/50 border border-stone-800 rounded-2xl p-6">
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                        <Upload className="w-5 h-5 mr-2 text-orange-500" />
                        M3U Playlist Importer
                    </h2>
                    <p className="text-sm text-stone-400 mb-6">
                        Paste your M3U8 content below. The system will intelligently analyze metadata, extract logos, categories, and stream URLs.
                    </p>
                    
                    <div className="flex gap-6 flex-col lg:flex-row">
                        <div className="flex-1">
                            <textarea
                                value={m3uInput}
                                onChange={(e) => setM3uInput(e.target.value)}
                                className="w-full h-96 bg-black border border-stone-800 rounded-xl p-4 font-mono text-xs text-green-500 focus:outline-none focus:border-orange-500 transition-colors"
                                placeholder="#EXTM3U..."
                            />
                            <button 
                                onClick={parseM3U}
                                className="mt-4 w-full py-3 bg-stone-800 hover:bg-stone-700 text-white font-bold rounded-xl transition-colors flex items-center justify-center"
                            >
                                <Activity className="w-4 h-4 mr-2" /> Analyze Content
                            </button>
                        </div>

                        <div className="flex-1 flex flex-col">
                             <div className="flex items-center justify-between mb-4">
                                 <h3 className="text-sm font-bold text-stone-300 uppercase tracking-wider">Preview ({parsedChannels.length})</h3>
                                 {parsedChannels.length > 0 && (
                                     <button 
                                        onClick={handleImport}
                                        className="px-4 py-2 bg-gradient-to-r from-orange-600 to-red-600 text-white text-xs font-bold rounded-lg shadow-lg hover:shadow-orange-500/20 transition-all flex items-center"
                                     >
                                         <Database className="w-3 h-3 mr-2" /> Save to Database
                                     </button>
                                 )}
                             </div>
                             
                             <div className="flex-1 bg-stone-950 border border-stone-800 rounded-xl overflow-hidden overflow-y-auto h-96 custom-scrollbar p-2 space-y-2">
                                 {parsedChannels.length === 0 ? (
                                     <div className="h-full flex flex-col items-center justify-center text-stone-600">
                                         <FileText className="w-8 h-8 mb-2 opacity-50" />
                                         <span className="text-xs">Waiting for analysis...</span>
                                     </div>
                                 ) : (
                                     parsedChannels.map((ch, idx) => (
                                         <div key={idx} className="flex items-center p-3 bg-stone-900 rounded-lg border border-stone-800">
                                              <div className="w-8 h-8 rounded bg-stone-800 mr-3 overflow-hidden">
                                                  {ch.logo && ch.logo.startsWith('http') ? <img src={ch.logo} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-[8px]">IMG</div>}
                                              </div>
                                              <div className="flex-1 min-w-0">
                                                  <div className="text-sm font-bold text-white truncate">{ch.name}</div>
                                                  <div className="text-[10px] text-stone-500 flex items-center">
                                                      <span className="bg-stone-800 px-1 rounded mr-2">{ch.category}</span>
                                                      <span className="truncate max-w-[150px] opacity-50">{ch.streamUrl}</span>
                                                  </div>
                                              </div>
                                         </div>
                                     ))
                                 )}
                             </div>
                        </div>
                    </div>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};