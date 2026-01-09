
import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { useStore } from '../store';
import videojs from 'video.js';
import { 
  Maximize2, Minimize2, Volume2, VolumeX, Pause, Play, 
  Settings, AlertTriangle, Loader2, RefreshCw, Radio, 
  Signal, Activity, SkipBack, SkipForward, Headphones, Tv,
  ChevronLeft, Lock, Unlock, RotateCcw, FastForward
} from 'lucide-react';

interface VideoPlayerProps {
  isMini: boolean;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ isMini }) => {
  const { activeChannelId, channels, isPlaying, volume, togglePlay, setView } = useStore();
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null); 
  const controlsTimeoutRef = useRef<number | null>(null);
  const touchStartPos = useRef<{ x: number, y: number } | null>(null);
  const lastTapTime = useRef<number>(0);

  const [error, setError] = useState<string | null>(null);
  const [showControls, setShowControls] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [buffering, setBuffering] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [mediaType, setMediaType] = useState<'video' | 'audio' | 'stream'>('video');
  const [seekFeedback, setSeekFeedback] = useState<{ direction: 'left' | 'right', active: boolean }>({ direction: 'left', active: false });

  const channel = useMemo(() => channels.find(c => c.id === activeChannelId), [channels, activeChannelId]);

  const detectFormat = useCallback((url: string) => {
    if (!url) return 'video';
    const ext = url.split(/[#?]/)[0].split('.').pop()?.toLowerCase();
    if (ext === 'm3u8') return 'stream';
    if (['mp3', 'wav', 'ogg', 'aac'].includes(ext || '')) return 'audio';
    return 'video';
  }, []);

  useEffect(() => {
    if (channel?.streamUrl) {
      setMediaType(detectFormat(channel.streamUrl));
    }
  }, [channel, detectFormat]);

  const showControlsTemporarily = () => {
    if (isLocked && !isMini) return;
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = window.setTimeout(() => setShowControls(false), 3500);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartPos.current = { x: touch.clientX, y: touch.clientY };
    
    // Double Tap Detection for Seeking
    const now = Date.now();
    const delay = now - lastTapTime.current;
    if (delay < 300 && !isMini && !isLocked) {
      const width = window.innerWidth;
      const x = touch.clientX;
      if (x < width * 0.3) {
        handleSeek(-10);
        setSeekFeedback({ direction: 'left', active: true });
      } else if (x > width * 0.7) {
        handleSeek(10);
        setSeekFeedback({ direction: 'right', active: true });
      }
      setTimeout(() => setSeekFeedback({ direction: 'left', active: false }), 500);
    }
    lastTapTime.current = now;
  };

  const handleSeek = (seconds: number) => {
    const player = playerRef.current;
    if (player && !player.isDisposed()) {
        const currentTime = player.currentTime();
        player.currentTime(currentTime + seconds);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      videoContainerRef.current?.parentElement?.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen();
    }
  };

  useEffect(() => {
    if (!channel || !channel.streamUrl || !videoContainerRef.current) return;

    setIsLoading(true);
    setError(null);

    if (playerRef.current) {
      playerRef.current.dispose();
      playerRef.current = null;
    }

    const videoElement = document.createElement("video-js");
    videoElement.classList.add('vjs-nebula-theme', 'vjs-fill');
    videoElement.setAttribute('crossorigin', 'anonymous');
    videoElement.setAttribute('playsinline', 'true');
    videoContainerRef.current.appendChild(videoElement);

    const type = detectFormat(channel.streamUrl);
    const mimeType = type === 'stream' ? 'application/x-mpegURL' : (type === 'audio' ? `audio/${channel.streamUrl.split('.').pop()}` : 'video/mp4');

    const options = {
      autoplay: isPlaying,
      controls: false,
      responsive: true,
      fluid: true,
      preload: 'auto',
      sources: [{ src: channel.streamUrl, type: mimeType }],
      html5: { vhs: { overrideNative: !videojs.browser.IS_SAFARI } }
    };

    const player = playerRef.current = videojs(videoElement, options);

    player.on('waiting', () => setBuffering(true));
    player.on('playing', () => { setBuffering(false); setIsLoading(false); });
    player.on('error', () => {
      setError("Signal link severed.");
      setIsLoading(false);
    });

    return () => {
      if (player && !player.isDisposed()) player.dispose();
    };
  }, [channel?.id]);

  useEffect(() => {
    const player = playerRef.current;
    if (player && !player.isDisposed()) {
      if (isPlaying) player.play()?.catch(() => {});
      else player.pause();
    }
  }, [isPlaying]);

  if (!channel) return null;

  return (
    <div 
      onMouseMove={showControlsTemporarily}
      onTouchStart={handleTouchStart}
      className={`relative w-full h-full bg-stone-950 overflow-hidden group select-none ${isMini ? 'cursor-pointer' : ''}`}
      onClick={() => {
          if (isMini) { setView('player'); }
          else { showControlsTemporarily(); }
      }}
    >
      {/* MEDIA CONTENT */}
      <div className={`relative z-10 w-full h-full flex items-center justify-center ${mediaType === 'audio' ? 'bg-stone-900' : ''}`}>
          {mediaType === 'audio' ? (
              <div className="flex flex-col items-center p-8 text-center animate-fade-in">
                  <div className="w-48 h-48 md:w-64 md:h-64 rounded-[3rem] bg-gradient-to-br from-stone-800 to-stone-900 border border-stone-700 shadow-2xl flex items-center justify-center mb-8">
                      {channel.logo.startsWith('http') ? <img src={channel.logo} className="w-1/2 h-1/2 object-contain" /> : <Headphones className="w-16 h-16 text-stone-700" />}
                  </div>
                  <h3 className="text-2xl md:text-4xl font-black text-white">{channel.name}</h3>
              </div>
          ) : (
              <div data-vjs-player className="w-full h-full">
                  <div ref={videoContainerRef} className="w-full h-full" />
              </div>
          )}
      </div>

      {/* MOBILE GESTURE FEEDBACK */}
      {seekFeedback.active && (
          <div className={`absolute inset-0 z-30 flex items-center ${seekFeedback.direction === 'left' ? 'justify-start pl-12' : 'justify-end pr-12'} pointer-events-none`}>
              <div className="flex flex-col items-center bg-black/40 backdrop-blur-md p-6 rounded-full animate-bounce">
                  {seekFeedback.direction === 'left' ? <RotateCcw className="w-8 h-8 text-white" /> : <FastForward className="w-8 h-8 text-white" />}
                  <span className="text-white text-xs font-black mt-2">10s</span>
              </div>
          </div>
      )}

      {/* MOBILE FULL PLAYER UI */}
      {!isMini && (
          <div className={`absolute inset-0 z-40 flex flex-col justify-between transition-opacity duration-300 ${showControls || !isPlaying ? 'opacity-100' : 'opacity-0'}`}>
              
              {/* Top Mobile Bar */}
              <div className="px-6 py-8 md:p-12 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent">
                  <div className="flex items-center space-x-4">
                      <button onClick={() => setView('home')} className="p-3 bg-white/10 rounded-full border border-white/10 active:scale-90 transition-transform">
                          <ChevronLeft className="w-6 h-6 text-white" />
                      </button>
                      <div className="flex flex-col">
                          <h2 className="text-lg font-black text-white leading-none">{channel.name}</h2>
                          <span className="text-[10px] text-orange-500 font-bold uppercase tracking-widest">{channel.category}</span>
                      </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button 
                        onClick={(e) => { e.stopPropagation(); setIsLocked(!isLocked); }}
                        className={`p-3 rounded-full border border-white/10 active:scale-90 transition-transform ${isLocked ? 'bg-orange-600' : 'bg-white/10'}`}
                    >
                        {isLocked ? <Lock className="w-5 h-5 text-white" /> : <Unlock className="w-5 h-5 text-white" />}
                    </button>
                  </div>
              </div>

              {/* Centered Controls for Mobile */}
              {!isLocked && (
                <div className="flex items-center justify-center space-x-8 md:space-x-16">
                    <button onClick={() => handleSeek(-10)} className="p-4 text-white/50 hover:text-white transition-colors active:scale-90">
                        <RotateCcw className="w-8 h-8 md:w-12 md:h-12" />
                    </button>
                    <button 
                        onClick={(e) => { e.stopPropagation(); togglePlay(); }}
                        className="w-20 h-20 md:w-32 md:h-32 bg-white text-black rounded-full flex items-center justify-center shadow-2xl active:scale-90 transition-all"
                    >
                        {isPlaying ? <Pause className="w-10 h-10 md:w-16 md:h-16 fill-current" /> : <Play className="w-10 h-10 md:w-16 md:h-16 fill-current ml-2" />}
                    </button>
                    <button onClick={() => handleSeek(10)} className="p-4 text-white/50 hover:text-white transition-colors active:scale-90">
                        <FastForward className="w-8 h-8 md:w-12 md:h-12" />
                    </button>
                </div>
              )}

              {/* Bottom Mobile Control Bar */}
              <div className="px-6 py-12 md:p-12 flex flex-col space-y-6 bg-gradient-to-t from-black/90 to-transparent pb-safe">
                  
                  {/* Seek Bar - Large Touch Target */}
                  <div className="w-full group/seek h-8 flex items-center cursor-pointer">
                      <div className="relative flex-1 h-1.5 bg-white/20 rounded-full overflow-hidden">
                          <div className="absolute inset-y-0 left-0 bg-orange-600 w-[45%]" />
                      </div>
                  </div>

                  <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-6">
                           <Volume2 className="w-6 h-6 text-white" />
                           <div className="flex flex-col">
                               <span className="text-[10px] font-black text-stone-500 uppercase">Signal</span>
                               <span className="text-xs font-bold text-white uppercase tracking-widest">{channel.provider}</span>
                           </div>
                      </div>
                      <div className="flex items-center space-x-4">
                          <button className="p-3 text-white/70 active:scale-90 transition-transform"><Settings className="w-6 h-6" /></button>
                          <button onClick={toggleFullscreen} className="p-3 text-white/70 active:scale-90 transition-transform"><Maximize2 className="w-6 h-6" /></button>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* Mini Player Overlay */}
      {isMini && (
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
            <Maximize2 className="w-6 h-6 text-white" />
        </div>
      )}
    </div>
  );
};
