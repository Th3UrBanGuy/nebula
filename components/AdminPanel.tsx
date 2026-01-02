
import React, { useState } from 'react';
import { useStore } from '../store';
import { ShieldAlert, Activity, Users, Database, Server, Key, MonitorPlay, Zap, RefreshCw, Link as LinkIcon, CheckCircle } from 'lucide-react';
import { StreamManager } from './admin/StreamManager';
import { LicenseManager } from './admin/LicenseManager';
import { AynaManager } from './admin/AynaManager';

export const AdminPanel: React.FC = () => {
  const { channels, user, setView, aynaUrl } = useStore();
  const [activeModule, setActiveModule] = useState<'dashboard' | 'streams' | 'licenses' | 'ayna'>('dashboard');

  if (user?.role !== 'admin') {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-black text-red-500 p-8">
        <ShieldAlert className="w-24 h-24 mb-4 animate-pulse" />
        <h1 className="text-4xl font-black uppercase tracking-widest">Access Denied</h1>
        <button onClick={() => setView('home')} className="mt-8 px-6 py-2 bg-stone-800 rounded-lg text-white">Return Home</button>
      </div>
    );
  }

  if (activeModule === 'streams') {
      return <StreamManager onBack={() => setActiveModule('dashboard')} />;
  }

  if (activeModule === 'licenses') {
      return <LicenseManager onBack={() => setActiveModule('dashboard')} />;
  }

  if (activeModule === 'ayna') {
      return <AynaManager onBack={() => setActiveModule('dashboard')} />;
  }

  // Dashboard View
  return (
    <div className="w-full h-full flex flex-col bg-stone-950 p-6 md:p-12 overflow-y-auto custom-scrollbar relative">
         <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 pointer-events-none" />
         
         <div className="flex justify-between items-center mb-12 relative z-10">
            <div>
                <h1 className="text-4xl font-black text-white tracking-tighter mb-2">ADMIN<span className="text-orange-600">TOOLBOX</span></h1>
                <p className="text-stone-500 font-mono text-sm">SYSTEM INTEGRITY: NORMAL // USER: {user.name.toUpperCase()}</p>
            </div>
            <button onClick={() => setView('home')} className="px-6 py-3 bg-stone-900 border border-stone-800 text-stone-400 hover:text-white hover:border-orange-500 transition-all rounded-xl font-bold uppercase tracking-widest text-xs">
                Exit Console
            </button>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
             
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

             <div 
                onClick={() => setActiveModule('ayna')}
                className="group bg-stone-900/60 border border-stone-800 hover:border-blue-500 hover:bg-stone-900 p-8 rounded-3xl cursor-pointer transition-all duration-300 relative overflow-hidden shadow-2xl md:col-span-2"
             >
                 <div className="absolute right-0 top-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                     <Zap className="w-40 h-40 text-blue-500" />
                 </div>
                 <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-600/20 group-hover:scale-110 transition-transform">
                     <RefreshCw className="w-8 h-8 text-white" />
                 </div>
                 <h2 className="text-2xl font-black text-white mb-2">Ayna OTT Auto Script</h2>
                 <p className="text-stone-400 text-sm mb-6 max-w-sm">Automated content fetching protocol. Synchronize directly with external JSON feeds. No Database overhead.</p>
                 
                 <div className="flex items-center space-x-4 text-xs font-mono text-stone-500">
                     <span className="flex items-center"><LinkIcon className="w-3 h-3 mr-1" /> Dynamic Feed</span>
                     <span className="flex items-center text-blue-500 truncate max-w-[200px]">{aynaUrl}</span>
                 </div>
             </div>

         </div>
    </div>
  );
};
