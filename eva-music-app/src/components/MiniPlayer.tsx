import React from 'react';
import { Play, Pause, Heart, SkipForward } from 'lucide-react';
import { Track } from '../types';

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
  if (!currentTrack) return null;

  const safeDur = (duration && !Number.isNaN(duration) && duration > 0) ? duration : 180;
  const safeCur = (currentTime && !Number.isNaN(currentTime) && currentTime >= 0) ? currentTime : 0;
  const progressPercent = Math.min(100, Math.max(0, (safeCur / safeDur) * 100));

  return (
    <div className="fixed bottom-22 left-0 right-0 z-40 px-6 w-full max-w-md mx-auto pointer-events-auto">
      <div
        onClick={onOpenFullPlayer}
        className="relative overflow-hidden rounded-2xl bg-white/85 backdrop-blur-2xl border border-white/90 shadow-xl cursor-pointer group hover:bg-white transition-all duration-200"
      >
        {/* Top Slim Scrubber Line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-slate-100">
          <div
            className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="p-2.5 pt-3 flex items-center justify-between gap-3">
          {/* Cover & Info */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="relative flex-none w-11 h-11 rounded-xl overflow-hidden shadow-xs bg-slate-100">
              <img
                src={currentTrack.coverUrl}
                alt={currentTrack.title}
                referrerPolicy="no-referrer"
                onError={(e) => {
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80';
                }}
                className={`w-full h-full object-cover transition-transform ${
                  isPlaying ? 'scale-105' : ''
                }`}
              />
            </div>

            <div className="min-w-0">
              <h4 className="font-extrabold text-sm text-slate-900 truncate">
                {currentTrack.title}
              </h4>
              <p className="text-xs font-semibold text-slate-500 truncate">
                {currentTrack.artist}
              </p>
            </div>
          </div>

          {/* Player Actions */}
          <div className="flex items-center gap-2 flex-none">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleLike(currentTrack.id);
              }}
              className={`p-2 rounded-full transition-colors ${
                currentTrack.isLiked ? 'text-pink-500' : 'text-slate-400 hover:text-slate-600'
              }`}
              aria-label="Like"
            >
              <Heart size={18} className={currentTrack.isLiked ? 'fill-pink-500' : ''} />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onTogglePlay();
              }}
              className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-500 text-white flex items-center justify-center shadow-md shadow-purple-400/30 hover:scale-105 active:scale-95 transition-all"
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <Pause size={18} className="fill-white" />
              ) : (
                <Play size={18} className="fill-white ml-0.5" />
              )}
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onNextTrack();
              }}
              className="p-2 rounded-full text-slate-600 hover:text-purple-700 transition-colors"
              aria-label="Next track"
            >
              <SkipForward size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
