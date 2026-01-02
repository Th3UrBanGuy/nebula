
import React, { useState, useEffect } from 'react';
import { useStore } from '../../store';
import { ArrowLeft, Key, RefreshCw, Plus, CheckCircle, AlertTriangle, Copy } from 'lucide-react';

interface Props {
    onBack: () => void;
}

export const LicenseManager: React.FC<Props> = ({ onBack }) => {
  const { adminLicenses, fetchAdminLicenses, generateNewLicense } = useStore();
  const [licenseForm, setLicenseForm] = useState({ plan: 'Standard Access', days: 30, customKey: '' });
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [licenseError, setLicenseError] = useState<string | null>(null);

  useEffect(() => {
      fetchAdminLicenses();
  }, []);

  const handleGenerateLicense = async () => {
      try {
        setLicenseError(null);
        await generateNewLicense(licenseForm.plan, licenseForm.days, licenseForm.customKey);
        setGeneratedKey("Key generated successfully."); 
        setLicenseForm({...licenseForm, customKey: ''}); 
        setTimeout(() => setGeneratedKey(null), 3000);
      } catch (e: any) {
        setLicenseError(e.message || "Failed to generate key");
        setTimeout(() => setLicenseError(null), 3000);
      }
  };

  const copyToClipboard = (text: string) => {
      navigator.clipboard.writeText(text);
      alert("Copied: " + text);
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
                     <div className="space-y-2">
                         <label className="text-xs font-bold text-stone-500 uppercase">Custom Key (Optional)</label>
                         <input 
                            type="text" 
                            value={licenseForm.customKey} 
                            onChange={e => setLicenseForm({...licenseForm, customKey: e.target.value.toUpperCase()})}
                            placeholder="E.g., PRO-USER-2025"
                            className="w-full bg-black border border-stone-700 p-3 rounded-xl text-white outline-none focus:border-green-500 font-mono tracking-wider"
                         />
                         <p className="text-[10px] text-stone-600">Leave blank to auto-generate.</p>
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
                     {licenseError && (
                        <div className="mt-4 p-4 bg-red-900/20 border border-red-500/50 rounded-xl text-center animate-pulse">
                            <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                            <p className="text-red-400 font-bold">{licenseError}</p>
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
};
