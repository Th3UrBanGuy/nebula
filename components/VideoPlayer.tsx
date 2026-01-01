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
  const containerRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const controlsTimeoutRef = useRef<number | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const channel = channels.find(c => c.id === activeChannelId);

  // --- Keyboard & User Interaction Logic ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (isMini) return; // Ignore if in mini mode
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
                if (videoRef.current) videoRef.current.muted = !videoRef.current.muted;
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
          containerRef.current?.requestFullscreen().catch(err => console.log(err));
          setIsFullscreen(true);
      } else {
          document.exitFullscreen();
          setIsFullscreen(false);
      }
  };

  // --- HLS & Playback Logic ---
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
            switch (data.type) {
                case Hls.ErrorTypes.NETWORK_ERROR:
                    hlsRef.current?.startLoad();
                    break;
                case Hls.ErrorTypes.MEDIA_ERROR:
                    hlsRef.current?.recoverMediaError();
                    break;
                default:
                    setError("Stream Unavailable");
                    hlsRef.current?.destroy();
                    break;
            }
        }
    };

    // Cleanup previous instance
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
        // Native HLS (Safari)
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
        if (hlsRef.current) hlsRef.current.destroy();
        if (video) video.removeEventListener('loadedmetadata', handleManifestParsed);
    };
  }, [channel?.id, channel?.streamUrl]);

  // Sync Global State
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (isPlaying && video.paused && !error) video.play().catch(() => {});
    else if (!isPlaying && !video.paused) video.pause();
  }, [isPlaying, error]);

  useEffect(() => {
    if (videoRef.current) videoRef.current.volume = volume / 100;
  }, [volume]);

  if (!channel) return null;

  const handleMiniClick = () => {
      if (isMini) setView('player');
  };

  const hasRealStream = !!channel.streamUrl;

  return (
    <div 
        ref={containerRef}
        onClick={handleMiniClick}
        onMouseMove={showControlsTemporarily}
        onDoubleClick={toggleFullscreen}
        className={`relative w-full h-full bg-black group overflow-hidden ${isMini ? 'cursor-pointer' : ''}`}
    >
      <div className="absolute inset-0 flex items-center justify-center overflow-hidden bg-black">
        {hasRealStream ? (
            <>
                <video 
                    ref={videoRef}
                    className="w-full h-full object-contain"
                    poster={channel.logo.startsWith('http') ? channel.logo : undefined}
                    playsInline
                    crossOrigin="anonymous"
                />
                
                {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10 backdrop-blur-sm">
                        <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
                    </div>
                )}

                {error && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-stone-900/90 z-20">
                        <AlertCircle className="w-12 h-12 text-red-500 mb-2" />
                        <p className="text-white font-bold">{error}</p>
                    </div>
                )}
            </>
        ) : (
            <div className="relative w-full h-full flex items-center justify-center">
                 <img 
                    src={channel.logo.startsWith('http') ? channel.logo : `https://picsum.photos/seed/${channel.id}/1920/1080`} 
                    alt="Broadcast" 
                    className="w-full h-full object-cover blur-3xl opacity-30 absolute"
                />
                 <img 
                        src={`https://picsum.photos/seed/${channel.id}/1920/1080`} 
                        alt="Broadcast" 
                        className={`w-full h-full object-contain transition-transform duration-[20s] ease-linear ${isPlaying ? 'scale-110' : 'scale-100'}`}
                    />
            </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none opacity-50" />
      </div>

      {/* Mini Player Overlay */}
      {isMini && (
        <div className="absolute inset-0 z-30 flex items-end p-5 bg-gradient-to-t from-black via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
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

      {/* Full Player Controls */}
      {!isMini && (
        <div className={`absolute inset-0 flex flex-col justify-between p-6 md:p-10 z-30 transition-opacity duration-300 ${showControls || !isPlaying ? 'opacity-100' : 'opacity-0'}`}>
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