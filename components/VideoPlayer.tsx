import React from 'react';
import { useStore } from '../store';
import { Maximize2, Minimize2, Volume2, VolumeX, Pause, Play, Settings, Cast } from 'lucide-react';

interface VideoPlayerProps {
  isMini: boolean;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ isMini }) => {
  const { activeChannelId, channels, isPlaying, togglePlay, setView } = useStore();
  
  const channel = channels.find(c => c.id === activeChannelId);

  if (!channel) return null;

  const handleMiniClick = () => {
      if (isMini) setView('player');
  };

  return (
    <div 
        onClick={handleMiniClick}
        className={`relative w-full h-full bg-black group overflow-hidden ${isMini ? 'cursor-pointer' : ''}`}
    >
      {/* Simulated Video Content */}
      <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
        <img 
            src={`https://picsum.photos/seed/${channel.id}/1920/1080`} 
            alt="Broadcast" 
            className={`w-full h-full object-cover transition-transform duration-[10s] ease-linear ${isPlaying ? 'scale-110' : 'scale-100'}`}
        />
        {/* Cinematic Vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(circle,_transparent_50%,_black_100%)] opacity-60" />
      </div>

      {/* Mini Player Overlay */}
      {isMini && (
        <div className="absolute inset-0 flex items-end p-5 bg-gradient-to-t from-black via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="w-full">
                <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] bg-red-600 text-white px-1.5 py-0.5 rounded font-bold uppercase">Live</span>
                    <Maximize2 className="text-white w-4 h-4" />
                </div>
                <p className="text-white font-bold text-base truncate">{channel.name}</p>
                <p className="text-stone-400 text-xs truncate">{channel.provider}</p>
            </div>
        </div>
      )}

      {/* Full Player Controls */}
      {!isMini && (
        <div className="absolute inset-0 flex flex-col justify-between p-10 z-10 opacity-0 hover:opacity-100 transition-opacity duration-300 bg-gradient-to-b from-black/60 via-transparent to-black/90">
            {/* Top Bar */}
            <div className="flex justify-between items-start">
                <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold shadow-lg ${channel.color}`}>
                        {channel.logo}
                    </div>
                    <div>
                        <h2 className="text-white font-bold text-xl">{channel.name}</h2>
                        <div className="flex items-center space-x-2">
                             <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                             <span className="text-red-500 text-xs font-bold uppercase tracking-widest">Live Broadcast</span>
                             <span className="text-stone-500 text-xs">•</span>
                             <span className="text-stone-400 text-xs font-medium">{channel.provider}</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center space-x-4">
                    <button className="p-3 bg-stone-900/50 hover:bg-stone-800 text-white rounded-full backdrop-blur-md transition-all">
                        <Cast className="w-5 h-5" />
                    </button>
                    <button onClick={() => setView('home')} className="p-3 bg-stone-900/50 hover:bg-stone-800 text-white rounded-full backdrop-blur-md transition-all">
                        <Minimize2 className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Bottom Controls */}
            <div className="space-y-6">
                 {/* Progress Bar (Simulated) */}
                 <div className="w-full h-1.5 bg-stone-700/50 rounded-full overflow-hidden backdrop-blur-sm group/progress cursor-pointer">
                        <div className="h-full bg-gradient-to-r from-orange-500 to-red-600 w-[98%] relative">
                            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow opacity-0 group-hover/progress:opacity-100" />
                        </div>
                 </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-8">
                        <button 
                            onClick={(e) => { e.stopPropagation(); togglePlay(); }}
                            className="w-16 h-16 bg-white hover:bg-stone-200 text-black rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.3)] transition-all transform hover:scale-110"
                        >
                            {isPlaying ? <Pause className="fill-current w-6 h-6" /> : <Play className="fill-current w-6 h-6 ml-1" />}
                        </button>
                        
                        <div className="flex items-center space-x-2 group/vol">
                            <Volume2 className="text-white w-6 h-6" />
                            <div className="w-24 h-1 bg-stone-600 rounded-full overflow-hidden">
                                <div className="w-3/4 h-full bg-white" />
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center space-x-6 text-stone-300 font-bold">
                        <span className="px-2 py-1 border border-stone-600 rounded text-xs">HD</span>
                        <span className="px-2 py-1 border border-stone-600 rounded text-xs">CC</span>
                        <Settings className="w-6 h-6 hover:text-white cursor-pointer hover:rotate-90 transition-transform" />
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};