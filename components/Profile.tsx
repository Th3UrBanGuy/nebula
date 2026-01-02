
import React, { useState } from 'react';
import { useStore } from '../store';
import { Shield, Camera, Edit2, Save, X, Mail, Fingerprint, LogOut, Check, Image as ImageIcon, Key } from 'lucide-react';
import { CHARACTER_AVATARS, COVER_SCENES } from '../constants';
import { format } from 'date-fns';

export const Profile: React.FC = () => {
  const { user, updateProfile, logout } = useStore();
  const [isEditing, setIsEditing] = useState(false);
  const [selectorMode, setSelectorMode] = useState<'avatar' | 'cover' | null>(null);
  
  // Local state for form
  const [formData, setFormData] = useState({
      name: user?.name || '',
      bio: user?.bio || '',
      email: user?.email || '',
      avatar: user?.avatar || '',
      coverImage: user?.coverImage || COVER_SCENES[0]
  });

  if (!user) return null;

  const handleSave = () => {
      updateProfile(formData);
      setIsEditing(false);
      setSelectorMode(null);
  };

  const selectImage = (url: string) => {
      if (selectorMode === 'avatar') {
          setFormData({ ...formData, avatar: url });
      } else if (selectorMode === 'cover') {
          setFormData({ ...formData, coverImage: url });
      }
      setSelectorMode(null);
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-start p-6 md:p-12 overflow-y-auto custom-scrollbar relative">
        <div className="w-full max-w-4xl relative">
            
            {/* --- Cover Image Section --- */}
            <div className="group w-full h-48 md:h-64 rounded-t-[2.5rem] bg-stone-900 border-x border-t border-stone-800 relative overflow-hidden transition-all">
                <img 
                    src={formData.coverImage} 
                    alt="Cover" 
                    className={`w-full h-full object-cover transition-all duration-700 ${isEditing ? 'opacity-50 blur-sm scale-105' : 'opacity-80'}`} 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-transparent to-stone-950/20" />
                
                {/* ID Badge */}
                <div className="absolute top-6 right-8 z-10">
                     <span className="bg-stone-950/50 backdrop-blur-md border border-stone-700 text-stone-300 px-3 py-1 rounded-full text-xs font-mono flex items-center shadow-lg">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse mr-2" />
                        ID: {user.id}
                     </span>
                </div>

                {/* Edit Cover Button */}
                {isEditing && (
                    <div className="absolute inset-0 flex items-center justify-center z-20">
                        <button 
                            onClick={() => setSelectorMode('cover')}
                            className="bg-black/50 hover:bg-black/70 backdrop-blur-md border border-stone-600 text-white px-6 py-3 rounded-xl flex items-center font-bold transition-all hover:scale-105"
                        >
                            <ImageIcon className="w-5 h-5 mr-2" />
                            Change Atmosphere
                        </button>
                    </div>
                )}
            </div>

            {/* --- Main Profile Card --- */}
            <div className="bg-stone-950/80 backdrop-blur-xl border border-stone-800 rounded-b-[2.5rem] p-8 md:p-12 relative -mt-1 shadow-2xl">
                
                {/* --- Avatar Section --- */}
                <div className="absolute -top-16 md:-top-20 left-8 md:left-12 flex items-end z-30">
                    <div className="relative group">
                        <div className={`w-32 h-32 md:w-40 md:h-40 rounded-[2rem] border-4 border-stone-950 bg-stone-800 overflow-hidden shadow-2xl transition-all ${isEditing ? 'ring-4 ring-orange-500/30' : ''}`}>
                            <img src={formData.avatar} alt="Profile" className={`w-full h-full object-cover transition-all ${isEditing ? 'opacity-50 grayscale' : ''}`} />
                        </div>
                        
                        {/* Edit Avatar Overlay */}
                        {isEditing && (
                            <div className="absolute inset-0 flex items-center justify-center cursor-pointer" onClick={() => setSelectorMode('avatar')}>
                                <div className="p-3 bg-orange-600 text-white rounded-xl shadow-lg hover:bg-orange-500 transition-all hover:scale-110">
                                    <Camera className="w-6 h-6" />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* --- Actions Toolbar --- */}
                <div className="flex flex-col-reverse md:flex-row justify-end md:space-x-3 mb-8 pt-12 md:pt-2 gap-3 md:gap-0">
                    {isEditing ? (
                        <>
                            <button 
                                onClick={() => { setIsEditing(false); setSelectorMode(null); }}
                                className="px-4 py-3 md:py-2 rounded-xl border border-stone-700 text-stone-400 hover:text-white hover:bg-stone-800 transition-all text-sm font-bold flex items-center justify-center"
                            >
                                <X className="w-4 h-4 mr-2" /> Cancel
                            </button>
                            <button 
                                onClick={handleSave}
                                className="px-6 py-3 md:py-2 rounded-xl bg-gradient-to-r from-orange-600 to-red-600 text-white hover:shadow-[0_0_20px_rgba(234,88,12,0.3)] transition-all text-sm font-bold flex items-center justify-center"
                            >
                                <Save className="w-4 h-4 mr-2" /> Save Changes
                            </button>
                        </>
                    ) : (
                        <>
                             <button 
                                onClick={logout}
                                className="px-4 py-3 md:py-2 rounded-xl border border-stone-800 bg-red-900/10 text-red-500 hover:bg-red-900/20 hover:border-red-800 transition-all text-sm font-bold flex items-center justify-center"
                            >
                                <LogOut className="w-4 h-4 mr-2" /> Logout
                            </button>
                            <button 
                                onClick={() => setIsEditing(true)}
                                className="px-6 py-3 md:py-2 rounded-xl border border-stone-700 bg-stone-900 text-white hover:bg-stone-800 transition-all text-sm font-bold flex items-center justify-center"
                            >
                                <Edit2 className="w-4 h-4 mr-2" /> Edit Profile
                            </button>
                        </>
                    )}
                </div>

                {/* --- Library Selector Drawer (Conditional Render) --- */}
                {isEditing && selectorMode && (
                    <div className="mb-8 p-6 bg-stone-900 rounded-2xl border border-stone-700 animate-fade-in-down shadow-inner">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-sm font-bold text-orange-500 uppercase tracking-widest">
                                Select {selectorMode === 'avatar' ? 'Character' : 'Atmosphere'}
                            </h3>
                            <button onClick={() => setSelectorMode(null)} className="text-stone-500 hover:text-white"><X className="w-4 h-4" /></button>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {(selectorMode === 'avatar' ? CHARACTER_AVATARS : COVER_SCENES).map((url, idx) => (
                                <div 
                                    key={idx}
                                    onClick={() => selectImage(url)}
                                    className={`relative group cursor-pointer rounded-xl overflow-hidden border-2 transition-all aspect-square ${
                                        (selectorMode === 'avatar' ? formData.avatar : formData.coverImage) === url 
                                        ? 'border-orange-500 ring-2 ring-orange-500/20' 
                                        : 'border-transparent hover:border-stone-500'
                                    }`}
                                >
                                    <img src={url} className="w-full h-full object-cover group-hover:scale-110 transition-transform" alt="Option" />
                                    {(selectorMode === 'avatar' ? formData.avatar : formData.coverImage) === url && (
                                        <div className="absolute inset-0 bg-orange-500/20 flex items-center justify-center">
                                            <div className="bg-orange-500 rounded-full p-1"><Check className="w-4 h-4 text-white" /></div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* --- User Details Form --- */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
                    
                    {/* Left Column: Core Info */}
                    <div className="md:col-span-2 space-y-6">
                        <div>
                            <label className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2 block">Display Name</label>
                            {isEditing ? (
                                <input 
                                    type="text" 
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    className="w-full bg-stone-900 border border-stone-700 text-2xl font-black text-white px-4 py-3 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
                                />
                            ) : (
                                <h1 className="text-4xl font-black text-white tracking-tight">{formData.name}</h1>
                            )}
                        </div>

                        <div>
                            <label className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2 block">Bio Signal</label>
                            {isEditing ? (
                                <textarea 
                                    value={formData.bio}
                                    onChange={(e) => setFormData({...formData, bio: e.target.value})}
                                    className="w-full bg-stone-900 border border-stone-700 text-stone-300 px-4 py-3 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 min-h-[100px] transition-all"
                                />
                            ) : (
                                <p className="text-lg text-stone-400 leading-relaxed max-w-2xl">{formData.bio}</p>
                            )}
                        </div>

                        <div className="pt-6 border-t border-stone-800">
                             <h3 className="text-sm font-bold text-white mb-4 flex items-center">
                                 <Shield className="w-4 h-4 mr-2 text-orange-500" />
                                 Security Clearance
                             </h3>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-4 bg-stone-900/30 border border-stone-800 rounded-xl">
                                    <div className="flex items-center space-x-3 mb-1">
                                        <Mail className="w-4 h-4 text-stone-500" />
                                        <span className="text-xs font-mono text-stone-500">LINKED EMAIL</span>
                                    </div>
                                    <div className="text-stone-200 font-medium truncate">{formData.email}</div>
                                </div>
                                <div className="p-4 bg-stone-900/30 border border-stone-800 rounded-xl">
                                    <div className="flex items-center space-x-3 mb-1">
                                        <Fingerprint className="w-4 h-4 text-stone-500" />
                                        <span className="text-xs font-mono text-stone-500">ROLE</span>
                                    </div>
                                    <div className="text-stone-200 font-medium uppercase">{user.role}</div>
                                </div>
                             </div>
                        </div>
                    </div>

                    {/* Right Column: Stats & Settings */}
                    <div className="space-y-6">
                        
                        {/* License Card */}
                        <div className="p-6 bg-gradient-to-br from-stone-900 to-stone-950 rounded-2xl border border-stone-800 relative overflow-hidden">
                             <h3 className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-4 flex items-center">
                                <Key className="w-3 h-3 mr-1" /> Access License
                             </h3>
                             {user.license ? (
                                 <div className="space-y-2 relative z-10">
                                     <div className="text-xl font-bold text-white">{user.license.planName}</div>
                                     <div className="flex items-center text-xs space-x-2">
                                         <span className={`px-2 py-0.5 rounded font-bold uppercase ${user.license.status === 'active' ? 'bg-green-900/30 text-green-500' : 'bg-red-900/30 text-red-500'}`}>
                                            {user.license.status}
                                         </span>
                                         <span className="text-stone-500">
                                            Expires: {format(user.license.expiryDate, 'MMM d, yyyy')}
                                         </span>
                                     </div>
                                 </div>
                             ) : (
                                 <div className="relative z-10">
                                     <div className="text-stone-400 text-sm mb-2">No active license found.</div>
                                     <button className="text-orange-500 text-xs font-bold hover:underline">Purchase Access</button>
                                 </div>
                             )}
                             {/* bg decoration */}
                             <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-orange-500/10 rounded-full blur-xl" />
                        </div>

                        <div className="p-6 bg-stone-900/30 rounded-2xl border border-stone-800">
                             <h3 className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-4">Viewing Stats</h3>
                             <div className="space-y-4">
                                 <div>
                                     <div className="flex justify-between text-sm mb-1">
                                         <span className="text-stone-400">Hours Streamed</span>
                                         <span className="text-white font-bold">128.5 hrs</span>
                                     </div>
                                     <div className="w-full h-1 bg-stone-800 rounded-full overflow-hidden">
                                         <div className="w-[65%] h-full bg-orange-600 rounded-full" />
                                     </div>
                                 </div>
                             </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    </div>
  );
};
