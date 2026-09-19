"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Heart, SkipForward, ChevronRight, ChevronLeft } from 'lucide-react';
import { Track } from '../types';
import { cn } from '@/lib/utils';

interface MiniPlayerProps {
  currentTrack: Track | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  onTogglePlay: () => void;
  onNextTrack: () => void;
  onToggleLike: (trackId: string) => void;
  onOpenFullPlayer: () => void;
}

export const MiniPlayer: React.FC<MiniPlayerProps> = ({
  currentTrack,
  isPlaying,
  currentTime,
  duration,
  onTogglePlay,
  onNextTrack,
  onToggleLike,
  onOpenFullPlayer,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  if (!currentTrack) return null;

  const safeDur = duration && !Number.isNaN(duration) && duration > 0 ? duration : 180;
  const safeCur = currentTime && !Number.isNaN(currentTime) && currentTime >= 0 ? currentTime : 0;
  const progressPercent = Math.min(100, Math.max(0, (safeCur / safeDur) * 100));

  return (
    <div className="fixed bottom-22 left-0 right-0 z-40 px-4 w-full max-w-md mx-auto pointer-events-auto flex items-center justify-center">
      <motion.div layout className="relative flex items-center justify-center">
        <motion.div
          className={cn(
            "relative flex items-center justify-between overflow-hidden rounded-full shadow-xl shadow-purple-900/10 backdrop-blur-2xl border border-white/90 bg-white/92",
            "h-16 transition-colors select-none"
          )}
          style={{ borderRadius: 9999 }}
          initial={{ scale: 0, y: "100%" }}
          transition={{ type: "spring", bounce: 0.16 }}
          animate={{ scale: 1, y: 0, width: !isExpanded ? 64 : 360 }}
        >
          {/* Top Slim Scrubber Progress Line */}
          {isExpanded && (
            <div className="absolute top-0 left-0 right-0 h-1 bg-slate-100/80">
              <div
                className="h-full bg-gradient-to-r from-purple-500 via-indigo-500 to-pink-500 transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          )}

          {/* ================= COLLAPSED 64px VIEW (DYNAMIC ISLAND BUBBLE) ================= */}
          {!isExpanded ? (
            <div
              onClick={() => setIsExpanded(true)}
              className="w-16 h-16 rounded-full flex items-center justify-center cursor-pointer relative group p-1.5"
              title="Click to expand player"
            >
              <div className="relative w-full h-full rounded-full overflow-hidden shadow-xs bg-slate-100">
                <img
                  src={currentTrack.coverUrl}
                  alt={currentTrack.title}
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80';
                  }}
                  className={cn(
                    "w-full h-full object-cover",
                    isPlaying ? "animate-spin [animation-duration:8s]" : ""
                  )}
                />
                <div className="absolute inset-0 bg-black/25 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                  {isPlaying ? <Pause size={16} className="fill-white" /> : <Play size={16} className="fill-white ml-0.5" />}
                </div>
              </div>
              {/* Pulse ring if playing */}
              {isPlaying && (
                <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-purple-600 border border-white" />
                </span>
              )}
            </div>
          ) : (
            /* ================= EXPANDED 360px VIEW (SKIPER3 DYNAMIC ISLAND) ================= */
            <>
              {/* Left Section: Track Info & Equalizer */}
              <div
                onClick={onOpenFullPlayer}
                className="flex items-center gap-2.5 h-full w-[260px] pl-3.5 pr-1 cursor-pointer min-w-0"
              >
                {/* Vinyl Thumbnail */}
                <div className="relative flex-none w-11 h-11 rounded-full overflow-hidden shadow-xs bg-slate-100 border border-white">
                  <img
                    src={currentTrack.coverUrl}
                    alt={currentTrack.title}
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80';
                    }}
                    className={cn(
                      "w-full h-full object-cover",
                      isPlaying ? "animate-spin [animation-duration:10s]" : ""
                    )}
                  />
                  <div className="absolute inset-0 rounded-full border-2 border-white/40 pointer-events-none" />
                </div>

                {/* Title & Animated Audio Dots/Wave */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-extrabold text-xs text-slate-900 truncate">
                      {currentTrack.title}
                    </h4>
                  </div>
                  
                  <div className="flex items-center gap-2 mt-0.5">
                    <p className="text-[11px] font-semibold text-slate-500 truncate">
                      {currentTrack.artist}
                    </p>

                    {/* Dynamic Equalizer Dots from Skiper3 style */}
                    {isPlaying && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center gap-1 flex-none"
                      >
                        <span className="w-1 h-2.5 rounded-full bg-purple-500 animate-bounce [animation-delay:0ms]" />
                        <span className="w-1 h-3.5 rounded-full bg-indigo-500 animate-bounce [animation-delay:150ms]" />
                        <span className="w-1 h-2 rounded-full bg-pink-500 animate-bounce [animation-delay:300ms]" />
                      </motion.div>
                    )}
                  </div>
                </div>

                {/* Heart Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleLike(currentTrack.id);
                  }}
                  className={`p-1.5 rounded-full transition-colors flex-none ${
                    currentTrack.isLiked ? 'text-pink-500' : 'text-slate-400 hover:text-slate-600'
                  }`}
                  aria-label="Like track"
                >
                  <Heart size={16} className={currentTrack.isLiked ? 'fill-pink-500' : ''} />
                </button>
              </div>

              {/* Right Section: Action Controls with Skiper3 Blur & Spring Transition */}
              <div className="flex items-center justify-center gap-1.5 h-full w-[95px] pr-3 flex-none">
                {/* Play / Pause with Skiper3 spring & blur animation */}
                <motion.div
                  key={isPlaying ? 'pause-btn' : 'play-btn'}
                  initial={{ opacity: 0, scale: 0.6, filter: 'blur(4px)' }}
                  animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, scale: 0.6, filter: 'blur(4px)' }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onTogglePlay();
                  }}
                  className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-600 via-indigo-600 to-pink-600 text-white flex items-center justify-center shadow-md shadow-purple-500/25 hover:scale-105 active:scale-95 transition-all cursor-pointer flex-none"
                  aria-label={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? (
                    <Pause size={17} className="fill-white" />
                  ) : (
                    <Play size={17} className="fill-white ml-0.5" />
                  )}
                </motion.div>

                {/* Next Track */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onNextTrack();
                  }}
                  className="p-1.5 rounded-full text-slate-500 hover:text-purple-700 active:scale-95 transition-all cursor-pointer flex-none"
                  aria-label="Next track"
                >
                  <SkipForward size={16} />
                </button>

                {/* Minimize Pill Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsExpanded(false);
                  }}
                  className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer transition-colors"
                  title="Minimize player"
                >
                  <ChevronRight size={13} />
                </button>
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
};
