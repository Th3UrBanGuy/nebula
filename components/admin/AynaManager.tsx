
import React, { useState } from 'react';
import { useStore } from '../../store';
import { ArrowLeft, Zap, RefreshCw, CheckCircle, AlertTriangle } from 'lucide-react';

interface Props {
    onBack: () => void;
}

export const AynaManager: React.FC<Props> = ({ onBack }) => {
  const { aynaUrl, updateAynaUrl, syncAynaChannels } = useStore();
  const [aynaInput, setAynaInput] = useState(aynaUrl);
  const [aynaStatus, setAynaStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const [aynaMsg, setAynaMsg] = useState('');

  const handleAynaSync = async () => {
      setAynaStatus('syncing');
      await updateAynaUrl(aynaInput); 
      const result = await syncAynaChannels();
      if (result.success) {
          setAynaStatus('success');
          setAynaMsg(`Live Feed Active. Loaded ${result.count} Channels.`);
      } else {
          setAynaStatus('error');
          setAynaMsg(result.error || "Sync failed.");
      }
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
                     <Zap className="w-5 h-5 mr-3 text-blue-500" />
                     Ayna Auto Script
                 </h2>
             </div>
         </div>

         <div className="flex-1 p-8 md:p-16 flex flex-col items-center justify-center relative overflow-hidden">
             <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
                 <div className="w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-[100px]" />
             </div>

             <div className="w-full max-w-2xl bg-stone-900/50 backdrop-blur-xl border border-stone-800 rounded-3xl p-8 shadow-2xl relative z-10">
                 <h3 className="text-2xl font-bold text-white mb-6">Configuration</h3>
                 
                 <div className="mb-8">
                     <label className="text-xs font-bold text-stone-500 uppercase tracking-widest mb-3 block">JSON Feed URL</label>
                     <div className="flex space-x-2">
                        <input 
                            value={aynaInput} 
                            onChange={(e) => setAynaInput(e.target.value)} 
                            className="flex-1 bg-black/50 border border-stone-700 rounded-xl p-4 text-white font-mono text-sm focus:border-blue-500 outline-none transition-colors"
                        />
                     </div>
                     <p className="text-[10px] text-stone-500 mt-2">Points to the raw JSON output containing the 'channels' array. Updates are transient and strictly client-side.</p>
                 </div>

                 <div className="flex flex-col items-center">
                     <button 
                        onClick={handleAynaSync} 
                        disabled={aynaStatus === 'syncing'}
                        className={`
                            w-full py-5 rounded-2xl font-black text-lg uppercase tracking-widest shadow-lg transition-all flex items-center justify-center
                            ${aynaStatus === 'syncing' ? 'bg-stone-800 text-stone-500 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500 text-white hover:shadow-blue-500/20'}
                        `}
                     >
                        {aynaStatus === 'syncing' ? (
                            <><RefreshCw className="w-6 h-6 mr-3 animate-spin" /> Fetching Live Feed...</>
                        ) : (
                            <><Zap className="w-6 h-6 mr-3" /> Refresh Auto Script</>
                        )}
                     </button>

                     {aynaStatus === 'success' && (
                         <div className="mt-6 p-4 bg-green-900/20 border border-green-500/50 rounded-xl w-full text-center animate-fade-in-up">
                             <CheckCircle className="w-6 h-6 text-green-500 mx-auto mb-2" />
                             <p className="text-green-400 font-bold">{aynaMsg}</p>
                         </div>
                     )}

                     {aynaStatus === 'error' && (
                         <div className="mt-6 p-4 bg-red-900/20 border border-red-500/50 rounded-xl w-full text-center animate-pulse">
                             <AlertTriangle className="w-6 h-6 text-red-500 mx-auto mb-2" />
                             <p className="text-red-400 font-bold">{aynaMsg}</p>
                         </div>
                     )}
                 </div>
             </div>
         </div>
    </div>
  );
};
