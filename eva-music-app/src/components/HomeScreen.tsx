import React, { useState, useMemo } from 'react';
import { Play, Pause, ChevronRight, Sparkles, RotateCcw, Heart, Mic2, Flame, Trophy, Music } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Track, Playlist, Artist } from '../types';
import { evaBrainService } from '../services/evaBrainService';
import { TAMIL_SINGERS, NEW_RELEASES_LINEUP, USER_TOP_20_TRACKS } from '../data/musicData';

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
  artists,
  currentTrackId,
  isPlaying,
  onPlayTrack,
  onSelectArtist,
  onToggleLike,
  onNavigateToDiscover,
}) => {
  const [activeTrackIndex, setActiveTrackIndex] = useState<number>(0);
  const [seedOffset, setSeedOffset] = useState<number>(() => Math.floor(Math.random() * 100));
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Derive personalized trending tracks
  const trendingTracks = useMemo(() => {
    return evaBrainService.getPersonalizedTrendingTracks(tracks, 6, seedOffset);
  }, [tracks, seedOffset]);

  // Derive dynamic User Top 20 based on user taste affinities and available tracks
  const userTop20 = useMemo(() => {
    const dynamicList = evaBrainService.getUserTasteTop20Tracks(tracks);
    if (dynamicList && dynamicList.length >= 10) {
      return dynamicList;
    }
    return USER_TOP_20_TRACKS;
  }, [tracks]);

  // Curated Tamil singers (prioritizing our rich dataset of 15 Tamil singers)
  const tamilSingersList = useMemo(() => {
    const map = new Map<string, Artist>();
    TAMIL_SINGERS.forEach(s => map.set(s.id, s));
    artists.forEach(a => {
      if (!map.has(a.id) && (a.bio?.toLowerCase().includes('tamil') || a.bio?.toLowerCase().includes('composer'))) {
        map.set(a.id, a);
      }
    });
    return Array.from(map.values());
  }, [artists]);

  const handleRefresh = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsRefreshing(true);
    setSeedOffset(prev => prev + 1);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 450);
  };

  const handlePlayAllTop20 = () => {
    if (userTop20.length > 0) {
      onPlayTrack(userTop20[0]);
    }
  };

  return (
    <div className="flex flex-col gap-8 pb-36 w-full max-w-md mx-auto px-5">
      
      {/* ==================== 1. TRENDING FOR YOU (CAROUSEL) ==================== */}
      <div>
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Trending For You</h2>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-700 border border-purple-200 shadow-xs">
              <Sparkles size={11} className="text-purple-600 animate-pulse" />
              Eva Brain
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleRefresh}
              title="Refresh personalized recommendations"
              className="p-1.5 rounded-full hover:bg-purple-100/80 text-slate-500 hover:text-purple-700 active:scale-95 transition-all cursor-pointer"
            >
              <RotateCcw size={14} className={isRefreshing ? 'animate-spin text-purple-600' : ''} />
            </button>
            <button 
              onClick={onNavigateToDiscover}
              className="text-xs font-semibold text-purple-700 hover:text-purple-900 flex items-center gap-0.5 cursor-pointer"
            >
              See all <ChevronRight size={14} />
            </button>
          </div>
        </div>

        {/* Interactive Carousel */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full py-1"
        >
          <div className="flex w-full items-center justify-start sm:justify-center gap-2.5 overflow-x-auto no-scrollbar py-2">
            {trendingTracks.map((track, index) => {
              const isSelected = activeTrackIndex === index;
              const isCurrentPlaying = currentTrackId === track.id && isPlaying;

              return (
                <motion.div
                  key={track.id}
                  className="relative cursor-pointer overflow-hidden rounded-3xl shadow-lg border border-white/90 group flex-none"
                  animate={{
                    width: isSelected ? '13.5rem' : '4.2rem',
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
                        className="absolute inset-0 z-10 bg-gradient-to-t from-slate-950/95 via-slate-900/50 to-transparent p-3.5 flex flex-col justify-end"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="inline-block px-2 py-0.5 rounded-full bg-purple-500/90 backdrop-blur-md text-[10px] font-bold text-white uppercase tracking-wider">
                              {isCurrentPlaying ? 'Now Playing' : 'Trending Hit'}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onToggleLike(track.id);
                              }}
                              className="p-1 rounded-full bg-black/40 backdrop-blur-md text-white hover:text-pink-400 transition-colors cursor-pointer"
                            >
                              <Heart
                                size={14}
                                className={track.isLiked ? 'fill-pink-500 text-pink-500' : 'text-white/80'}
                              />
                            </button>
                          </div>

                          <h3 className="font-extrabold text-sm text-white truncate leading-tight mt-1">
                            {track.title}
                          </h3>
                          <p className="text-xs font-medium text-slate-300 truncate">
                            {track.artist}
                          </p>
                          <p className="text-[10px] font-semibold text-purple-300/90 truncate">
                            {track.genre}
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
                      e.currentTarget.src = 'https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/b5/fa/46/b5fa4632-dd53-32fc-25fc-e390940f7a43/196872454130.jpg/600x600bb.jpg';
                    }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* ==================== 2. TAMIL SINGERS & MUSIC DIRECTORS ==================== */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-md shadow-purple-500/30">
              <Mic2 size={15} />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">Tamil Singers & Maestros</h2>
              <p className="text-[11px] font-medium text-slate-500">
                Click any singer to list all famous songs in order
              </p>
            </div>
          </div>
        </div>

        {/* Horizontal Row of Singers with Real Photos */}
        <div className="flex items-center gap-3.5 overflow-x-auto no-scrollbar py-2 -mx-1 px-1">
          {tamilSingersList.map((singer) => (
            <motion.div
              key={singer.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onSelectArtist(singer)}
              className="flex flex-col items-center gap-1.5 shrink-0 w-20 cursor-pointer group"
            >
              {/* Avatar Circle with Ring */}
              <div className="relative w-17 h-17 rounded-full p-0.5 bg-gradient-to-tr from-purple-600 via-pink-500 to-amber-400 group-hover:shadow-lg group-hover:shadow-purple-500/40 transition-all">
                <img
                  src={singer.avatarUrl}
                  alt={singer.name}
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    e.currentTarget.src = singer.coverUrl;
                  }}
                  className="w-full h-full rounded-full object-cover bg-slate-800 border-2 border-white group-hover:brightness-105 transition-all"
                />
                <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-purple-600 border border-white text-white text-[9px] font-black flex items-center justify-center shadow-xs">
                  ✓
                </span>
              </div>

              {/* Singer Name */}
              <div className="text-center w-full">
                <p className="text-xs font-bold text-slate-800 truncate group-hover:text-purple-700 transition-colors">
                  {singer.name}
                </p>
                <p className="text-[10px] text-purple-600 font-semibold truncate">
                  {singer.monthlyListeners}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ==================== 3. NEWLY RELEASED SONGS LINEUP ==================== */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-500 text-white flex items-center justify-center shadow-md shadow-rose-500/30">
              <Flame size={15} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">Newly Released Lineup</h2>
                <span className="px-1.5 py-0.5 rounded-full text-[9px] font-extrabold bg-rose-100 text-rose-700 uppercase tracking-wide">
                  Fresh 2025
                </span>
              </div>
              <p className="text-[11px] font-medium text-slate-500">
                Latest Tamil chartbusters & movie singles
              </p>
            </div>
          </div>
        </div>

        {/* Horizontal Lineup of Newly Released Songs */}
        <div className="flex items-center gap-3.5 overflow-x-auto no-scrollbar py-2 -mx-1 px-1">
          {NEW_RELEASES_LINEUP.map((track) => {
            const isCurrent = currentTrackId === track.id && isPlaying;

            return (
              <motion.div
                key={track.id}
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onPlayTrack(track)}
                className="relative shrink-0 w-38 rounded-2xl bg-white p-2.5 shadow-md hover:shadow-xl border border-slate-100 hover:border-purple-300 transition-all cursor-pointer group flex flex-col"
              >
                {/* Cover Image */}
                <div className="relative w-full aspect-square rounded-xl overflow-hidden mb-2 bg-slate-100">
                  <img
                    src={track.coverUrl}
                    alt={track.title}
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      e.currentTarget.src = 'https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/b5/fa/46/b5fa4632-dd53-32fc-25fc-e390940f7a43/196872454130.jpg/600x600bb.jpg';
                    }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {/* Badge */}
                  <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-[9px] font-extrabold text-amber-300 uppercase tracking-wider">
                    {track.releaseYear || 'NEW'}
                  </span>

                  {/* Play Button Overlay */}
                  <div className={`absolute bottom-2 right-2 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                    isCurrent
                      ? 'bg-purple-600 text-white shadow-lg scale-100 opacity-100'
                      : 'bg-white/90 text-purple-700 shadow-md opacity-0 group-hover:opacity-100 group-hover:scale-100 scale-90'
                  }`}>
                    {isCurrent ? <Pause size={14} className="fill-current" /> : <Play size={14} className="fill-current ml-0.5" />}
                  </div>
                </div>

                {/* Track Details */}
                <h3 className="font-bold text-xs text-slate-900 truncate group-hover:text-purple-700 transition-colors">
                  {track.title}
                </h3>
                <p className="text-[11px] font-medium text-slate-500 truncate mt-0.5">
                  {track.artist}
                </p>
                <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-100 text-[10px] text-slate-400 font-medium">
                  <span className="text-purple-600 font-bold">{track.plays || '10M+'}</span>
                  <span>{track.duration}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* ==================== 4. USER TOP 20 SONGS (USER TASTE) ==================== */}
      <div>
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-purple-500/30">
              <Trophy size={15} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">Your Top 20 Songs</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-purple-100 text-purple-700 border border-purple-200">
                  TOP 20
                </span>
              </div>
              <p className="text-[11px] font-medium text-slate-500">
                Personalized neural ranking tailored to your taste
              </p>
            </div>
          </div>

          <button
            onClick={handlePlayAllTop20}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-purple-600 hover:bg-purple-700 active:scale-95 text-white font-bold text-xs shadow-md shadow-purple-500/30 transition-all cursor-pointer"
          >
            <Play size={12} className="fill-white ml-0.5" />
            Play All
          </button>
        </div>

        {/* Ranked Top 20 List */}
        <div className="space-y-2 bg-white/70 backdrop-blur-md p-2.5 rounded-3xl border border-slate-200/80 shadow-xs">
          {userTop20.map((track, index) => {
            const rank = index + 1;
            const isCurrent = currentTrackId === track.id && isPlaying;
            const tasteTag = (track as any).tasteTag || `Rank #${rank} • Recommended`;

            return (
              <motion.div
                key={track.id}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => onPlayTrack(track)}
                className={`flex items-center gap-3 p-2.5 rounded-2xl transition-all cursor-pointer border ${
                  isCurrent
                    ? 'bg-purple-50 border-purple-300 shadow-sm'
                    : 'bg-white/80 border-slate-100 hover:bg-purple-50/50 hover:border-purple-200'
                }`}
              >
                {/* Rank Number Badge */}
                <div className="w-7 flex items-center justify-center shrink-0">
                  {rank === 1 ? (
                    <span className="w-6 h-6 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 text-xs font-black flex items-center justify-center shadow-sm">
                      1
                    </span>
                  ) : rank === 2 ? (
                    <span className="w-6 h-6 rounded-full bg-slate-300 text-slate-900 text-xs font-black flex items-center justify-center">
                      2
                    </span>
                  ) : rank === 3 ? (
                    <span className="w-6 h-6 rounded-full bg-amber-700 text-white text-xs font-black flex items-center justify-center">
                      3
                    </span>
                  ) : (
                    <span className="text-xs font-extrabold text-slate-400">
                      {rank}
                    </span>
                  )}
                </div>

                {/* Album Cover */}
                <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-slate-100 border border-slate-200">
                  <img
                    src={track.coverUrl}
                    alt={track.title}
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      e.currentTarget.src = 'https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/b5/fa/46/b5fa4632-dd53-32fc-25fc-e390940f7a43/196872454130.jpg/600x600bb.jpg';
                    }}
                    className="w-full h-full object-cover"
                  />
                  {isCurrent && (
                    <div className="absolute inset-0 bg-purple-900/60 flex items-center justify-center">
                      <div className="flex items-end gap-0.5 h-3.5">
                        <span className="w-0.5 h-3 bg-white animate-bounce" />
                        <span className="w-0.5 h-2 bg-white animate-bounce [animation-delay:0.2s]" />
                        <span className="w-0.5 h-3.5 bg-white animate-bounce [animation-delay:0.4s]" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Title, Artist & Taste Tag */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h4 className={`font-bold text-xs truncate ${isCurrent ? 'text-purple-700' : 'text-slate-900'}`}>
                      {track.title}
                    </h4>
                  </div>
                  <p className="text-[11px] font-medium text-slate-500 truncate mt-0.5">
                    {track.artist}
                  </p>
                  <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded-md bg-purple-100/70 text-[9px] font-bold text-purple-700 truncate max-w-full">
                    {tasteTag}
                  </span>
                </div>

                {/* Plays & Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <div className="text-right hidden sm:block">
                    <p className="text-[11px] font-bold text-slate-700">{track.plays}</p>
                    <p className="text-[10px] text-slate-400 font-medium">{track.duration}</p>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleLike(track.id);
                    }}
                    className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-pink-500 transition-colors cursor-pointer"
                  >
                    <Heart
                      size={15}
                      className={track.isLiked ? 'fill-pink-500 text-pink-500' : ''}
                    />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onPlayTrack(track);
                    }}
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                      isCurrent
                        ? 'bg-purple-600 text-white shadow-md shadow-purple-500/30'
                        : 'bg-purple-100 text-purple-700 hover:bg-purple-600 hover:text-white'
                    }`}
                  >
                    {isCurrent ? <Pause size={13} className="fill-current" /> : <Play size={13} className="fill-current ml-0.5" />}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
