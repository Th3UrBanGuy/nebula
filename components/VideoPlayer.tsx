
import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { useStore } from '../store';
import videojs from 'video.js';
import { 
  Maximize2, Minimize2, Volume2, VolumeX, Pause, Play, 
  Settings, AlertTriangle, Loader2, Signal, Activity, 
  SkipBack, SkipForward, Headphones, ChevronLeft, 
  Lock, Unlock, RotateCcw, FastForward, Sun, Smartphone,
  Monitor, MoveDiagonal, Music, Film, Sliders, Clock,
  Gauge, X, Cast, Minimize, Layers, RefreshCcw, LogOut
} from 'lucide-react';

interface VideoPlayerProps {
  isMini: boolean;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ isMini }) => {
  const { activeChannelId, channels, isPlaying, volume: storeVolume, togglePlay: toggleStorePlay, setView, setChannel } = useStore();
  
  // Refs
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const controlsTimeoutRef = useRef<number | null>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const touchStartRef = useRef<{ x: number, y: number, time: number } | null>(null);
  const touchLastMoveRef = useRef<{ x: number, y: number } | null>(null);
  const isDraggingRef = useRef(false);
  const lastTapTimeRef = useRef(0);

  // Core State
  const [localVolume, setLocalVolume] = useState(storeVolume);
  const [brightness, setBrightness] = useState(100); 
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isBuffering, setIsBuffering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showControls, setShowControls] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [aspectRatio, setAspectRatio] = useState<'contain' | 'cover' | 'fill'>('contain');
  const [mediaType, setMediaType] = useState<'video' | 'audio' | 'stream'>('video');
  const [gestureFeedback, setGestureFeedback] = useState<{ type: 'volume' | 'brightness' | 'seek', value: string | number, icon?: any } | null>(null);

  // Advanced Player State
  const [showSettings, setShowSettings] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false); // EXIT CONFIRMATION STATE
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [quality, setQuality] = useState('Auto');
  const [sleepTimer, setSleepTimer] = useState<number | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  // Scrubbing
  const [scrubInfo, setScrubInfo] = useState<{ time: number; x: number; isVisible: boolean }>({ time: 0, x: 0, isVisible: false });

  const channel = useMemo(() => channels.find(c => c.id === activeChannelId), [channels, activeChannelId]);

  // --- 1. ENGINE INITIALIZATION ---
  const detectFormat = useCallback((url: string) => {
    if (!url) return 'video';
    try {
        const cleanUrl = url.split(/[#?]/)[0].toLowerCase();
        const ext = cleanUrl.split('.').pop();
        
        // Explicit stream formats
        if (['m3u8', 'm3u', 'mpd'].includes(ext || '')) return 'stream';
        
        // Audio formats
        if (['mp3', 'wav', 'ogg', 'aac', 'm4a'].includes(ext || '')) return 'audio';
        
        // Default fallback to stream if unknown (safer for live TV URLs)
        if (!['mp4', 'webm', 'mov'].includes(ext || '')) return 'stream';
    } catch (e) {
        return 'stream';
    }

    return 'video';
  }, []);

  const initializePlayer = useCallback(() => {
    if (!channel || !videoContainerRef.current) return;

    // Dispose old player safely
    try {
        if (playerRef.current) {
            playerRef.current.dispose();
            playerRef.current = null;
        }
    } catch (e) {
        console.warn("Player disposal warning:", e);
    }

    const streamUrl = channel.streamUrl || '';
    // Safety check for empty URL
    if (!streamUrl) {
        setError("Invalid Signal Source");
        setIsBuffering(false);
        return;
    }

    const type = detectFormat(streamUrl);
    setMediaType(type);
    setError(null);
    setIsBuffering(true);

    // Create fresh video element
    const videoElement = document.createElement("video-js");
    videoElement.classList.add('vjs-nebula-engine');
    
    // Critical for custom UI on iOS and cross-origin streams
    videoElement.setAttribute('crossorigin', 'anonymous');
    videoElement.setAttribute('playsinline', 'true');
    videoElement.setAttribute('webkit-playsinline', 'true');
    
    // Clear container
    if (videoContainerRef.current) {
        videoContainerRef.current.innerHTML = '';
        videoContainerRef.current.appendChild(videoElement);
    }

    // Determine MIME type
    let mimeType = 'application/x-mpegURL'; // Default to HLS for streams
    if (type === 'audio') mimeType = `audio/${streamUrl.split('.').pop() || 'mp3'}`;
    if (type === 'video') mimeType = 'video/mp4';

    try {
        const player = playerRef.current = videojs(videoElement, {
            autoplay: isPlaying,
            controls: false, // Totally custom controls
            responsive: true,
            fluid: false, 
            fill: true,   
            techOrder: ['html5'], // Force HTML5 first for better compatibility
            html5: { 
                vhs: { 
                    overrideNative: !videojs.browser.IS_SAFARI, // Use VHS on non-Safari
                    enableLowInitialPlaylist: true,
                    smoothQualityChange: true
                },
                nativeAudioTracks: false,
                nativeVideoTracks: false
            },
            sources: [{ src: streamUrl, type: mimeType }]
        });

        player.on('waiting', () => setIsBuffering(true));
        player.on('canplay', () => setIsBuffering(false));
        player.on('playing', () => setIsBuffering(false));
        player.on('timeupdate', () => {
            if (!playerRef.current || playerRef.current.isDisposed()) return;
            setCurrentTime(playerRef.current.currentTime());
            setDuration(playerRef.current.duration() || 0);
        });
        player.on('error', () => {
            if (!playerRef.current || playerRef.current.isDisposed()) return;
            const err = player.error();
            console.error("Video Error:", err);
            setError("Signal Lost - Reconnecting...");
            setIsBuffering(false);
        });
    } catch (initError) {
        console.error("Player Init Failed:", initError);
        setError("Player Initialization Failed");
    }

  }, [channel, retryCount]); // Re-init on retry

  useEffect(() => {
      initializePlayer();
      return () => {
          try {
              if (playerRef.current && !playerRef.current.isDisposed()) {
                  playerRef.current.dispose();
                  playerRef.current = null;
              }
          } catch (e) {
              console.warn("Cleanup error:", e);
          }
      };
  }, [initializePlayer]);

  useEffect(() => {
    const player = playerRef.current;
    if (player && !player.isDisposed()) {
        if (isPlaying) {
             const playPromise = player.play();
             if (playPromise !== undefined) {
                 playPromise.catch((e: any) => console.log("Play interrupted (expected):", e));
             }
        } else {
            player.pause();
        }
    }
  }, [isPlaying]);

  const handleRetry = () => {
      setRetryCount(prev => prev + 1);
  };

  // --- 2. BACK / EXIT LOGIC ---

  const handleBackRequest = (e: React.MouseEvent) => {
      e.stopPropagation();
      setShowExitConfirm(true);
  };

  const confirmExit = () => {
      setShowExitConfirm(false);
      setChannel(''); // Stop playback
      setView('home');
  };

  const cancelExit = () => {
      setShowExitConfirm(false);
  };

  // --- 3. ADVANCED FEATURES ---

  const toggleFullscreen = useCallback(() => {
      if (!videoContainerRef.current) return;
      if (!document.fullscreenElement) {
          videoContainerRef.current.requestFullscreen().catch(e => console.error(e));
          setIsFullscreen(true);
      } else {
          document.exitFullscreen().catch(e => console.error(e));
          setIsFullscreen(false);
      }
  }, []);

  const togglePiP = useCallback(() => {
      const vid = videoContainerRef.current?.querySelector('video');
      if (vid && (document as any).pictureInPictureEnabled) {
          if ((document as any).pictureInPictureElement) (document as any).exitPictureInPicture();
          else vid.requestPictureInPicture().catch((e: any) => console.log("PiP failed:", e));
      }
  }, []);

  const handleSpeedChange = (speed: number) => {
      setPlaybackRate(speed);
      if (playerRef.current) playerRef.current.playbackRate(speed);
  };

  // Sleep Timer Logic
  useEffect(() => {
      if (!sleepTimer) return;
      const timer = setTimeout(() => {
          if (isPlaying) toggleStorePlay();
          setSleepTimer(null);
      }, sleepTimer * 60 * 1000);
      return () => clearTimeout(timer);
  }, [sleepTimer, isPlaying]);

  // --- 4. GESTURE & INTERACTION ---

  const handleTouchStart = (e: React.TouchEvent) => {
    if (isLocked || showSettings || showExitConfirm) return;
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY, time: Date.now() };
    touchLastMoveRef.current = { x: touch.clientX, y: touch.clientY };
    isDraggingRef.current = false;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isLocked || showSettings || showExitConfirm || !touchStartRef.current || !touchLastMoveRef.current) return;
    
    const touch = e.touches[0];
    const deltaY = touchLastMoveRef.current.y - touch.clientY;
    const deltaX = touch.clientX - touchLastMoveRef.current.x;

    if (Math.abs(deltaY) > 5 || Math.abs(deltaX) > 5) {
        isDraggingRef.current = true;
    }

    if (isDraggingRef.current) {
        const screenWidth = window.innerWidth;
        const sensitivity = 0.5;

        if (touchStartRef.current.x > screenWidth / 2) {
            // Volume (Right)
            let newVol = localVolume + (deltaY * sensitivity);
            newVol = Math.max(0, Math.min(100, newVol));
            setLocalVolume(newVol);
            if (playerRef.current) playerRef.current.volume(newVol / 100);
            setGestureFeedback({ type: 'volume', value: Math.round(newVol), icon: newVol === 0 ? VolumeX : Volume2 });
        } else {
            // Brightness (Left)
            let newBright = brightness + (deltaY * sensitivity);
            newBright = Math.max(10, Math.min(100, newBright)); 
            setBrightness(newBright);
            setGestureFeedback({ type: 'brightness', value: Math.round(newBright), icon: Sun });
        }
    }

    touchLastMoveRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (isLocked || showSettings || showExitConfirm) return;
    setGestureFeedback(null); 

    if (!isDraggingRef.current && touchStartRef.current) {
        const now = Date.now();
        const timeDiff = now - lastTapTimeRef.current;
        const touchX = touchStartRef.current.x;
        const screenWidth = window.innerWidth;

        if (timeDiff < 300) {
             // Double Tap
             if (touchX < screenWidth * 0.3) {
                 handleSeek(-10);
                 setGestureFeedback({ type: 'seek', value: '-10s', icon: RotateCcw });
             } else if (touchX > screenWidth * 0.7) {
                 handleSeek(10);
                 setGestureFeedback({ type: 'seek', value: '+10s', icon: FastForward });
             } else {
                 toggleStorePlay();
             }
             setTimeout(() => setGestureFeedback(null), 600);
        } else {
             // Single Tap
             if (!isMini) toggleControls();
             else setView('player');
        }
        lastTapTimeRef.current = now;
    }
    touchStartRef.current = null;
    isDraggingRef.current = false;
  };

  const handleSeek = (seconds: number) => {
      if (playerRef.current) {
          const newTime = playerRef.current.currentTime() + seconds;
          playerRef.current.currentTime(newTime);
      }
  };

  const toggleControls = () => {
      setShowControls(prev => {
          if (!prev) {
              if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
              controlsTimeoutRef.current = window.setTimeout(() => setShowControls(false), 4000);
          }
          return !prev;
      });
  };

  // --- 5. RENDER ---

  if (!channel) return null;

  return (
    <div 
      className={`relative w-full h-full bg-black overflow-hidden select-none touch-none ${isMini ? 'cursor-pointer' : ''}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseMove={() => !isMini && !showControls && toggleControls()} 
      onClick={() => isMini && setView('player')}
      ref={videoContainerRef}
    >
      
      {/* Simulated Brightness Overlay */}
      <div 
        className="absolute inset-0 z-50 pointer-events-none bg-black transition-opacity duration-75"
        style={{ opacity: 1 - (brightness / 100) }}
      />

      {/* --- RENDER ENGINE: CENTERED MIDDLE --- */}
      <div className={`absolute inset-0 w-full h-full flex flex-col items-center justify-center bg-black transition-all duration-500`}>
          {mediaType === 'audio' ? (
              <div className="flex flex-col items-center justify-center w-full h-full bg-gradient-to-b from-stone-900 to-black z-0">
                  {/* Visualizer */}
                  <div className={`w-48 h-48 md:w-64 md:h-64 rounded-full border-4 border-stone-800 shadow-[0_0_50px_rgba(234,88,12,0.2)] overflow-hidden ${isPlaying ? 'animate-[spin_10s_linear_infinite]' : ''}`}>
                      {channel.logo.startsWith('http') ? (
                          <img src={channel.logo} className="w-full h-full object-cover" />
                      ) : (
                          <div className="w-full h-full bg-stone-800 flex items-center justify-center">
                              <Music className="w-20 h-20 text-stone-600" />
                          </div>
                      )}
                  </div>
                  <div className="mt-8 flex items-center space-x-1 h-8 items-end">
                       {[...Array(5)].map((_, i) => (
                           <div key={i} className={`w-1 bg-orange-500 rounded-t-full transition-all duration-300 ${isPlaying ? 'animate-pulse' : 'h-2'}`} style={{ height: isPlaying ? `${Math.random() * 32}px` : '4px', animationDelay: `${i * 0.1}s` }} />
                       ))}
                  </div>
              </div>
          ) : (
              /* Video Container - Centered */
              <div 
                data-vjs-player 
                className={`transition-all duration-300 pointer-events-none
                    ${aspectRatio === 'cover' ? 'w-full h-full object-cover' : 
                      aspectRatio === 'fill' ? 'w-full h-full' : 
                      'w-full h-auto max-h-full aspect-video'} 
                `}
              >
                  {/* The actual video element is injected here by useEffect */}
              </div>
          )}
      </div>

      {/* Gesture Feedback Bubble */}
      {gestureFeedback && (
          <div className="absolute inset-0 z-40 flex items-center justify-center pointer-events-none">
              <div className="bg-stone-900/80 backdrop-blur-md p-6 rounded-3xl flex flex-col items-center animate-fade-in-up border border-stone-700">
                  {gestureFeedback.icon && <gestureFeedback.icon className="w-10 h-10 text-orange-500 mb-2" />}
                  <span className="text-2xl font-black text-white">{gestureFeedback.value}{gestureFeedback.type === 'seek' ? '' : '%'}</span>
              </div>
          </div>
      )}

      {/* Loading / Error States */}
      {((isBuffering && !error) || error) && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/40 backdrop-blur-sm pointer-events-auto">
              {error ? (
                  <div className="flex flex-col items-center text-red-500 bg-stone-900/90 p-6 rounded-2xl border border-red-500/20 max-w-xs text-center">
                      <AlertTriangle className="w-10 h-10 mb-2" />
                      <span className="font-bold uppercase tracking-widest text-xs mb-4">{error}</span>
                      <button 
                        onClick={handleRetry}
                        className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-white rounded-lg font-bold text-sm flex items-center"
                      >
                          <RefreshCcw className="w-4 h-4 mr-2" /> Retry Signal
                      </button>
                  </div>
              ) : (
                  <Loader2 className="w-12 h-12 text-orange-500 animate-spin" />
              )}
          </div>
      )}

      {/* --- EXIT CONFIRMATION MODAL --- */}
      {showExitConfirm && (
          <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-md animate-fade-in p-6">
              <div className="bg-stone-900 border border-stone-700 rounded-3xl p-8 max-w-sm w-full shadow-2xl transform transition-all scale-100">
                  <h3 className="text-xl font-black text-white mb-2 flex items-center">
                      <LogOut className="w-6 h-6 mr-2 text-orange-500" /> Stop Playback?
                  </h3>
                  <p className="text-stone-400 text-sm mb-8">
                      This will close the current stream and return you to the dashboard.
                  </p>
                  <div className="flex space-x-4">
                      <button 
                          onClick={cancelExit}
                          className="flex-1 py-3 bg-stone-800 text-white font-bold rounded-xl hover:bg-stone-700 active:scale-95 transition-all"
                      >
                          Resume
                      </button>
                      <button 
                          onClick={confirmExit}
                          className="flex-1 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-500 active:scale-95 transition-all shadow-lg shadow-red-900/20"
                      >
                          Exit
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* --- CONTROLS OVERLAY --- */}
      {!isMini && !showSettings && !showExitConfirm && (
          <div className={`absolute inset-0 z-40 flex flex-col justify-between transition-opacity duration-300 ${showControls || !isPlaying || isLocked ? 'opacity-100' : 'opacity-0'}`}>
              
              {/* TOP BAR */}
              <div className={`p-4 md:p-8 flex justify-between items-start bg-gradient-to-b from-black/90 to-transparent transition-transform duration-300 ${isLocked ? '-translate-y-full' : 'translate-y-0'}`}>
                  <div className="flex items-center space-x-4 pointer-events-auto">
                      
                      {/* BACK BUTTON */}
                      <button 
                          onClick={handleBackRequest} 
                          className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white/20 active:scale-95 transition-all border border-white/5"
                      >
                          <ChevronLeft className="w-6 h-6 text-white" />
                      </button>

                      <div className="max-w-[150px] md:max-w-md">
                          <h2 className="text-white font-black text-lg leading-none shadow-black drop-shadow-md truncate">{channel.name}</h2>
                          <div className="flex items-center space-x-2 mt-1">
                              {mediaType === 'stream' && <span className="bg-red-600 px-1.5 py-0.5 rounded text-[9px] font-bold text-white flex items-center"><Activity className="w-3 h-3 mr-1" /> LIVE</span>}
                              <span className="text-[10px] text-stone-400 font-medium uppercase tracking-wider">{channel.provider}</span>
                          </div>
                      </div>
                  </div>

                  <div className="flex items-center space-x-3 pointer-events-auto">
                      <button onClick={togglePiP} className="p-2 text-stone-300 hover:text-white bg-black/30 rounded-full backdrop-blur-sm hidden md:block">
                          <Minimize className="w-5 h-5" />
                      </button>
                      <button onClick={() => setShowSettings(true)} className="p-2 text-white bg-black/30 rounded-full backdrop-blur-sm hover:bg-orange-500 hover:text-white transition-colors">
                          <Settings className="w-5 h-5" />
                      </button>
                  </div>
              </div>

              {/* CENTER PLAY/PAUSE/LOCK */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                   {!isLocked && (
                       <div className={`flex items-center space-x-8 md:space-x-16 transition-all duration-300 ${showControls || !isPlaying ? 'scale-100 opacity-100' : 'scale-75 opacity-0'}`}>
                           <button onClick={(e) => { e.stopPropagation(); handleSeek(-10); }} className="pointer-events-auto p-4 bg-black/40 backdrop-blur-md rounded-full text-white/80 hover:bg-orange-500 hover:text-white transition-all active:scale-90 hidden md:flex">
                               <RotateCcw className="w-6 h-6" />
                           </button>
                           
                           <button 
                              onClick={(e) => { e.stopPropagation(); toggleStorePlay(); }} 
                              className="pointer-events-auto w-16 h-16 md:w-24 md:h-24 bg-white/90 hover:bg-white text-black rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(255,255,255,0.3)] transition-all active:scale-90"
                           >
                               {isPlaying ? <Pause className="w-6 h-6 md:w-10 md:h-10 fill-current" /> : <Play className="w-6 h-6 md:w-10 md:h-10 fill-current ml-1" />}
                           </button>

                           <button onClick={(e) => { e.stopPropagation(); handleSeek(10); }} className="pointer-events-auto p-4 bg-black/40 backdrop-blur-md rounded-full text-white/80 hover:bg-orange-500 hover:text-white transition-all active:scale-90 hidden md:flex">
                               <FastForward className="w-6 h-6" />
                           </button>
                       </div>
                   )}

                   {isLocked && (
                       <div className="flex flex-col items-center animate-pulse pointer-events-none bg-black/50 p-6 rounded-3xl backdrop-blur-sm">
                           <Lock className="w-10 h-10 text-orange-500 mb-2" />
                           <span className="text-orange-500 text-xs font-black uppercase tracking-widest">Controls Locked</span>
                       </div>
                   )}
              </div>

              {/* BOTTOM DOCK */}
              <div className={`p-4 md:p-10 bg-gradient-to-t from-black via-black/80 to-transparent pb-safe transition-transform duration-300 ${isLocked ? 'translate-y-full' : 'translate-y-0'}`}>
                  
                  {/* Timeline (Hidden for live streams usually, but enabled for manual streams) */}
                  {mediaType !== 'stream' && (
                      <div className="flex items-center space-x-4 mb-6 pointer-events-auto relative select-none">
                          <span className="text-[10px] font-mono text-stone-400 w-10 text-right">{new Date(currentTime * 1000).toISOString().substr(14, 5)}</span>
                          <div 
                              className="flex-1 relative h-8 flex items-center group cursor-pointer"
                              ref={progressBarRef}
                              onMouseMove={(e) => {
                                  if (!progressBarRef.current || !duration) return;
                                  const rect = progressBarRef.current.getBoundingClientRect();
                                  const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                                  setScrubInfo({ time: percent * duration, x: e.clientX - rect.left, isVisible: true });
                              }}
                              onMouseLeave={() => setScrubInfo({ ...scrubInfo, isVisible: false })}
                          >
                              {/* Scrub Preview Bubble */}
                              {scrubInfo.isVisible && (
                                  <div className="absolute bottom-full mb-2 bg-stone-800 border border-stone-700 p-1.5 rounded-lg transform -translate-x-1/2 z-50 pointer-events-none" style={{ left: scrubInfo.x }}>
                                      <div className="w-24 h-14 bg-black rounded overflow-hidden relative mb-1">
                                           <div className="absolute inset-0 flex items-center justify-center text-stone-600"><Film className="w-4 h-4" /></div>
                                      </div>
                                      <div className="text-[10px] text-center font-mono text-white">{new Date(scrubInfo.time * 1000).toISOString().substr(14, 5)}</div>
                                  </div>
                              )}

                              {/* Progress Track */}
                              <div className="absolute inset-x-0 h-1.5 bg-stone-700/50 rounded-full overflow-hidden">
                                  <div className="h-full bg-orange-600 rounded-full" style={{ width: `${(currentTime / duration) * 100}%` }} />
                              </div>
                              
                              {/* Input Slider */}
                              <input 
                                  type="range" 
                                  min={0} max={duration || 100} 
                                  value={currentTime} 
                                  onChange={(e) => {
                                      const val = Number(e.target.value);
                                      setCurrentTime(val);
                                      if (playerRef.current) playerRef.current.currentTime(val);
                                  }}
                                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                              />
                              
                              {/* Thumb */}
                              <div className="absolute h-4 w-4 bg-white rounded-full shadow-lg pointer-events-none transition-transform group-hover:scale-125" style={{ left: `${(currentTime / duration) * 100}%`, marginLeft: '-8px' }} />
                          </div>
                          <span className="text-[10px] font-mono text-stone-400 w-10">{new Date(duration * 1000).toISOString().substr(14, 5)}</span>
                      </div>
                  )}

                  {/* Actions Row */}
                  <div className="flex items-center justify-between pointer-events-auto">
                      <div className="flex items-center space-x-4">
                           <button onClick={() => setIsLocked(!isLocked)} className={`p-3 rounded-xl transition-all ${isLocked ? 'bg-orange-600 text-white' : 'bg-white/10 text-stone-400 hover:text-white'}`}>
                               {isLocked ? <Lock className="w-5 h-5" /> : <Unlock className="w-5 h-5" />}
                           </button>

                           <div className="hidden md:flex items-center space-x-3 bg-black/40 px-4 py-2 rounded-xl">
                               <Volume2 className="w-4 h-4 text-stone-400" />
                               <div className="w-24 h-1 bg-stone-700 rounded-full overflow-hidden relative">
                                   <div className="h-full bg-stone-300" style={{ width: `${localVolume}%` }} />
                                   <input type="range" min="0" max="100" value={localVolume} onChange={(e) => {
                                       const v = Number(e.target.value);
                                       setLocalVolume(v);
                                       if(playerRef.current) playerRef.current.volume(v/100);
                                   }} className="absolute inset-0 opacity-0 cursor-pointer" />
                               </div>
                           </div>
                      </div>

                      <div className="flex items-center space-x-3">
                           <button onClick={toggleFullscreen} className="p-3 bg-white/10 rounded-xl text-stone-300 hover:text-white hover:bg-white/20">
                               {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                           </button>
                      </div>
                  </div>
              </div>

              {/* Locked Unlock Button */}
              {isLocked && (
                  <div className="absolute bottom-12 left-1/2 -translate-x-1/2 pointer-events-auto animate-bounce z-50">
                      <button 
                          onClick={(e) => { e.stopPropagation(); setIsLocked(false); }}
                          className="flex items-center space-x-2 px-6 py-3 bg-stone-900/90 backdrop-blur-md border border-stone-700 rounded-full text-white font-bold shadow-2xl"
                      >
                          <Unlock className="w-4 h-4" />
                          <span>TAP TO UNLOCK</span>
                      </button>
                  </div>
              )}
          </div>
      )}

      {/* --- SETTINGS DRAWER (Bottom Sheet Style) --- */}
      {showSettings && (
          <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex flex-col justify-end animate-fade-in" onClick={() => setShowSettings(false)}>
              <div 
                  className="bg-stone-900 border-t border-stone-800 rounded-t-3xl p-6 md:p-8 w-full max-h-[80%] overflow-y-auto animate-slide-up"
                  onClick={(e) => e.stopPropagation()} 
              >
                  <div className="flex justify-between items-center mb-8">
                      <h3 className="text-xl font-black text-white flex items-center">
                          <Sliders className="w-6 h-6 mr-3 text-orange-500" />
                          Player Settings
                      </h3>
                      <button onClick={() => setShowSettings(false)} className="p-2 bg-stone-800 rounded-full text-stone-400 hover:text-white">
                          <X className="w-5 h-5" />
                      </button>
                  </div>

                  <div className="space-y-8">
                      {/* Playback Speed */}
                      <div>
                          <label className="text-xs font-bold text-stone-500 uppercase tracking-widest mb-3 flex items-center">
                              <Gauge className="w-4 h-4 mr-2" /> Playback Speed
                          </label>
                          <div className="flex justify-between bg-black/40 p-1.5 rounded-xl">
                              {[0.5, 1.0, 1.25, 1.5, 2.0].map(rate => (
                                  <button
                                      key={rate}
                                      onClick={() => handleSpeedChange(rate)}
                                      className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${playbackRate === rate ? 'bg-orange-600 text-white shadow-lg' : 'text-stone-400 hover:text-white'}`}
                                  >
                                      {rate}x
                                  </button>
                              ))}
                          </div>
                      </div>

                      {/* Screen Fit (Aspect Ratio) */}
                      <div>
                          <label className="text-xs font-bold text-stone-500 uppercase tracking-widest mb-3 flex items-center">
                              <Layers className="w-4 h-4 mr-2" /> Screen Fit
                          </label>
                          <div className="flex justify-between bg-black/40 p-1.5 rounded-xl">
                              {[
                                  { id: 'contain', label: 'Fit', icon: Minimize },
                                  { id: 'cover', label: 'Zoom', icon: Maximize2 },
                                  { id: 'fill', label: 'Stretch', icon: MoveDiagonal }
                              ].map((opt) => (
                                  <button
                                      key={opt.id}
                                      onClick={() => setAspectRatio(opt.id as any)}
                                      className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center justify-center ${aspectRatio === opt.id ? 'bg-stone-700 text-white shadow-lg' : 'text-stone-400 hover:text-white'}`}
                                  >
                                      <opt.icon className="w-4 h-4 mr-2" /> {opt.label}
                                  </button>
                              ))}
                          </div>
                      </div>

                      {/* Sleep Timer */}
                      <div>
                          <label className="text-xs font-bold text-stone-500 uppercase tracking-widest mb-3 flex items-center">
                              <Clock className="w-4 h-4 mr-2" /> Sleep Timer
                          </label>
                          <div className="grid grid-cols-4 gap-2">
                              {[null, 15, 30, 60].map((min) => (
                                  <button
                                      key={min || 'off'}
                                      onClick={() => setSleepTimer(min)}
                                      className={`py-3 rounded-xl text-sm font-bold border transition-all ${sleepTimer === min ? 'bg-orange-900/20 border-orange-500 text-orange-500' : 'bg-stone-800 border-transparent text-stone-400'}`}
                                  >
                                      {min ? `${min}m` : 'Off'}
                                  </button>
                              ))}
                          </div>
                      </div>
                      
                      {/* Quality (Mock) */}
                      <div>
                          <label className="text-xs font-bold text-stone-500 uppercase tracking-widest mb-3 flex items-center">
                              <Signal className="w-4 h-4 mr-2" /> Stream Quality
                          </label>
                          <div className="w-full bg-stone-800 rounded-xl p-4 flex items-center justify-between">
                               <span className="text-stone-300 font-bold">{quality}</span>
                               <span className="text-xs text-stone-500 bg-black px-2 py-1 rounded">Auto-Optimized</span>
                          </div>
                      </div>

                  </div>
              </div>
          </div>
      )}

      {isMini && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity z-50">
               <Maximize2 className="w-8 h-8 text-white drop-shadow-lg" />
          </div>
      )}
    </div>
  );
};
