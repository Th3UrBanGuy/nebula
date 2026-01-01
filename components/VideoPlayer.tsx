import React, { useEffect, useRef, useState } from 'react';
import { useStore } from '../store';
import videojs from 'video.js';
import { Maximize2, Minimize2, Volume2, VolumeX, Pause, Play, Settings, AlertCircle, Loader2, RefreshCw } from 'lucide-react';

interface VideoPlayerProps {
  isMini: boolean;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ isMini }) => {
  const { activeChannelId, channels, isPlaying, volume, togglePlay, setView } = useStore();
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null); // Using any for VideoJS player instance to avoid tight type coupling in this setup
  const controlsTimeoutRef = useRef<number | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [showControls, setShowControls] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const channel = channels.find(c => c.id === activeChannelId);

  // --- Keyboard & User Interaction Logic ---
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
      controlsTimeoutRef.current = setTimeout(() => setShowControls(false), 3000);
  };

  const toggleFullscreen = () => {
      if (!document.fullscreenElement) {
          videoContainerRef.current?.requestFullscreen().catch(err => console.log(err));
      } else {
          document.exitFullscreen();
      }
  };

  // --- Video.js Initialization & Management ---
  useEffect(() => {
    if (!channel || !channel.streamUrl || !videoContainerRef.current) return;

    setIsLoading(true);
    setError(null);

    // If player exists, dispose it to create a fresh one for the new channel
    if (playerRef.current) {
        playerRef.current.dispose();
        playerRef.current = null;
    }

    // Create the video-js element dynamically
    const videoElement = document.createElement("video-js");
    videoElement.classList.add('vjs-default-skin', 'vjs-big-play-centered', 'vjs-fill');
    videoContainerRef.current.appendChild(videoElement);

    const options = {
        autoplay: isPlaying,
        controls: false, // We use our custom UI
        responsive: true,
        fluid: true,
        sources: [{
            src: channel.streamUrl,
            type: 'application/x-mpegURL'
        }],
        html5: {
            vhs: {
                overrideNative: true
            }
        }
    };

    const player = playerRef.current = videojs(videoElement, options, () => {
        setIsLoading(false);
        console.log('VideoJS Player Ready');
    });

    player.on('waiting', () => setIsLoading(true));
    player.on('playing', () => setIsLoading(false));
    player.on('canplay', () => setIsLoading(false));
    
    player.on('error', () => {
        setIsLoading(false);
        const err = player.error();
        console.error("VideoJS Error:", err);
        setError(err?.message || "Stream Connection Failed");
    });

    return () => {
        if (player && !player.isDisposed()) {
            player.dispose();
            playerRef.current = null;
        }
    };
  }, [channel?.id, channel?.streamUrl]);

  // --- Sync Global State with Player ---
  
  // Sync Play/Pause
  useEffect(() => {
    const player = playerRef.current;
    if (player && !player.isDisposed()) {
        if (isPlaying && player.paused()) {
            player.play()?.catch((e: any) => console.log("Play interrupted", e));
        } else if (!isPlaying && !player.paused()) {
            player.pause();
        }
    }
  }, [isPlaying]);

  // Sync Volume
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

  const handleRetry = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (channel?.streamUrl && playerRef.current) {
          setError(null);
          setIsLoading(true);
          playerRef.current.src({ src: channel.streamUrl, type: 'application/x-mpegURL' });
          playerRef.current.load();
          playerRef.current.play();
      }
  };

  const hasRealStream = !!channel.streamUrl;

  return (
    <div 
        onClick={handleMiniClick}
        onMouseMove={showControlsTemporarily}
        onDoubleClick={toggleFullscreen}
        className={`relative w-full h-full bg-black group overflow-hidden ${isMini ? 'cursor-pointer' : ''}`}
    >
      {/* Video Container for VideoJS */}
      <div className="absolute inset-0 bg-black flex items-center justify-center">
         {hasRealStream ? (
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

      {/* Overlays (Loading / Error) */}
      {hasRealStream && (
        <>
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-20 backdrop-blur-sm pointer-events-none">
                    <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
                </div>
            )}
            {error && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-stone-900/95 z-30 p-6 text-center">
                    <AlertCircle className="w-12 h-12 text-red-500 mb-2" />
                    <p className="text-white font-bold mb-1">Signal Lost</p>
                    <p className="text-stone-400 text-xs font-mono mb-4">{error}</p>
                    <button 
                        onClick={handleRetry}
                        className="flex items-center px-4 py-2 bg-stone-800 hover:bg-stone-700 text-white rounded-full text-sm font-bold transition-colors border border-stone-600"
                    >
                        <RefreshCw className="w-4 h-4 mr-2" /> Retry Connection
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
                        <span className="text-[10px] bg-red-600 text-white px-1.5 py-0.5 rounded font-bold uppercase">Live</span>}
                    </div>
                    <Maximize2 className="text-white w-4 h-4" />
                </div>
                <p className="text-white font-bold text-base truncate">{channel.name}</p>
            </div>
        </div>
      )}

      {/* Full Player Controls (Custom UI) */}
      {!isMini && (
        <div className={`absolute inset-0 flex flex-col justify-between p-6 md:p-10 z-40 transition-opacity duration-300 ${showControls || !isPlaying ? 'opacity-100' : 'opacity-0'}`}>
            {/* Top Bar */}
            <div className="flex justify-between items-start bg-gradient-to-b from-black/80 to-transparent p-4 -mx-4 -mt-4">
                <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-lg bg-stone-800 overflow-hidden flex items-center justify-center border border-stone-700">
                        {channel.logo.startsWith('http') ? <img src={channel.logo} className="w-full h-full object-cover" /> : <span className="text-white font-bold">{channel.logo}</span>}
                    </div>
                    <div>
                        <h2 className="text-white font-bold text-lg md:text-xl shadow-black drop-shadow-md">{channel.name}</h2>
                        <div className="flex items-center space-x-2">
                             <div className={`w-2 h-2 rounded-full ${error ? 'bg-red-900' : 'bg-red-600 animate-pulse'}`} />
                             <span className="text-red-500 text-xs font-bold uppercase tracking-widest shadow-black drop-shadow-sm">{error ? 'OFFLINE' : 'Live'}</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center space-x-4">
                    <button onClick={() => setView('home')} className="p-2 bg-black/40 hover:bg-black/60 text-white rounded-full backdrop-blur-md transition-all">
                        <Minimize2 className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Bottom Controls */}
            <div className="space-y-4 bg-gradient-to-t from-black/90 to-transparent p-4 -mx-4 -mb-4 pb-8">
                 <div className="w-full h-1.5 bg-stone-700/50 rounded-full overflow-hidden backdrop-blur-sm cursor-pointer hover:h-2 transition-all">
                        <div className="h-full bg-orange-600 w-full relative"></div>
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