import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useStore } from '../store';
import videojs from 'video.js';
import { Maximize2, Minimize2, Volume2, VolumeX, Pause, Play, Settings, AlertTriangle, Loader2, RefreshCw, Radio, Signal } from 'lucide-react';

interface VideoPlayerProps {
  isMini: boolean;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ isMini }) => {
  const { activeChannelId, channels, isPlaying, volume, togglePlay, setView } = useStore();
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null); 
  const controlsTimeoutRef = useRef<number | null>(null);

  // 0 = Direct, 1 = Proxy
  const [connectionMode, setConnectionMode] = useState<0 | 1>(0);
  const [error, setError] = useState<string | null>(null);
  const [showControls, setShowControls] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const channel = channels.find(c => c.id === activeChannelId);

  // Reset connection mode when channel changes
  useEffect(() => {
    setConnectionMode(0);
    setError(null);
  }, [activeChannelId]);

  // --- Keyboard Logic ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (isMini) return;
        switch(e.key.toLowerCase()) {
            case ' ':
                e.preventDefault();
                togglePlay();
                showControlsTemporarily();
                break;
            case 'f':
                toggleFullscreen();
                break;
            case 'm':
                if (playerRef.current) playerRef.current.muted(!playerRef.current.muted());
                break;
        }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMini, togglePlay]);

  const showControlsTemporarily = () => {
      setShowControls(true);
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
      controlsTimeoutRef.current = window.setTimeout(() => setShowControls(false), 3000);
  };

  const toggleFullscreen = () => {
      if (!document.fullscreenElement) {
          videoContainerRef.current?.requestFullscreen().catch(err => console.log(err));
      } else {
          document.exitFullscreen();
      }
  };

  // --- Smart Stream URL Generator ---
  const getStreamUrl = useCallback(() => {
    if (!channel?.streamUrl) return '';
    
    // Mode 0: Direct Connection
    if (connectionMode === 0) return channel.streamUrl;

    // Mode 1: CORS/HTTPS Proxy Tunneling
    // We use a public CORS proxy to bypass restriction. 
    // In production, this should be your own proxy server.
    return `https://corsproxy.io/?${encodeURIComponent(channel.streamUrl)}`;
  }, [channel, connectionMode]);

  // --- Video.js Initialization ---
  useEffect(() => {
    if (!channel || !channel.streamUrl || !videoContainerRef.current) return;

    setIsLoading(true);
    // Don't clear error immediately if we are retrying in mode 1, to show "Rerouting" status
    if (connectionMode === 0) setError(null);

    // Dispose old player
    if (playerRef.current) {
        playerRef.current.dispose();
        playerRef.current = null;
    }

    const videoElement = document.createElement("video-js");
    videoElement.classList.add('vjs-default-skin', 'vjs-big-play-centered', 'vjs-fill');
    videoElement.setAttribute('crossorigin', 'anonymous');
    videoContainerRef.current.appendChild(videoElement);

    const currentSrc = getStreamUrl();

    const options = {
        autoplay: isPlaying,
        controls: false,
        responsive: true,
        fluid: true,
        sources: [{
            src: currentSrc,
            type: 'application/x-mpegURL'
        }],
        html5: {
            vhs: {
                overrideNative: true,
                enableLowInitialPlaylist: true,
                handleManifestRedirects: true,
                bandwidth: 4194304, // Start with reasonable bandwidth assumption
                limitRenditionByPlayerDimensions: false,
                smoothQualityChange: true,
                cacheEncryptionKeys: true,
            },
            nativeAudioTracks: false,
            nativeVideoTracks: false
        }
    };

    const player = playerRef.current = videojs(videoElement, options, () => {
        console.log(`Player Ready (Mode: ${connectionMode === 0 ? 'Direct' : 'Proxy'})`);
        if (connectionMode === 1) {
            setIsLoading(false); // Proxy loaded successfully
            setError(null);
        }
    });

    // --- Event Listeners ---
    player.on('waiting', () => setIsLoading(true));
    player.on('stalled', () => setIsLoading(true));
    player.on('playing', () => setIsLoading(false));
    player.on('canplay', () => setIsLoading(false));
    
    player.on('error', () => {
        const err = player.error();
        console.warn("Player Error:", err);
        
        // Auto-Recovery Logic
        if (connectionMode === 0) {
            console.log("Direct connection failed. Attempting proxy reroute...");
            setIsLoading(true);
            setError("Rerouting Signal...");
            setTimeout(() => setConnectionMode(1), 1000); // Trigger re-render with proxy
        } else {
            setIsLoading(false);
            setError("Signal Lost. Source Unreachable.");
        }
    });

    return () => {
        if (player && !player.isDisposed()) {
            player.dispose();
            playerRef.current = null;
        }
    };
  }, [channel?.id, channel?.streamUrl, connectionMode, getStreamUrl]);

  // Sync Global State
  useEffect(() => {
    const player = playerRef.current;
    if (player && !player.isDisposed()) {
        if (isPlaying && player.paused()) {
            player.play()?.catch(() => {});
        } else if (!isPlaying && !player.paused()) {
            player.pause();
        }
    }
  }, [isPlaying]);

  useEffect(() => {
    const player = playerRef.current;
    if (player && !player.isDisposed()) {
        player.volume(volume / 100);
    }
  }, [volume]);

  if (!channel) return null;

  const handleMiniClick = () => {
      if (isMini) setView('player');
  };

  const handleManualRetry = (e: React.MouseEvent) => {
      e.stopPropagation();
      setConnectionMode(0); // Reset to direct
      setTimeout(() => {
        if(playerRef.current) {
            playerRef.current.src({ src: channel.streamUrl, type: 'application/x-mpegURL' });
            playerRef.current.load();
            playerRef.current.play().catch(() => {});
        }
      }, 100);
  };

  return (
    <div 
        onClick={handleMiniClick}
        onMouseMove={showControlsTemporarily}
        onDoubleClick={toggleFullscreen}
        className={`relative w-full h-full bg-black group overflow-hidden ${isMini ? 'cursor-pointer' : ''}`}
    >
      <div className="absolute inset-0 bg-black flex items-center justify-center">
         {channel.streamUrl ? (
            <div data-vjs-player className="w-full h-full">
                <div ref={videoContainerRef} className="w-full h-full" />
            </div>
         ) : (
            <div className="relative w-full h-full flex items-center justify-center">
                 <img 
                    src={channel.logo.startsWith('http') ? channel.logo : `https://picsum.photos/seed/${channel.id}/1920/1080`} 
                    alt="Broadcast" 
                    className="w-full h-full object-cover blur-3xl opacity-30 absolute"
                />
            </div>
         )}
      </div>

      {/* Status Overlays */}
      {channel.streamUrl && (
        <>
            {isLoading && !error && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 z-20 backdrop-blur-sm pointer-events-none transition-all">
                    <Loader2 className="w-10 h-10 text-orange-500 animate-spin mb-3" />
                    <div className="flex items-center space-x-2 text-stone-300 text-xs font-mono uppercase tracking-widest">
                        {connectionMode === 1 ? (
                            <>
                                <Signal className="w-3 h-3 text-green-500" />
                                <span>Establishing Secure Tunnel...</span>
                            </>
                        ) : (
                            <span>Acquiring Signal...</span>
                        )}
                    </div>
                </div>
            )}
            
            {error && (error !== "Rerouting Signal...") && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-stone-900/95 z-30 p-6 text-center animate-fade-in">
                    <AlertTriangle className="w-12 h-12 text-red-500 mb-2" />
                    <p className="text-white font-bold mb-1">Transmission Interrupted</p>
                    <p className="text-stone-500 text-xs font-mono mb-6 uppercase tracking-wider">{error}</p>
                    <button 
                        onClick={handleManualRetry}
                        className="flex items-center px-6 py-3 bg-stone-800 hover:bg-stone-700 text-white rounded-full text-sm font-bold transition-all border border-stone-700 hover:border-orange-500 hover:shadow-[0_0_20px_rgba(234,88,12,0.2)]"
                    >
                        <RefreshCw className="w-4 h-4 mr-2" /> Re-establish Link
                    </button>
                </div>
            )}
        </>
      )}

      {/* Mini Player Overlay */}
      {isMini && (
        <div className="absolute inset-0 z-40 flex items-end p-5 bg-gradient-to-t from-black via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            <div className="w-full">
                <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center space-x-2">
                        {isLoading ? <Loader2 className="w-3 h-3 text-orange-500 animate-spin" /> : 
                        <span className="text-[10px] bg-red-600 text-white px-1.5 py-0.5 rounded font-bold uppercase flex items-center">
                            <Radio className="w-2 h-2 mr-1" /> Live
                        </span>}
                        {connectionMode === 1 && <span className="text-[8px] text-green-500 font-mono border border-green-900 bg-green-900/20 px-1 rounded">SECURE</span>}
                    </div>
                    <Maximize2 className="text-white w-4 h-4" />
                </div>
                <p className="text-white font-bold text-base truncate">{channel.name}</p>
            </div>
        </div>
      )}

      {/* Full Player Controls */}
      {!isMini && (
        <div className={`absolute inset-0 flex flex-col justify-between p-6 md:p-10 z-40 transition-opacity duration-300 ${showControls || !isPlaying ? 'opacity-100' : 'opacity-0'}`}>
            <div className="flex justify-between items-start bg-gradient-to-b from-black/80 to-transparent p-4 -mx-4 -mt-4">
                <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-lg bg-stone-800 overflow-hidden flex items-center justify-center border border-stone-700">
                        {channel.logo.startsWith('http') ? <img src={channel.logo} className="w-full h-full object-cover" /> : <span className="text-white font-bold">{channel.logo}</span>}
                    </div>
                    <div>
                        <h2 className="text-white font-bold text-lg md:text-xl shadow-black drop-shadow-md">{channel.name}</h2>
                        <div className="flex items-center space-x-2">
                             <div className={`w-2 h-2 rounded-full ${error ? 'bg-red-900' : 'bg-red-600 animate-pulse'}`} />
                             <span className="text-red-500 text-xs font-bold uppercase tracking-widest shadow-black drop-shadow-sm">{error ? 'OFFLINE' : 'LIVE'}</span>
                             {connectionMode === 1 && (
                                <span className="ml-2 text-[10px] text-stone-400 font-mono flex items-center bg-stone-900/50 px-2 py-0.5 rounded-full border border-stone-800">
                                    <Signal className="w-2 h-2 mr-1 text-green-500" /> Proxy Active
                                </span>
                             )}
                        </div>
                    </div>
                </div>

                <div className="flex items-center space-x-4">
                    <button onClick={() => setView('home')} className="p-2 bg-black/40 hover:bg-black/60 text-white rounded-full backdrop-blur-md transition-all">
                        <Minimize2 className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <div className="space-y-4 bg-gradient-to-t from-black/90 to-transparent p-4 -mx-4 -mb-4 pb-8">
                 <div className="w-full h-1.5 bg-stone-700/50 rounded-full overflow-hidden backdrop-blur-sm cursor-pointer hover:h-2 transition-all">
                        <div className="h-full bg-orange-600 w-full relative">
                             <div className="absolute right-0 top-0 bottom-0 w-2 bg-white shadow-[0_0_10px_white]"></div>
                        </div>
                 </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-6">
                        <button 
                            onClick={(e) => { e.stopPropagation(); togglePlay(); }}
                            className="w-12 h-12 bg-white hover:bg-stone-200 text-black rounded-full flex items-center justify-center transition-all transform hover:scale-110"
                        >
                            {isPlaying ? <Pause className="fill-current w-5 h-5" /> : <Play className="fill-current w-5 h-5 ml-1" />}
                        </button>
                        
                        <div className="flex items-center space-x-2 group/vol">
                            {volume === 0 ? <VolumeX className="text-white w-5 h-5" /> : <Volume2 className="text-white w-5 h-5" />}
                            <div className="w-20 h-1 bg-stone-600 rounded-full overflow-hidden">
                                <div className="h-full bg-white" style={{ width: `${volume}%` }} />
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center space-x-4 text-stone-300">
                        <button className="hidden md:block" title="Settings"><Settings className="w-5 h-5 hover:text-white hover:rotate-90 transition-all" /></button>
                        <button onClick={toggleFullscreen} title="Fullscreen"><Maximize2 className="w-5 h-5 hover:text-white hover:scale-110 transition-all" /></button>
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};