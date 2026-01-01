
import React, { useState, useEffect } from 'react';
import { useStore } from '../store';
import { Channel } from '../types';
import { format } from 'date-fns';
import { 
    ShieldAlert, Activity, Users, Database, AlertTriangle, 
    ArrowLeft, MonitorPlay, Key, FileText, Upload, Plus, 
    Trash2, CheckCircle, Tag, Link as LinkIcon, Info, Server, 
    Image as ImageIcon, RefreshCw, Copy
} from 'lucide-react';

export const AdminPanel: React.FC = () => {
  const { channels, user, removeChannel, setView, importChannels, adminLicenses, fetchAdminLicenses, generateNewLicense } = useStore();
  
  // Navigation State: 'dashboard' | 'streams' | 'licenses'
  const [activeModule, setActiveModule] = useState<'dashboard' | 'streams' | 'licenses'>('dashboard');

  // --- Sub-States for Streams Module ---
  const [streamTab, setStreamTab] = useState<'list' | 'create' | 'import'>('list');
  const [m3uInput, setM3uInput] = useState('');
  const [parsedChannels, setParsedChannels] = useState<Channel[]>([]);
  const [manualForm, setManualForm] = useState({ name: '', logo: '', category: '', provider: 'Custom', streamUrl: '', description: '' });

  // --- Sub-States for License Module ---
  const [licenseForm, setLicenseForm] = useState({ plan: 'Standard Access', days: 30 });
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);

  // Security Gate
  if (user?.role !== 'admin') {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-black text-red-500 p-8">
        <ShieldAlert className="w-24 h-24 mb-4 animate-pulse" />
        <h1 className="text-4xl font-black uppercase tracking-widest">Access Denied</h1>
        <button onClick={() => setView('home')} className="mt-8 px-6 py-2 bg-stone-800 rounded-lg text-white">Return Home</button>
      </div>
    );
  }

  // --- LOGIC: Stream Management ---
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

  // --- LOGIC: License Management ---
  const handleGenerateLicense = async () => {
      await generateNewLicense(licenseForm.plan, licenseForm.days);
      setGeneratedKey("Key generated successfully."); // Ideally, fetch the latest, but list updates automatically via store
      setTimeout(() => setGeneratedKey(null), 3000);
  };

  const copyToClipboard = (text: string) => {
      navigator.clipboard.writeText(text);
      alert("Copied: " + text);
  };

  // Fetch licenses when entering module
  useEffect(() => {
      if (activeModule === 'licenses') {
          fetchAdminLicenses();
      }
  }, [activeModule]);


  // --- VIEW: Toolbox Dashboard (Root) ---
  if (activeModule === 'dashboard') {
      return (
        <div className="w-full h-full flex flex-col bg-stone-950 p-6 md:p-12 overflow-y-auto custom-scrollbar relative">
             <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 pointer-events-none" />
             
             {/* Header */}
             <div className="flex justify-between items-center mb-12 relative z-10">
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tighter mb-2">ADMIN<span className="text-orange-600">TOOLBOX</span></h1>
                    <p className="text-stone-500 font-mono text-sm">SYSTEM INTEGRITY: NORMAL // USER: {user.name.toUpperCase()}</p>
                </div>
                <button onClick={() => setView('home')} className="px-6 py-3 bg-stone-900 border border-stone-800 text-stone-400 hover:text-white hover:border-orange-500 transition-all rounded-xl font-bold uppercase tracking-widest text-xs">
                    Exit Console
                </button>
             </div>

             {/* Cards Grid */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                 
                 {/* Card 1: Stream Command */}
                 <div 
                    onClick={() => setActiveModule('streams')}
                    className="group bg-stone-900/60 border border-stone-800 hover:border-orange-500 hover:bg-stone-900 p-8 rounded-3xl cursor-pointer transition-all duration-300 relative overflow-hidden shadow-2xl"
                 >
                     <div className="absolute right-0 top-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                         <MonitorPlay className="w-40 h-40 text-orange-500" />
                     </div>
                     <div className="w-16 h-16 bg-orange-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-orange-600/20 group-hover:scale-110 transition-transform">
                         <Activity className="w-8 h-8 text-white" />
                     </div>
                     <h2 className="text-2xl font-black text-white mb-2">Stream Command</h2>
                     <p className="text-stone-400 text-sm mb-6 max-w-sm">Manage active broadcasts, inject manual streams, or bulk import via M3U playlists.</p>
                     
                     <div className="flex items-center space-x-4 text-xs font-mono text-stone-500">
                         <span className="flex items-center"><Database className="w-3 h-3 mr-1" /> {channels.length} Active</span>
                         <span className="flex items-center"><Server className="w-3 h-3 mr-1" /> Online</span>
                     </div>
                 </div>

                 {/* Card 2: License Forge */}
                 <div 
                    onClick={() => setActiveModule('licenses')}
                    className="group bg-stone-900/60 border border-stone-800 hover:border-green-500 hover:bg-stone-900 p-8 rounded-3xl cursor-pointer transition-all duration-300 relative overflow-hidden shadow-2xl"
                 >
                     <div className="absolute right-0 top-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                         <Key className="w-40 h-40 text-green-500" />
                     </div>
                     <div className="w-16 h-16 bg-green-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-green-600/20 group-hover:scale-110 transition-transform">
                         <Key className="w-8 h-8 text-white" />
                     </div>
                     <h2 className="text-2xl font-black text-white mb-2">License Forge</h2>
                     <p className="text-stone-400 text-sm mb-6 max-w-sm">Generate new access keys, track redemption status, and manage user subscription plans.</p>
                     
                     <div className="flex items-center space-x-4 text-xs font-mono text-stone-500">
                         <span className="flex items-center"><Users className="w-3 h-3 mr-1" /> Access Control</span>
                         <span className="flex items-center text-green-500"><CheckCircle className="w-3 h-3 mr-1" /> Secure</span>
                     </div>
                 </div>

                 {/* Card 3: System Stats (Non-clickable summary) */}
                 <div className="md:col-span-2 bg-black/40 border border-stone-800 p-8 rounded-3xl flex flex-col md:flex-row items-center justify-between">
                     <div className="flex items-center space-x-6 mb-6 md:mb-0">
                         <div className="p-4 bg-stone-800 rounded-full">
                             <Server className="w-6 h-6 text-blue-400" />
                         </div>
                         <div>
                             <h3 className="text-lg font-bold text-white">System Status</h3>
                             <p className="text-stone-500 text-sm">All systems operational. Database latency: 12ms</p>
                         </div>
                     </div>
                     <div className="flex space-x-8 text-center">
                         <div>
                             <div className="text-2xl font-black text-white">4.2 TB</div>
                             <div className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">Bandwidth</div>
                         </div>
                         <div>
                             <div className="text-2xl font-black text-white">99.9%</div>
                             <div className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">Uptime</div>
                         </div>
                     </div>
                 </div>

             </div>
        </div>
      );
  }

  // --- VIEW: Stream Command Module ---
  if (activeModule === 'streams') {
      return (
        <div className="w-full h-full flex flex-col bg-stone-950">
             {/* Module Header */}
             <div className="bg-stone-900 border-b border-stone-800 p-4 flex items-center justify-between shadow-lg z-20">
                 <div className="flex items-center space-x-4">
                     <button onClick={() => setActiveModule('dashboard')} className="p-2 hover:bg-stone-800 rounded-lg text-stone-400 hover:text-white transition-colors">
                         <ArrowLeft className="w-6 h-6" />
                     </button>
                     <div className="h-8 w-px bg-stone-700 mx-2" />
                     <h2 className="text-xl font-black text-white uppercase tracking-wider flex items-center">
                         <MonitorPlay className="w-5 h-5 mr-3 text-orange-500" />
                         Stream Manager
                     </h2>
                 </div>
                 
                 {/* Internal Tabs */}
                 <div className="flex space-x-1 bg-black p-1 rounded-lg">
                     <button onClick={() => setStreamTab('list')} className={`px-4 py-2 rounded-md text-xs font-bold uppercase transition-all ${streamTab === 'list' ? 'bg-orange-600 text-white' : 'text-stone-500 hover:text-white'}`}>Active</button>
                     <button onClick={() => setStreamTab('create')} className={`px-4 py-2 rounded-md text-xs font-bold uppercase transition-all ${streamTab === 'create' ? 'bg-orange-600 text-white' : 'text-stone-500 hover:text-white'}`}>Create</button>
                     <button onClick={() => setStreamTab('import')} className={`px-4 py-2 rounded-md text-xs font-bold uppercase transition-all ${streamTab === 'import' ? 'bg-orange-600 text-white' : 'text-stone-500 hover:text-white'}`}>Import</button>
                 </div>
             </div>

             {/* Module Content */}
             <div className="flex-1 overflow-y-auto p-6 bg-stone-950 custom-scrollbar">
                
                {/* List View */}
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

                {/* Create View */}
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

                {/* Import View */}
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
  }

  // --- VIEW: License Forge Module ---
  if (activeModule === 'licenses') {
      return (
        <div className="w-full h-full flex flex-col bg-stone-950">
             {/* Module Header */}
             <div className="bg-stone-900 border-b border-stone-800 p-4 flex items-center justify-between shadow-lg z-20">
                 <div className="flex items-center space-x-4">
                     <button onClick={() => setActiveModule('dashboard')} className="p-2 hover:bg-stone-800 rounded-lg text-stone-400 hover:text-white transition-colors">
                         <ArrowLeft className="w-6 h-6" />
                     </button>
                     <div className="h-8 w-px bg-stone-700 mx-2" />
                     <h2 className="text-xl font-black text-white uppercase tracking-wider flex items-center">
                         <Key className="w-5 h-5 mr-3 text-green-500" />
                         License Manager
                     </h2>
                 </div>
                 <button onClick={fetchAdminLicenses} className="p-2 bg-stone-800 rounded-lg text-stone-400 hover:text-white"><RefreshCw className="w-4 h-4" /></button>
             </div>

             <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
                 
                 {/* Left Panel: Generator */}
                 <div className="w-full md:w-1/3 bg-stone-900/50 p-8 border-r border-stone-800 flex flex-col">
                     <h3 className="text-lg font-bold text-white mb-6">Generate New Key</h3>
                     
                     <div className="space-y-6 flex-1">
                         <div className="space-y-2">
                             <label className="text-xs font-bold text-stone-500 uppercase">Plan Type</label>
                             <select 
                                value={licenseForm.plan} 
                                onChange={e => setLicenseForm({...licenseForm, plan: e.target.value})}
                                className="w-full bg-black border border-stone-700 p-3 rounded-xl text-white outline-none focus:border-green-500"
                             >
                                 <option>Standard Access</option>
                                 <option>Premium Plus</option>
                                 <option>Nebula VIP</option>
                                 <option>Trial (7 Days)</option>
                             </select>
                         </div>
                         <div className="space-y-2">
                             <label className="text-xs font-bold text-stone-500 uppercase">Duration (Days)</label>
                             <input 
                                type="number" 
                                value={licenseForm.days} 
                                onChange={e => setLicenseForm({...licenseForm, days: parseInt(e.target.value)})}
                                className="w-full bg-black border border-stone-700 p-3 rounded-xl text-white outline-none focus:border-green-500"
                             />
                         </div>

                         <button onClick={handleGenerateLicense} className="w-full py-4 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center">
                             <Plus className="w-5 h-5 mr-2" /> Generate Key
                         </button>
                         
                         {generatedKey && (
                            <div className="mt-4 p-4 bg-green-900/20 border border-green-500/50 rounded-xl text-center animate-fade-in-up">
                                <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                                <p className="text-green-400 font-bold">Key Created Successfully</p>
                            </div>
                         )}
                     </div>
                 </div>

                 {/* Right Panel: List */}
                 <div className="flex-1 bg-stone-950 p-8 overflow-y-auto custom-scrollbar">
                     <h3 className="text-lg font-bold text-white mb-6">Existing Licenses</h3>
                     <div className="bg-stone-900 rounded-2xl border border-stone-800 overflow-hidden">
                         <table className="w-full text-left">
                             <thead className="bg-black text-stone-500 text-[10px] font-bold uppercase tracking-widest">
                                 <tr>
                                     <th className="p-4">Key Code</th>
                                     <th className="p-4">Plan</th>
                                     <th className="p-4">Duration</th>
                                     <th className="p-4">Status</th>
                                     <th className="p-4">Actions</th>
                                 </tr>
                             </thead>
                             <tbody className="divide-y divide-stone-800 text-sm text-stone-300">
                                 {adminLicenses.length === 0 ? (
                                     <tr>
                                         <td colSpan={5} className="p-8 text-center text-stone-500 italic">No licenses found in database.</td>
                                     </tr>
                                 ) : (
                                     adminLicenses.map((lic) => (
                                         <tr key={lic.id} className="hover:bg-stone-800/50">
                                             <td className="p-4 font-mono text-white">{lic.key}</td>
                                             <td className="p-4">{lic.plan}</td>
                                             <td className="p-4">{lic.durationDays} Days</td>
                                             <td className="p-4">
                                                 <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${lic.status === 'unused' ? 'bg-green-900/30 text-green-500' : 'bg-red-900/30 text-red-500'}`}>
                                                     {lic.status}
                                                 </span>
                                             </td>
                                             <td className="p-4">
                                                 <button onClick={() => copyToClipboard(lic.key)} className="p-2 hover:bg-stone-700 rounded text-stone-500 hover:text-white" title="Copy Key">
                                                     <Copy className="w-4 h-4" />
                                                 </button>
                                             </td>
                                         </tr>
                                     ))
                                 )}
                             </tbody>
                         </table>
                     </div>
                 </div>

             </div>
        </div>
      );
  }

  return null;
};
