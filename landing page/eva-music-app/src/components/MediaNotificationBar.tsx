"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Check,
  Cast,
  Radio,
  ChevronDown,
  ChevronUp,
  Volume2,
  ListMusic,
} from 'lucide-react';
import { Track } from '../types';

interface MediaNotificationBarProps {
  currentTrack: Track | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  onTogglePlay: () => void;
  onNextTrack: () => void;
  onPrevTrack: () => void;
  onSeek: (seconds: number) => void;
  onToggleLike?: (trackId: string) => void;
  onOpenFullPlayer?: () => void;
}

// Format seconds into mm:ss
const formatTime = (secs: number): string => {
  if (Number.isNaN(secs) || secs < 0) return '00:00';
  const mins = Math.floor(secs / 60);
  const remainingSecs = Math.floor(secs % 60);
  return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
};

export const MediaNotificationBar: React.FC<MediaNotificationBarProps> = ({
  currentTrack,
  isPlaying,
  currentTime,
  duration,
  onTogglePlay,
  onNextTrack,
  onPrevTrack,
  onSeek,
  onToggleLike,
  onOpenFullPlayer,
}) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [scrubTime, setScrubTime] = useState(0);
  const [isChecked, setIsChecked] = useState(true);
  const [accentColor, setAccentColor] = useState<{ r: number; g: number; b: number }>({
    r: 160,
    g: 135,
    b: 60,
  });
  const [showCastToast, setShowCastToast] = useState(false);

  const progressBarRef = useRef<HTMLDivElement>(null);

  // Dynamically extract vibrant ambient color from current track cover art
  useEffect(() => {
    if (!currentTrack?.coverUrl) return;

    let isMounted = true;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.referrerPolicy = 'no-referrer';
    img.src = currentTrack.coverUrl;

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = 4;
        canvas.height = 4;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, 4, 4);
          const data = ctx.getImageData(0, 0, 4, 4).data;
          let r = 0, g = 0, b = 0, count = 0;

          for (let i = 0; i < data.length; i += 4) {
            // Filter out pure black or pure white to retain warm vivid tone
            const lum = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
            if (lum > 25 && lum < 235) {
              r += data[i];
              g += data[i + 1];
              b += data[i + 2];
              count++;
            }
          }

          if (count > 0 && isMounted) {
            setAccentColor({
              r: Math.round(r / count),
              g: Math.round(g / count),
              b: Math.round(b / count),
            });
            return;
          }
        }
      } catch {
        // Fallback to genre-matched warm palette
      }

      if (isMounted) {
        // Default warm golden tone inspired by mobile reference card
        setAccentColor({ r: 165, g: 140, b: 65 });
      }
    };

    img.onerror = () => {
      if (isMounted) {
        setAccentColor({ r: 165, g: 140, b: 65 });
      }
    };

    return () => {
      isMounted = false;
    };
  }, [currentTrack?.coverUrl]);

  const safeDur = duration && !Number.isNaN(duration) && duration > 0 ? duration : 240;
  const effectiveCurrentTime = isScrubbing ? scrubTime : (currentTime || 0);
  const progressPercent = Math.min(100, Math.max(0, (effectiveCurrentTime / safeDur) * 100));

  // Handle draggable seekbar scrubber
  const handleSeekFromEvent = useCallback(
    (e: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent, commit = false) => {
      if (!progressBarRef.current) return;
      const rect = progressBarRef.current.getBoundingClientRect();
      const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
      const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      const targetSecs = ratio * safeDur;

      setScrubTime(targetSecs);
      if (commit) {
        onSeek(targetSecs);
        setIsScrubbing(false);
      }
    },
    [safeDur, onSeek]
  );

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsScrubbing(true);
    handleSeekFromEvent(e, false);

    const onMouseMove = (moveEvent: MouseEvent) => {
      handleSeekFromEvent(moveEvent, false);
    };

    const onMouseUp = (upEvent: MouseEvent) => {
      handleSeekFromEvent(upEvent, true);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsScrubbing(true);
    handleSeekFromEvent(e, false);

    const onTouchMove = (moveEvent: TouchEvent) => {
      handleSeekFromEvent(moveEvent, false);
    };

    const onTouchEnd = (endEvent: TouchEvent) => {
      handleSeekFromEvent(endEvent, true);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };

    window.addEventListener('touchmove', onTouchMove);
    window.addEventListener('touchend', onTouchEnd);
  };

  if (!currentTrack) return null;

  // Dynamic theme gradients derived from album artwork
  const { r, g, b } = accentColor;
  const glassBackground = `linear-gradient(135deg, rgba(${r}, ${g}, ${b}, 0.88) 0%, rgba(${Math.round(r * 0.75)}, ${Math.round(g * 0.75)}, ${Math.round(b * 0.75)}, 0.94) 100%)`;
  const ambientGlow = `0 18px 45px -10px rgba(${r}, ${g}, ${b}, 0.5), 0 0 30px rgba(${r}, ${g}, ${b}, 0.25)`;

  return (
    <div className="fixed bottom-21 md:bottom-23 left-0 right-0 z-40 px-3 md:px-6 pointer-events-none flex items-center justify-center select-none">
      <AnimatePresence mode="wait">
        {!isMinimized ? (
          /* ========================================================================= */
          /* EXPANDED FULL PLAYBACK NOTIFICATION CARD (MATCHING REFERENCE IMAGE)      */
          /* ========================================================================= */
          <motion.div
            key="expanded-notification-card"
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.92 }}
            transition={{ type: 'spring', damping: 24, stiffness: 320 }}
            className="pointer-events-auto relative w-full max-w-[620px] rounded-[26px] md:rounded-[28px] p-3.5 md:p-4.5 overflow-hidden backdrop-blur-2xl border border-white/20 transition-colors duration-500"
            style={{
              background: glassBackground,
              boxShadow: ambientGlow,
            }}
          >
            {/* Subtle soft backdrop reflection highlight */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-white/15 pointer-events-none" />

            {/* TOP ROW: Artwork + Track Info + Connected Output / Minimize */}
            <div className="relative flex items-center justify-between gap-3 md:gap-4 z-10">
              {/* Left: Square Album Artwork with Rounded Corners */}
              <div
                onClick={onOpenFullPlayer}
                className="relative w-13 h-13 md:w-16 md:h-16 rounded-[12px] md:rounded-[14px] overflow-hidden shadow-md shrink-0 cursor-pointer group"
                title="Tap to open full player"
              >
                <img
                  src={currentTrack.coverUrl}
                  alt={currentTrack.title}
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    e.currentTarget.src =
                      'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80';
                  }}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />

                {/* Subtle Mini Equalizer overlay on artwork */}
                <div className="absolute bottom-1 right-1 bg-black/60 backdrop-blur-xs rounded-md px-1 py-0.5 flex items-end gap-0.5">
                  <motion.span
                    className="w-0.5 bg-white rounded-full"
                    animate={isPlaying ? { height: [3, 11, 4, 13] } : { height: 3 }}
                    transition={isPlaying ? { repeat: Infinity, duration: 0.7, ease: 'easeInOut' } : {}}
                  />
                  <motion.span
                    className="w-0.5 bg-white rounded-full"
                    animate={isPlaying ? { height: [5, 14, 8, 12] } : { height: 4 }}
                    transition={isPlaying ? { repeat: Infinity, duration: 0.5, ease: 'easeInOut', delay: 0.15 } : {}}
                  />
                  <motion.span
                    className="w-0.5 bg-white rounded-full"
                    animate={isPlaying ? { height: [2, 10, 5, 11] } : { height: 3 }}
                    transition={isPlaying ? { repeat: Infinity, duration: 0.65, ease: 'easeInOut', delay: 0.3 } : {}}
                  />
                </div>
              </div>

              {/* Center: Track Title & Artist */}
              <div
                onClick={onOpenFullPlayer}
                className="flex-1 min-w-0 pr-1 cursor-pointer"
                title="Tap to open full player"
              >
                <h3 className="text-white font-bold text-sm md:text-base truncate tracking-tight leading-snug drop-shadow-xs">
                  {currentTrack.title}
                </h3>
                <p className="text-white/75 font-medium text-xs md:text-sm truncate mt-0.5">
                  {currentTrack.artist}
                </p>
              </div>

              {/* Top Right: Cast / Device Output & Minimize Actions */}
              <div className="flex items-center gap-1 shrink-0 text-white/90">
                <button
                  type="button"
                  onClick={() => {
                    setShowCastToast(true);
                    setTimeout(() => setShowCastToast(false), 2200);
                  }}
                  className="p-1.5 md:p-2 rounded-full hover:bg-white/15 transition-colors cursor-pointer active:scale-90"
                  title="Connected Output / Cast"
                >
                  <Cast size={20} strokeWidth={2.2} className="text-white drop-shadow-xs" />
                </button>

                <button
                  type="button"
                  onClick={() => setIsMinimized(true)}
                  className="p-1.5 md:p-2 rounded-full hover:bg-white/15 transition-colors cursor-pointer active:scale-90"
                  title="Minimize notification"
                >
                  <ChevronDown size={20} strokeWidth={2.2} className="text-white/80 hover:text-white" />
                </button>
              </div>
            </div>

            {/* Cast / Connected Output Toast Alert */}
            <AnimatePresence>
              {showCastToast && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="absolute top-2 right-12 z-30 bg-black/80 text-white text-[11px] font-medium px-2.5 py-1 rounded-full shadow-lg border border-white/20 backdrop-blur-md"
                >
                  🎧 Audio connected to current output
                </motion.div>
              )}
            </AnimatePresence>

            {/* MIDDLE ROW: 5 Horizontal Playback Controls */}
            <div className="relative flex items-center justify-between px-2 md:px-8 pt-3 pb-1 z-10">
              {/* 1. Queue / Check Icon */}
              <button
                type="button"
                onClick={() => {
                  setIsChecked(prev => !prev);
                  if (onToggleLike) onToggleLike(currentTrack.id);
                }}
                className="p-2 md:p-2.5 rounded-full hover:bg-white/15 text-white transition-all cursor-pointer active:scale-90"
                title={isChecked ? 'In Your Library' : 'Add to Library'}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center border transition-all ${
                    isChecked
                      ? 'bg-white text-black border-white shadow-xs'
                      : 'border-white/50 text-white/70'
                  }`}
                >
                  <Check size={14} strokeWidth={3} />
                </div>
              </button>

              {/* 2. Previous Track */}
              <button
                type="button"
                onClick={onPrevTrack}
                className="p-2.5 md:p-3 rounded-full hover:bg-white/15 text-white transition-all cursor-pointer active:scale-85"
                title="Previous Track"
              >
                <SkipBack size={24} className="fill-white text-white drop-shadow-xs" />
              </button>

              {/* 3. Large Prominent Play/Pause Button */}
              <button
                type="button"
                onClick={onTogglePlay}
                className="w-13 h-13 md:w-15 md:h-15 rounded-full bg-white/25 hover:bg-white/35 active:scale-92 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-lg text-white transition-transform duration-150 cursor-pointer"
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? (
                  <Pause size={28} className="fill-white text-white drop-shadow-sm" />
                ) : (
                  <Play size={28} className="fill-white text-white ml-1 drop-shadow-sm" />
                )}
              </button>

              {/* 4. Next Track */}
              <button
                type="button"
                onClick={onNextTrack}
                className="p-2.5 md:p-3 rounded-full hover:bg-white/15 text-white transition-all cursor-pointer active:scale-85"
                title="Next Track"
              >
                <SkipForward size={24} className="fill-white text-white drop-shadow-xs" />
              </button>

              {/* 5. Broadcast / Audio Output Icon */}
              <button
                type="button"
                onClick={onOpenFullPlayer}
                className="p-2 md:p-2.5 rounded-full hover:bg-white/15 text-white transition-all cursor-pointer active:scale-90"
                title="Audio Equalizer & Visualizer"
              >
                <Radio size={22} strokeWidth={2.2} className="text-white drop-shadow-xs" />
              </button>
            </div>

            {/* BOTTOM ROW: Interactive Seek Progress Bar + Timestamps */}
            <div className="relative flex items-center gap-2.5 md:gap-3 px-1 pt-2 z-10">
              {/* Current Elapsed Time (Left) */}
              <span className="text-[11px] md:text-xs font-mono font-medium text-white/80 w-11 text-right shrink-0">
                {formatTime(effectiveCurrentTime)}
              </span>

              {/* Draggable Progress Track */}
              <div
                ref={progressBarRef}
                onMouseDown={handleMouseDown}
                onTouchStart={handleTouchStart}
                className="relative flex-1 h-6 flex items-center cursor-pointer group touch-none"
                title="Drag to seek"
              >
                {/* Background Rail */}
                <div className="w-full h-1 md:h-1.2 bg-white/25 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white rounded-full transition-all duration-75"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>

                {/* Draggable White Circular Thumb */}
                <div
                  className="absolute w-3.5 h-3.5 md:w-4 md:h-4 bg-white rounded-full shadow-md -translate-x-1/2 transition-transform duration-100 group-hover:scale-125"
                  style={{ left: `${progressPercent}%` }}
                />
              </div>

              {/* Total Duration (Right) */}
              <span className="text-[11px] md:text-xs font-mono font-medium text-white/80 w-11 text-left shrink-0">
                {formatTime(safeDur)}
              </span>
            </div>
          </motion.div>
        ) : (
          /* ========================================================================= */
          /* MINIMIZED COMPACT FLOATING MINI-PLAYER                                   */
          /* ========================================================================= */
          <motion.div
            key="minimized-pill-player"
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            onClick={() => setIsMinimized(false)}
            className="pointer-events-auto relative flex items-center justify-between gap-3 h-14 md:h-15 w-[310px] md:w-[360px] px-3 rounded-full backdrop-blur-2xl border border-white/20 shadow-xl cursor-pointer select-none transition-transform active:scale-98"
            style={{
              background: glassBackground,
              boxShadow: ambientGlow,
            }}
            title="Click to expand playback notification"
          >
            {/* Top Micro Scrubber Line */}
            <div className="absolute top-0 left-4 right-4 h-0.5 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-white rounded-full" style={{ width: `${progressPercent}%` }} />
            </div>

            {/* Left: Artwork + Animated Vinyl spin */}
            <div className="relative w-9 h-9 md:w-10 md:h-10 rounded-full overflow-hidden shadow-xs shrink-0 bg-black/20">
              <img
                src={currentTrack.coverUrl}
                alt={currentTrack.title}
                referrerPolicy="no-referrer"
                className={`w-full h-full object-cover ${isPlaying ? 'animate-spin [animation-duration:9s]' : ''}`}
              />
            </div>

            {/* Middle: Title & Artist */}
            <div className="flex-1 min-w-0 pr-1">
              <p className="text-white text-xs md:text-sm font-bold truncate leading-tight">
                {currentTrack.title}
              </p>
              <p className="text-white/70 text-[10px] md:text-xs font-medium truncate">
                {currentTrack.artist}
              </p>
            </div>

            {/* Right: Controls (Play/Pause & Expand) */}
            <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                onClick={onTogglePlay}
                className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white cursor-pointer active:scale-90"
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <Pause size={18} className="fill-white" /> : <Play size={18} className="fill-white ml-0.5" />}
              </button>

              <button
                type="button"
                onClick={() => setIsMinimized(false)}
                className="p-2 text-white/80 hover:text-white rounded-full hover:bg-white/10 cursor-pointer"
                title="Expand notification card"
              >
                <ChevronUp size={18} strokeWidth={2.5} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
