import React, { useState, useEffect, useRef } from 'react';
import {
  ChevronDown,
  Heart,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Volume2,
  VolumeX,
  Sparkles,
  Download,
  Share2,
  Check,
  Film
} from 'lucide-react';
import { Track } from '../types';
import { apiGetLyrics, apiInitiateDownload, apiGetShareLink } from '../services/backendApi';
import { settingsService, EvaSettings } from '../services/settingsService';
import { appleCanvasService, AppleCanvasArtwork } from '../services/appleCanvasService';

interface FullPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTrack: Track | null;
  queue: Track[];
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isShuffle: boolean;
  repeatMode: 'off' | 'all' | 'one';
  onTogglePlay: () => void;
  onNextTrack: () => void;
  onPrevTrack: () => void;
  onSeek: (seconds: number) => void;
  onVolumeChange: (vol: number) => void;
  onToggleMute: () => void;
  onToggleShuffle: () => void;
  onToggleRepeat: () => void;
  onToggleLike: (trackId: string) => void;
  onSelectQueueTrack: (track: Track) => void;
}

export const FullPlayerModal: React.FC<FullPlayerModalProps> = ({
  isOpen,
  onClose,
  currentTrack,
  queue,
  isPlaying,
  currentTime,
  duration,
  volume,
  isMuted,
  isShuffle,
  repeatMode,
  onTogglePlay,
  onNextTrack,
  onPrevTrack,
  onSeek,
  onVolumeChange,
  onToggleMute,
  onToggleShuffle,
  onToggleRepeat,
  onToggleLike,
  onSelectQueueTrack,
}) => {
  const [activeTab, setActiveTab] = useState<'player' | 'lyrics' | 'queue'>('player');
  const [lyrics, setLyrics] = useState<string[]>([]);
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);
  const [settings, setSettings] = useState<EvaSettings>(() => settingsService.getSettings());

  // Apple Music Motion Canvas state
  const [canvasArtwork, setCanvasArtwork] = useState<AppleCanvasArtwork | null>(null);
  const [showMotionCanvas, setShowMotionCanvas] = useState<boolean>(() => settingsService.getSettings().canvasThumbnailAnimation ?? true);
  const [isLoadingCanvas, setIsLoadingCanvas] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const ambientVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    return settingsService.subscribe((newSettings) => {
      setSettings(newSettings);
      if (newSettings.canvasThumbnailAnimation !== undefined) {
        setShowMotionCanvas(newSettings.canvasThumbnailAnimation);
      }
    });
  }, []);

  const handleToggleMotionCanvas = () => {
    const next = !showMotionCanvas;
    setShowMotionCanvas(next);
    settingsService.updateSetting('canvasThumbnailAnimation', next);
  };

  // Fetch Apple Music Canvas Motion Artwork when track changes
  useEffect(() => {
    if (!currentTrack) {
      setCanvasArtwork(null);
      return;
    }
    let isMounted = true;
    setIsLoadingCanvas(true);

    appleCanvasService
      .getCanvas(currentTrack.title, currentTrack.artist, currentTrack.album)
      .then((art) => {
        if (isMounted) {
          setCanvasArtwork(art);
          setIsLoadingCanvas(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setCanvasArtwork(null);
          setIsLoadingCanvas(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [currentTrack]);

  // Attach HLS stream to video elements when active
  useEffect(() => {
    if (canvasArtwork?.animatedUrl && showMotionCanvas && activeTab === 'player') {
      const clean1 = appleCanvasService.attachHls(videoRef.current, canvasArtwork.animatedUrl);
      const clean2 = appleCanvasService.attachHls(
        ambientVideoRef.current,
        canvasArtwork.tallAnimatedUrl || canvasArtwork.animatedUrl
      );
      return () => {
        clean1();
        clean2();
      };
    }
  }, [canvasArtwork, showMotionCanvas, activeTab]);

  useEffect(() => {
    if (currentTrack && activeTab === 'lyrics') {
      apiGetLyrics(currentTrack.id, currentTrack.title, currentTrack.artist)
        .then(fetched => setLyrics(fetched));
    }
  }, [currentTrack, activeTab]);

  if (!isOpen || !currentTrack) return null;

  const safeCurrentTime = Number.isNaN(currentTime) || currentTime < 0 ? 0 : currentTime;
  const safeDuration = (currentTrack.durationSeconds && currentTrack.durationSeconds > 30) 
    ? currentTrack.durationSeconds 
    : (Number.isNaN(duration) || duration <= 0 ? 218 : duration);

  const formatTime = (secs: number) => {
    const validSecs = Number.isNaN(secs) || secs < 0 ? 0 : secs;
    const mins = Math.floor(validSecs / 60);
    const remainderSecs = Math.floor(validSecs % 60);
    return `${mins}:${remainderSecs < 10 ? '0' : ''}${remainderSecs}`;
  };

  const handleDownload = async () => {
    if (!currentTrack) return;
    const success = await apiInitiateDownload(currentTrack);
    setIsDownloaded(true);
    setTimeout(() => setIsDownloaded(false), 3000);
  };

  const handleShare = async () => {
    if (!currentTrack) return;
    const shareUrl = await apiGetShareLink(currentTrack.id, currentTrack.title, currentTrack.artist);
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2500);
    } catch {
      alert(`Share Song Link: ${shareUrl}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xl transition-all duration-300">
      <div className="relative w-full max-w-md h-[92vh] max-h-[820px] rounded-[36px] bg-gradient-to-b from-purple-100/90 via-white/95 to-slate-50/95 border border-white/90 shadow-2xl overflow-hidden flex flex-col justify-between p-6">
        
        {/* Background Ambient Glow */}
        <div className="absolute top-10 left-10 w-60 h-60 bg-purple-300/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-60 h-60 bg-indigo-300/30 rounded-full blur-3xl pointer-events-none" />

        {/* Ambient Apple Music Motion Canvas backdrop */}
        {canvasArtwork?.animatedUrl && showMotionCanvas && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40 z-0 transition-opacity duration-700">
            <video
              ref={ambientVideoRef}
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover blur-3xl scale-150"
            />
          </div>
        )}

        {/* Top Header Row */}
        <div className="relative z-10 flex items-center justify-between">
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/80 border border-white/90 flex items-center justify-center text-slate-700 hover:text-slate-900 shadow-xs"
            aria-label="Collapse player"
          >
            <ChevronDown size={22} />
          </button>

          <div className="flex bg-white/70 backdrop-blur-md p-1 rounded-full border border-white/90 shadow-2xs">
            <button
              onClick={() => setActiveTab('player')}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${
                activeTab === 'player' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-600'
              }`}
            >
              Player
            </button>
            <button
              onClick={() => setActiveTab('lyrics')}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${
                activeTab === 'lyrics' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-600'
              }`}
            >
              Lyrics
            </button>
            <button
              onClick={() => setActiveTab('queue')}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${
                activeTab === 'queue' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-600'
              }`}
            >
              Queue
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onToggleLike(currentTrack.id)}
              className={`w-9 h-9 rounded-full bg-white/80 border border-white/90 flex items-center justify-center shadow-xs transition-colors cursor-pointer ${
                currentTrack.isLiked ? 'text-pink-500' : 'text-slate-400 hover:text-slate-600'
              }`}
              aria-label="Like track"
            >
              <Heart size={19} className={currentTrack.isLiked ? 'fill-pink-500' : ''} />
            </button>
          </div>
        </div>

        {/* Tab 1: Main Player View */}
        {activeTab === 'player' && (
          <div className="relative z-10 my-auto flex flex-col items-center gap-5 w-full">
            {/* Artwork Container */}
            {!settings.hidePlayerThumbnail && (
              <div
                className={`relative w-64 h-64 sm:w-72 sm:h-72 overflow-hidden shadow-2xl border-4 border-white/90 group transition-all duration-500 ${
                  settings.rotatingThumbnail ? 'rounded-full' : ''
                }`}
                style={{
                  borderRadius: settings.rotatingThumbnail
                    ? '9999px'
                    : `${settings.thumbnailCornerRadius ?? 24}px`,
                }}
              >
                {/* Motion Canvas Video if available and enabled */}
                {canvasArtwork?.animatedUrl && showMotionCanvas ? (
                  <video
                    ref={videoRef}
                    autoPlay
                    loop
                    muted
                    playsInline
                    poster={canvasArtwork.previewUrl || currentTrack.coverUrl}
                    className={`w-full h-full transition-all duration-700 ${
                      settings.cropAlbumArt ? 'object-cover' : 'object-contain'
                    } ${
                      settings.rotatingThumbnail && isPlaying
                        ? 'animate-[spin_12s_linear_infinite]'
                        : isPlaying
                        ? 'scale-105'
                        : 'scale-100'
                    }`}
                  />
                ) : (
                  <img
                    src={canvasArtwork?.previewUrl || currentTrack.coverUrl}
                    alt={currentTrack.title}
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      e.currentTarget.src =
                        'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80';
                    }}
                    className={`w-full h-full transition-all duration-700 ${
                      settings.cropAlbumArt ? 'object-cover' : 'object-contain'
                    } ${
                      settings.rotatingThumbnail && isPlaying
                        ? 'animate-[spin_12s_linear_infinite]'
                        : isPlaying
                        ? 'scale-105'
                        : 'scale-100'
                    }`}
                  />
                )}

                {settings.rotatingThumbnail && (
                  <div className="absolute inset-0 m-auto w-12 h-12 rounded-full bg-slate-900 border-4 border-white shadow-inner flex items-center justify-center">
                    <div className="w-3 h-3 rounded-full bg-purple-500" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60 pointer-events-none" />

                {/* Canvas Motion toggle pill on artwork hover/always visible if present */}
                {canvasArtwork?.animatedUrl && (
                  <button
                    onClick={handleToggleMotionCanvas}
                    className="absolute bottom-2.5 right-2.5 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/65 backdrop-blur-md border border-white/30 text-white text-[11px] font-bold hover:bg-black/85 transition-all shadow-md active:scale-95"
                    title={showMotionCanvas ? 'Switch to static cover art' : 'Play motion canvas video'}
                  >
                    <Film size={12} className={showMotionCanvas ? 'text-purple-400 animate-pulse' : 'text-white/60'} />
                    <span>{showMotionCanvas ? 'Motion ON' : 'Motion OFF'}</span>
                  </button>
                )}
              </div>
            )}

            {/* Title & Artist */}
            <div className="text-center space-y-1 max-w-xs">
              <h2 className="text-2xl font-extrabold text-slate-900 truncate tracking-tight">
                {currentTrack.title}
              </h2>
              <p className="text-sm font-semibold text-purple-900/70 truncate">
                {currentTrack.artist}
              </p>
            </div>

            {/* Audio Codec & Canvas Badges */}
            <div className="flex flex-wrap items-center justify-center gap-1.5">
              {settings.showCodecOnPlayer && (
                <div className="flex items-center justify-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-purple-700 bg-purple-100/70 border border-purple-200 px-2.5 py-0.5 rounded-full shadow-2xs">
                  <span>Lossless</span>
                  <span>•</span>
                  <span>FLAC 24-bit</span>
                  <span>•</span>
                  <span>48kHz</span>
                </div>
              )}

              {canvasArtwork?.animatedUrl && (
                <button
                  onClick={handleToggleMotionCanvas}
                  className={`flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full border transition-all cursor-pointer ${
                    showMotionCanvas
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-purple-400 shadow-xs'
                      : 'bg-white/80 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                  title="Toggle Apple Music Motion Canvas"
                >
                  <Sparkles size={11} className={showMotionCanvas ? 'text-amber-300' : 'text-slate-400'} />
                  <span>Canvas {showMotionCanvas ? 'Active' : 'Off'}</span>
                </button>
              )}
            </div>

            {/* Live Audio Visualizer Bars */}
            <div className="flex items-center justify-center gap-1 h-8 my-1">
              {[0.4, 0.8, 0.3, 1, 0.6, 0.9, 0.5, 0.7, 0.2, 0.8, 0.5, 0.9].map((heightScale, i) => (
                <div
                  key={i}
                  className="w-1.5 bg-gradient-to-t from-purple-500 to-indigo-500 rounded-full transition-all duration-300"
                  style={{
                    height: isPlaying ? `${Math.max(20, heightScale * 100)}%` : '20%',
                    animation: isPlaying ? `bounce 1s infinite ${i * 100}ms alternate` : 'none',
                  }}
                />
              ))}
            </div>

            {/* Timeline Scrubber */}
            <div className="w-full space-y-2">
              <input
                type="range"
                min={0}
                max={safeDuration}
                value={safeCurrentTime}
                onChange={(e) => onSeek(Number(e.target.value))}
                className={`w-full bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-600 focus:outline-none transition-all ${
                  settings.sliderStyle === 'slim' ? 'h-1' : settings.sliderStyle === 'bar' ? 'h-3' : 'h-2'
                }`}
              />
              <div className="flex justify-between text-xs font-bold text-slate-500">
                <span>{formatTime(safeCurrentTime)}</span>
                <span>{formatTime(safeDuration)}</span>
              </div>
            </div>

            {/* Main Player Controls */}
            <div className="flex items-center justify-between w-full max-w-xs px-2 pt-1">
              <button
                onClick={onToggleShuffle}
                className={`p-2.5 rounded-full transition-all ${
                  isShuffle ? 'text-purple-600 bg-purple-100' : 'text-slate-400 hover:text-slate-600'
                }`}
                aria-label="Shuffle"
              >
                <Shuffle size={20} />
              </button>

              <button
                onClick={onPrevTrack}
                className="p-3 rounded-full text-slate-700 hover:text-purple-700 hover:bg-white/80 active:scale-90 transition-all"
                aria-label="Previous"
              >
                <SkipBack size={26} />
              </button>

              <button
                onClick={onTogglePlay}
                className="w-16 h-16 rounded-full bg-gradient-to-tr from-purple-600 via-indigo-600 to-purple-500 text-white flex items-center justify-center shadow-xl shadow-purple-500/40 hover:scale-105 active:scale-95 transition-all"
                aria-label={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? (
                  <Pause size={28} className="fill-white" />
                ) : (
                  <Play size={28} className="fill-white ml-1" />
                )}
              </button>

              <button
                onClick={onNextTrack}
                className="p-3 rounded-full text-slate-700 hover:text-purple-700 hover:bg-white/80 active:scale-90 transition-all"
                aria-label="Next"
              >
                <SkipForward size={26} />
              </button>

              <button
                onClick={onToggleRepeat}
                className={`p-2.5 rounded-full transition-all ${
                  repeatMode !== 'off' ? 'text-purple-600 bg-purple-100' : 'text-slate-400 hover:text-slate-600'
                }`}
                aria-label="Repeat"
              >
                {repeatMode === 'one' ? <Repeat1 size={20} /> : <Repeat size={20} />}
              </button>
            </div>

            {/* Volume Control */}
            {!settings.hidePlayerSlider && (
              <div className="flex items-center gap-3 w-full max-w-xs pt-2">
                <button onClick={onToggleMute} className="text-slate-400 hover:text-slate-600">
                  {isMuted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
                </button>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={isMuted ? 0 : volume}
                  onChange={(e) => onVolumeChange(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                />
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Lyrics View */}
        {activeTab === 'lyrics' && (
          <div
            className={`relative z-10 flex-1 my-4 overflow-y-auto p-4 rounded-3xl border border-white/80 shadow-inner space-y-4 ${
              settings.appleMusicLyricsBlur
                ? 'bg-white/50 backdrop-blur-2xl'
                : 'bg-white/70 backdrop-blur-md'
            } ${
              settings.lyricsPosition === 'center'
                ? 'text-center'
                : settings.lyricsPosition === 'right'
                ? 'text-right'
                : 'text-left'
            }`}
          >
            <h3 className="text-lg font-bold text-slate-900 flex items-center justify-center gap-2">
              <Sparkles size={16} className="text-purple-600" /> Synced Lyrics
            </h3>
            <div className="space-y-3 pt-2">
              {(lyrics.length > 0 ? lyrics : currentTrack.lyrics || []).map((line, idx) => {
                const lineCount =
                  (lyrics.length > 0 ? lyrics : currentTrack.lyrics || []).length || 1;
                const activeIdx = Math.floor((safeCurrentTime / safeDuration) * lineCount);
                const isActive = idx === activeIdx;
                return (
                  <p
                    key={idx}
                    onClick={() => {
                      if (settings.lyricsClick) {
                        onSeek((idx / lineCount) * safeDuration);
                      }
                    }}
                    style={{
                      fontSize: `${settings.lyricsTextSize ?? 20}px`,
                      lineHeight: `${settings.lyricsLineSpacing ?? 1.4}`,
                    }}
                    className={`transition-all duration-300 cursor-pointer ${
                      isActive
                        ? 'text-purple-900 font-extrabold scale-102 shadow-xs'
                        : 'text-slate-500 hover:text-slate-800 font-medium'
                    }`}
                  >
                    {line}
                  </p>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 3: Queue View */}
        {activeTab === 'queue' && (
          <div className="relative z-10 flex-1 my-4 overflow-y-auto p-3 rounded-3xl bg-white/60 backdrop-blur-xl border border-white/80 shadow-inner space-y-2">
            <div className="flex items-center justify-between p-2">
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-purple-900/70">
                Up Next ({queue.length} Tracks)
              </h3>
            </div>

            <div className="divide-y divide-slate-100">
              {queue.map((track) => (
                <div
                  key={track.id}
                  onClick={() => onSelectQueueTrack(track)}
                  className={`flex items-center gap-3 p-2.5 rounded-2xl cursor-pointer hover:bg-white/80 transition-colors ${
                    track.id === currentTrack.id ? 'bg-purple-100/90 font-bold' : ''
                  }`}
                >
                  <img
                    src={track.coverUrl}
                    alt={track.title}
                    className="w-10 h-10 rounded-xl object-cover shadow-2xs"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">{track.title}</p>
                    <p className="text-[11px] text-slate-500 truncate">{track.artist}</p>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-400">{track.duration}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
