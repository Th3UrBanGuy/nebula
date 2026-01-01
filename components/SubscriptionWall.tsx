
import React, { useState, useEffect } from 'react';
import { useStore } from '../store';
import { Lock, Key, CheckCircle, ShieldAlert, LogOut, Loader2, Clock } from 'lucide-react';

export const SubscriptionWall: React.FC = () => {
    const { user, redeemLicense, logout } = useStore();
    const [key, setKey] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error' | 'locked'>('idle');
    const [lockTimer, setLockTimer] = useState(0);

    // Lockout countdown effect
    useEffect(() => {
        let interval: any;
        if (status === 'locked' && lockTimer > 0) {
            interval = setInterval(() => {
                setLockTimer((prev) => prev - 1);
            }, 1000);
        } else if (lockTimer === 0 && status === 'locked') {
            setStatus('idle');
        }
        return () => clearInterval(interval);
    }, [status, lockTimer]);

    const handleRedeem = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Prevent multi-touch / bulk submission
        if (status === 'loading' || status === 'locked' || status === 'success') return;

        setStatus('loading');
        
        // Ensure immediate UI feedback to disable button
        // Slight artificial delay for effect and to debounce rapid clicks
        setTimeout(async () => {
            const success = await redeemLicense(key);
            if (success) {
                setStatus('success');
            } else {
                // Engage Lockout Protocol
                setStatus('locked');
                setLockTimer(3); // 3 seconds lock
            }
        }, 1500);
    };

    if (!user) return null;

    return (
        <div className="h-screen w-screen bg-stone-950 flex flex-col items-center justify-center relative overflow-hidden text-center p-6">
            
            {/* Background Atmosphere */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-orange-600/10 rounded-full blur-[100px] animate-pulse" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#0c0a09_100%)]" />
            </div>

            <div className="relative z-10 max-w-md w-full bg-stone-900/50 backdrop-blur-xl border border-stone-800 p-8 md:p-12 rounded-3xl shadow-2xl">
                
                <div className="w-16 h-16 bg-stone-800 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner border border-stone-700">
                    <Lock className="w-8 h-8 text-orange-500" />
                </div>

                <h1 className="text-3xl font-black text-white mb-2">Access Restricted</h1>
                <p className="text-stone-400 mb-8">
                    {user.license?.status === 'expired' 
                        ? "Your viewing license has expired. Please renew your access key." 
                        : "A valid license key is required to access the Nebula Live OS network."}
                </p>

                {status === 'success' ? (
                    <div className="animate-fade-in-up">
                        <div className="flex items-center justify-center text-green-500 mb-4">
                            <CheckCircle className="w-12 h-12" />
                        </div>
                        <p className="text-white font-bold text-lg mb-2">Access Granted</p>
                        <p className="text-stone-500 text-sm">Redirecting to secure stream...</p>
                    </div>
                ) : (
                    <form onSubmit={handleRedeem} className="space-y-4">
                        <div className="space-y-2 text-left">
                            <label className="text-xs font-bold text-stone-500 uppercase tracking-widest ml-1">License Key</label>
                            <div className="relative">
                                <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-500" />
                                <input 
                                    type="text" 
                                    value={key}
                                    onChange={(e) => { 
                                        if (status !== 'locked') {
                                            setKey(e.target.value.toUpperCase()); 
                                            if (status === 'error') setStatus('idle');
                                        }
                                    }}
                                    disabled={status === 'locked' || status === 'loading'}
                                    placeholder="XXXX-XXXX-XXXX"
                                    className={`w-full bg-black/50 border rounded-xl py-4 pl-12 pr-4 text-white placeholder-stone-600 focus:outline-none focus:ring-1 font-mono tracking-wider transition-all 
                                        ${status === 'locked' ? 'border-red-900/50 opacity-50 cursor-not-allowed' : 'border-stone-700 focus:border-orange-500 focus:ring-orange-500'}
                                    `}
                                />
                            </div>
                        </div>

                        {status === 'locked' && (
                            <div className="flex items-center justify-center text-red-500 text-xs font-bold bg-red-900/10 p-3 rounded-lg border border-red-900/50 animate-pulse">
                                <Clock className="w-4 h-4 mr-2" />
                                Security Lockout: {lockTimer}s
                            </div>
                        )}
                        
                        {status === 'error' && (
                             <div className="flex items-center justify-center text-red-500 text-xs font-bold bg-red-900/10 p-3 rounded-lg border border-red-900/50">
                                <ShieldAlert className="w-4 h-4 mr-2" />
                                Invalid License Key
                            </div>
                        )}

                        <button 
                            type="submit" 
                            disabled={status === 'loading' || status === 'locked' || !key}
                            className={`w-full py-4 font-bold rounded-xl shadow-[0_0_20px_rgba(234,88,12,0.3)] transition-all flex items-center justify-center
                                ${status === 'loading' || status === 'locked' 
                                    ? 'bg-stone-800 text-stone-500 cursor-not-allowed' 
                                    : 'bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white'}
                            `}
                        >
                            {status === 'loading' && <Loader2 className="w-5 h-5 animate-spin mr-2" />}
                            {status === 'locked' ? 'Locked' : (status === 'loading' ? 'Verifying...' : 'Activate Access')}
                        </button>
                    </form>
                )}

                <div className="mt-8 pt-6 border-t border-stone-800 flex justify-between items-center">
                     <span className="text-xs text-stone-600">Demo Key: <span className="text-stone-400 font-mono">LIVE-FREE-2025</span></span>
                     <button onClick={logout} className="text-xs text-stone-500 hover:text-white flex items-center transition-colors">
                        <LogOut className="w-3 h-3 mr-1" /> Logout
                     </button>
                </div>
            </div>
        </div>
    );
};
