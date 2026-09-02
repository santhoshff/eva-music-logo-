import React, { useState } from 'react';
import { Play, Pause, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Track, Playlist, Artist } from '../types';

interface HomeScreenProps {
  tracks: Track[];
  playlists: Playlist[];
  artists: Artist[];
  currentTrackId: string | null;
  isPlaying: boolean;
  onPlayTrack: (track: Track) => void;
  onPlayPlaylist: (playlist: Playlist) => void;
  onSelectArtist: (artist: Artist) => void;
  onToggleLike: (trackId: string) => void;
  onNavigateToDiscover: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  tracks,
  currentTrackId,
  isPlaying,
  onPlayTrack,
  onNavigateToDiscover,
}) => {
  const jumpBackTracks = tracks.slice(0, 6);
  const [activeTrackIndex, setActiveTrackIndex] = useState<number>(0);

  return (
    <div className="flex flex-col gap-6 pb-36 w-full max-w-md mx-auto px-6">
      {/* Section 1: Jump back in (HoverExpand Dynamic Animation) */}
      <div>
        <div className="flex items-center justify-between mb-3.5">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Jump back in</h2>
          <button 
            onClick={onNavigateToDiscover}
            className="text-xs font-semibold text-purple-700 hover:text-purple-900 flex items-center gap-0.5 cursor-pointer"
          >
            See all <ChevronRight size={14} />
          </button>
        </div>

        {/* Framer Motion HoverExpand Interactive Carousel */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full py-1"
        >
          <div className="flex w-full items-center justify-center gap-2 overflow-x-auto no-scrollbar py-2">
            {jumpBackTracks.map((track, index) => {
              const isSelected = activeTrackIndex === index;
              const isCurrentPlaying = currentTrackId === track.id && isPlaying;

              return (
                <motion.div
                  key={track.id}
                  className="relative cursor-pointer overflow-hidden rounded-3xl shadow-lg border border-white/90 group flex-none"
                  animate={{
                    width: isSelected ? '13.5rem' : '3.8rem',
                    height: '14.5rem',
                  }}
                  transition={{ duration: 0.35, ease: 'easeInOut' }}
                  onClick={() => {
                    setActiveTrackIndex(index);
                    onPlayTrack(track);
                  }}
                  onHoverStart={() => setActiveTrackIndex(index)}
                >
                  {/* Gradient Overlay for Active Track */}
                  <AnimatePresence>
                    {isSelected && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-10 bg-gradient-to-t from-slate-950/90 via-slate-900/40 to-transparent p-3.5 flex flex-col justify-end"
                      >
                        <div className="space-y-1">
                          <span className="inline-block px-2 py-0.5 rounded-full bg-purple-500/80 backdrop-blur-md text-[10px] font-bold text-white uppercase tracking-wider">
                            Now Playing
                          </span>
                          <h3 className="font-extrabold text-sm text-white truncate leading-tight">
                            {track.title}
                          </h3>
                          <p className="text-xs font-medium text-slate-300 truncate">
                            {track.artist}
                          </p>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onPlayTrack(track);
                            }}
                            className="mt-2 w-9 h-9 rounded-full bg-purple-600 text-white flex items-center justify-center shadow-lg shadow-purple-500/50 hover:scale-110 active:scale-95 transition-all cursor-pointer"
                          >
                            {isCurrentPlaying ? (
                              <Pause size={18} className="fill-white" />
                            ) : (
                              <Play size={18} className="fill-white ml-0.5" />
                            )}
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Album Cover Image */}
                  <img
                    src={track.coverUrl}
                    alt={track.title}
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80';
                    }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
};
