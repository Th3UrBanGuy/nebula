import React, { useEffect, useRef, useState } from 'react';
import { useStore } from '../store';
import { Maximize2, Minimize2, Volume2, VolumeX, Pause, Play, Settings, Cast, Radio, AlertCircle, Loader2 } from 'lucide-react';
import Hls from 'hls.js';

interface VideoPlayerProps {
  isMini: boolean;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ isMini }) => {
  const { activeChannelId, channels, isPlaying, volume, togglePlay, setView } = useStore();
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const channel = channels.find(c => c.id === activeChannelId);

  // Effect: Initialize HLS or Native Player
  useEffect(() => {
    if (!channel || !channel.streamUrl) return;

    const video = videoRef.current;
    if (!video) return;

    setError(null);
    setIsLoading(true);

    const handleManifestParsed = () => {
        setIsLoading(false);
        if (isPlaying) {
            video.play().catch(e => console.warn("Autoplay blocked:", e));
        }
    };

    const handleError = (e: any, data: any) => {
        if (data.fatal) {
            console.error("HLS Fatal Error:", data);
            setIsLoading(false);
            setError("Stream Unavailable");
            // Try to recover
            switch (data.type) {
                case Hls.ErrorTypes.NETWORK_ERROR:
                    hlsRef.current?.startLoad();
                    break;
                case Hls.ErrorTypes.MEDIA_ERROR:
                    hlsRef.current?.recoverMediaError();
                    break;
                default:
                    if(hlsRef.current) hlsRef.current.destroy();
                    break;
            }
        }
    };

    // Clean up previous HLS instance
    if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
    }

    if (Hls.isSupported()) {
        const hls = new Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
        });
        hls.loadSource(channel.streamUrl);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, handleManifestParsed);
        hls.on(Hls.Events.ERROR, handleError);
        hlsRef.current = hls;
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        // Native HLS support (Safari)
        video.src = channel.streamUrl;
        video.addEventListener('loadedmetadata', handleManifestParsed);
        video.addEventListener('error', () => {
            setIsLoading(false);
            setError("Playback Error");
        });
    } else {
        setError("Format Not Supported");
        setIsLoading(false);
    }

    return () => {
        if (hlsRef.current) {
            hlsRef.current.destroy();
        }
        if (video) {
            video.removeEventListener('loadedmetadata', handleManifestParsed);
        }
    };
  }, [channel?.id, channel?.streamUrl]);

  // Effect: Sync Play/Pause with Store
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying && video.paused && !error) {
        video.play().catch(() => {});
    } else if (!isPlaying && !video.paused) {
        video.pause();
    }
  }, [isPlaying, error]);

  // Effect: Sync Volume
  useEffect(() => {
    if (videoRef.current) {
        videoRef.current.volume = volume / 100;
    }
  }, [volume]);

  if (!channel) return null;

  const handleMiniClick = () => {
      if (isMini) setView('player');
  };

  const hasRealStream = !!channel.streamUrl;

  return (
    <div 
        onClick={handleMiniClick}
        className={`relative w-full h-full bg-black group overflow-hidden ${isMini ? 'cursor-pointer' : ''}`}
    >
      {/* Video Content Layer */}
      <div className="absolute inset-0 flex items-center justify-center overflow-hidden bg-black">
        
        {hasRealStream ? (
            <>
                <video 
                    ref={videoRef}
                    className="w-full h-full object-cover"
                    poster={channel.logo.startsWith('http') ? channel.logo : undefined}
                    playsInline
                    crossOrigin="anonymous"
                />
                
                {/* Loading Spinner for Real Stream */}
                {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10 backdrop-blur-sm">
                        <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-stone-900/90 z-20">
                        <AlertCircle className="w-12 h-12 text-red-500 mb-2" />
                        <p className="text-white font-bold">{error}</p>
                        <p className="text-stone-500 text-xs mt-1">Check stream URL or connection</p>
                    </div>
                )}
            </>
        ) : (
            <>
                {/* Background Blur for Simulation */}
                <img 
                    src={channel.logo.startsWith('http') ? channel.logo : `https://picsum.photos/seed/${channel.id}/1920/1080`} 
                    alt="Broadcast" 
                    className={`w-full h-full object-cover blur-2xl opacity-50 absolute inset-0`}
                />
                {/* Simulated Placeholder */}
                <div className="relative z-10 w-full h-full flex items-center justify-center">
                    <img 
                        src={`https://picsum.photos/seed/${channel.id}/1920/1080`} 
                        alt="Broadcast" 
                        className={`w-full h-full object-cover transition-transform duration-[10s] ease-linear ${isPlaying ? 'scale-110' : 'scale-100'}`}
                    />
                </div>
            </>
        )}
        
        {/* Cinematic Vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(circle,_transparent_50%,_black_100%)] opacity-60 z-20 pointer-events-none" />
      </div>

      {/* Mini Player Overlay */}
      {isMini && (
        <div className="absolute inset-0 z-30 flex items-end p-5 bg-gradient-to-t from-black via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="w-full">
                <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center space-x-2">
                        {isLoading ? (
                             <Loader2 className="w-3 h-3 text-orange-500 animate-spin" />
                        ) : (
                            <span className="text-[10px] bg-red-600 text-white px-1.5 py-0.5 rounded font-bold uppercase">Live</span>
                        )}
                    </div>
                    <Maximize2 className="text-white w-4 h-4" />
                </div>
                <p className="text-white font-bold text-base truncate">{channel.name}</p>
                <p className="text-stone-400 text-xs truncate">{channel.provider}</p>
            </div>
        </div>
      )}

      {/* Full Player Controls */}
      {!isMini && (
        <div className="absolute inset-0 flex flex-col justify-between p-10 z-30 opacity-0 hover:opacity-100 transition-opacity duration-300 bg-gradient-to-b from-black/60 via-transparent to-black/90">
            {/* Top Bar */}
            <div className="flex justify-between items-start">
                <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-lg bg-stone-800 overflow-hidden flex items-center justify-center shadow-lg border border-stone-700">
                        {channel.logo.startsWith('http') ? (
                             <img src={channel.logo} className="w-full h-full object-cover" />
                        ) : (
                             <span className="text-white font-bold">{channel.logo}</span>
                        )}
                    </div>
                    <div>
                        <h2 className="text-white font-bold text-xl">{channel.name}</h2>
                        <div className="flex items-center space-x-2">
                             <div className={`w-2 h-2 rounded-full ${error ? 'bg-red-900' : 'bg-red-600 animate-pulse'}`} />
                             <span className="text-red-500 text-xs font-bold uppercase tracking-widest">{error ? 'OFFLINE' : 'Live Broadcast'}</span>
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
                 {/* Progress Bar (Live buffer visualization) */}
                 <div className="w-full h-1.5 bg-stone-700/50 rounded-full overflow-hidden backdrop-blur-sm group/progress cursor-pointer">
                        <div className="h-full bg-gradient-to-r from-orange-500 to-red-600 w-full relative opacity-80"></div>
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
                            {volume === 0 ? <VolumeX className="text-white w-6 h-6" /> : <Volume2 className="text-white w-6 h-6" />}
                            <div className="w-24 h-1 bg-stone-600 rounded-full overflow-hidden">
                                <div className="h-full bg-white" style={{ width: `${volume}%` }} />
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center space-x-6 text-stone-300 font-bold">
                        {hasRealStream && <span className="px-2 py-1 bg-red-600/20 border border-red-500/50 text-red-400 rounded text-[10px] tracking-wider uppercase">Live</span>}
                        <span className="px-2 py-1 border border-stone-600 rounded text-xs">{hasRealStream ? 'HLS' : 'SIM'}</span>
                        <span className="px-2 py-1 border border-stone-600 rounded text-xs">HD</span>
                        <Settings className="w-6 h-6 hover:text-white cursor-pointer hover:rotate-90 transition-transform" />
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};