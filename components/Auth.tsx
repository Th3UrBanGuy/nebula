import React, { useState, useEffect } from 'react';
import { ArrowRight, Lock, Mail, Fingerprint, Activity, Hexagon, Globe, Shield, AlertTriangle, Database } from 'lucide-react';
import { useStore } from '../store';

export const Auth: React.FC = () => {
  const { login, isDbConfigured, dbConnectionError } = useStore();
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState<'admin' | 'viewer'>('viewer');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bootSequence, setBootSequence] = useState<string[]>([]);

  // Creative Boot Sequence Effect
  useEffect(() => {
    const sequence = [
      "INITIALIZING NEBULA CORE...",
      isDbConfigured ? "SECURE DB UPLINK ESTABLISHED." : "WARNING: DATABASE DISCONNECTED.",
      "VERIFYING ENCRYPTION KEYS...",
      "SYSTEM READY."
    ];
    let delay = 0;
    sequence.forEach((line, index) => {
        setTimeout(() => {
            setBootSequence(prev => [...prev, line]);
        }, delay);
        delay += 800;
    });
  }, [isDbConfigured]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    if (!isDbConfigured) {
        setError("Database Connection Failed. Check console for details.");
        setLoading(false);
        return;
    }

    // If logging in, role is undefined (inferred). If registering, use selected role.
    const success = await login(email, password, isLogin ? undefined : role);
    
    if (!success) {
        setError(isLogin ? "Invalid credentials or user not found." : "Registration failed. User may already exist.");
    }
    setLoading(false);
  };

  return (
    <div className="h-screen w-screen bg-black flex overflow-hidden relative selection:bg-orange-500/30">
      
      {/* LEFT PANEL */}
      <div className="hidden lg:flex lg:w-[55%] relative flex-col justify-between p-12 overflow-hidden bg-stone-950">
          <div className="absolute inset-0 z-0">
               <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] bg-orange-600/10 rounded-full blur-[120px] animate-pulse" />
               <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-blue-600/10 rounded-full blur-[100px]" />
               <div className="absolute inset-0 opacity-20" 
                    style={{ 
                        backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)', 
                        backgroundSize: '40px 40px' 
                    }} 
               />
          </div>

          <div className="relative z-10 h-full flex flex-col justify-between">
              <div>
                  <div className="flex items-center space-x-3 mb-8">
                      <div className="w-10 h-10 bg-gradient-to-tr from-orange-500 to-red-600 rounded-lg flex items-center justify-center shadow-lg shadow-orange-500/20">
                          <Hexagon className="w-6 h-6 text-white fill-current" />
                      </div>
                      <span className="text-xl font-bold tracking-[0.2em] text-white">NEBULA<span className="text-orange-500">.OS</span></span>
                  </div>
                  
                  <h1 className="text-6xl font-black text-white leading-tight mb-6">
                      Production <br />
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">Environment</span>
                  </h1>
                  <p className="text-xl text-stone-400 max-w-lg leading-relaxed">
                      Secure, persistent access to live media streams. Powered by Neon Serverless Database.
                  </p>
              </div>

              <div className="font-mono text-xs text-stone-500 space-y-2 mt-12">
                  {bootSequence.map((line, i) => (
                      <div key={i} className={`flex items-center space-x-2 animate-fade-in ${line.includes("WARNING") ? "text-red-500" : ""}`}>
                          <span className="text-orange-500">➜</span>
                          <span>{line}</span>
                      </div>
                  ))}
                  <div className="w-3 h-5 bg-orange-500 animate-pulse inline-block align-middle ml-1" />
              </div>
          </div>
      </div>

      {/* RIGHT PANEL - LOGIN FORM */}
      <div className="w-full lg:w-[45%] bg-stone-900 border-l border-stone-800 flex flex-col justify-center p-8 md:p-16 relative z-20 shadow-2xl">
          
          <div className="max-w-md mx-auto w-full">
              <div className="mb-8">
                  <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
                      {isLogin ? 'Authenticate' : 'Initialize ID'}
                  </h2>
                  <p className="text-stone-400 text-sm md:text-base">
                      {isLogin ? 'Enter credentials to access the system.' : 'Create a persistent user identity in the database.'}
                  </p>
              </div>

              {/* DB Connection Alert with Detailed Error */}
              {!isDbConfigured && (
                  <div className="mb-6 p-4 bg-orange-900/10 border border-orange-500/30 rounded-xl flex flex-col items-start text-orange-400 text-sm font-bold animate-pulse">
                      <div className="flex items-center mb-1">
                        <Database className="w-5 h-5 mr-3 shrink-0" />
                        <span>Database Not Connected</span>
                      </div>
                      <p className="text-xs font-normal opacity-70 mb-3 pl-8">
                        The system cannot authenticate without a live database.
                      </p>
                      {dbConnectionError && (
                        <div className="w-full bg-black/40 p-3 rounded-lg text-[10px] font-mono text-red-300 break-all border border-red-900/30">
                            ERROR_LOG: {dbConnectionError}
                        </div>
                      )}
                      <p className="text-[10px] mt-3 opacity-50 pl-1 font-mono uppercase tracking-wide">
                         ACTION REQUIRED: Verify VITE_DATABASE_URL in Vercel. <br /> Note: Changes require a Redeploy.
                      </p>
                  </div>
              )}

              {error && (
                  <div className="mb-6 p-4 bg-red-900/20 border border-red-500/50 rounded-xl flex items-center text-red-400 text-sm font-bold animate-pulse">
                      <AlertTriangle className="w-5 h-5 mr-3" />
                      {error}
                  </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                      <label className="text-xs font-bold text-stone-400 uppercase tracking-wider ml-1">Email Protocol</label>
                      <div className="relative group">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                              <Mail className="h-5 w-5 text-stone-500 group-focus-within:text-orange-500 transition-colors" />
                          </div>
                          <input
                              type="email"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              className="block w-full pl-12 pr-4 py-4 bg-stone-950 border-2 border-stone-800 rounded-xl text-white placeholder-stone-600 focus:border-orange-500 focus:ring-0 transition-all font-medium text-base"
                              placeholder="user@nebula.net"
                              required
                          />
                      </div>
                  </div>

                  <div className="space-y-2">
                      <label className="text-xs font-bold text-stone-400 uppercase tracking-wider ml-1">Access Key</label>
                      <div className="relative group">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                              <Lock className="h-5 w-5 text-stone-500 group-focus-within:text-orange-500 transition-colors" />
                          </div>
                          <input
                              type="password"
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              className="block w-full pl-12 pr-4 py-4 bg-stone-950 border-2 border-stone-800 rounded-xl text-white placeholder-stone-600 focus:border-orange-500 focus:ring-0 transition-all font-medium text-base"
                              placeholder="••••••••••••"
                              required
                          />
                      </div>
                  </div>

                  {!isLogin && (
                    <div className="space-y-2 pt-2 animate-fade-in-up">
                        <label className="text-xs font-bold text-stone-400 uppercase tracking-wider ml-1">Clearance Level</label>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                type="button"
                                onClick={() => setRole('viewer')}
                                className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center transition-all ${role === 'viewer' ? 'border-orange-500 bg-orange-500/10 text-white shadow-[0_0_15px_rgba(234,88,12,0.2)]' : 'border-stone-800 bg-stone-900/50 text-stone-500 hover:border-stone-700'}`}
                            >
                                <Activity className="w-6 h-6 mb-2" />
                                <span className="text-xs font-bold uppercase tracking-widest">Viewer</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setRole('admin')}
                                className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center transition-all ${role === 'admin' ? 'border-red-500 bg-red-500/10 text-white shadow-[0_0_15px_rgba(239,68,68,0.2)]' : 'border-stone-800 bg-stone-900/50 text-stone-500 hover:border-stone-700'}`}
                            >
                                <Shield className="w-6 h-6 mb-2" />
                                <span className="text-xs font-bold uppercase tracking-widest">Admin</span>
                            </button>
                        </div>
                    </div>
                  )}

                  <button
                      type="submit"
                      disabled={loading || !isDbConfigured}
                      className="group relative w-full flex justify-center py-4 px-4 border border-transparent rounded-xl text-base font-bold text-white bg-white overflow-hidden transition-all hover:scale-[1.02] active:scale-[0.98] mt-8 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                      <div className="absolute inset-0 bg-gradient-to-r from-orange-600 via-red-600 to-orange-600 group-hover:bg-[length:200%_200%] transition-all animate-gradient-xy"></div>
                      <span className="relative flex items-center">
                          {loading ? 'Connecting...' : (isLogin ? 'Initiate Session' : 'Create Identity')}
                          {!loading && <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                      </span>
                  </button>
              </form>

              <div className="mt-8 text-center">
                  <button 
                      onClick={() => { setIsLogin(!isLogin); setRole('viewer'); setError(null); }}
                      className="text-stone-400 hover:text-white text-sm font-medium transition-colors"
                  >
                      {isLogin ? "Need a clearance ID? " : "Existing Personnel? "}
                      <span className="text-orange-500 font-bold hover:underline">
                          {isLogin ? 'Register' : 'Login'}
                      </span>
                  </button>
              </div>
          </div>
      </div>
    </div>
  );
};