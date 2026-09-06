import React from 'react';
import { X, Play, Heart, Flame, Sparkles, Check, Music2 } from 'lucide-react';
import { Artist, Track } from '../types';

interface ArtistDetailModalProps {
  artist: Artist | null;
  onClose: () => void;
  onPlayTrack: (track: Track) => void;
  onToggleFollow: (artistId: string) => void;
  currentTrackId?: string | null;
  isPlaying?: boolean;
}

export const ArtistDetailModal: React.FC<ArtistDetailModalProps> = ({
  artist,
  onClose,
  onPlayTrack,
  onToggleFollow,
  currentTrackId,
  isPlaying,
}) => {
  if (!artist) return null;

  const handlePlayAll = () => {
    if (artist.topTracks.length > 0) {
      onPlayTrack(artist.topTracks[0]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md h-[88vh] max-h-[780px] rounded-[32px] bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-purple-500/30 shadow-2xl shadow-purple-950/50 overflow-hidden flex flex-col text-white">
        
        {/* Banner with Singer Cover Photo */}
        <div className="relative h-60 w-full shrink-0">
          <img
            src={artist.coverUrl}
            alt={artist.name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-black/30" />
          
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/50 backdrop-blur-md text-white/90 hover:text-white flex items-center justify-center hover:bg-black/75 transition-all cursor-pointer z-10"
          >
            <X size={18} />
          </button>

          {/* Artist Header Info */}
          <div className="absolute bottom-4 left-5 right-5 flex items-end justify-between gap-3">
            <div className="flex items-center gap-3.5">
              <div className="relative">
                <img
                  src={artist.avatarUrl}
                  alt={artist.name}
                  referrerPolicy="no-referrer"
                  className="w-18 h-18 rounded-full object-cover border-2 border-purple-400 shadow-xl shadow-purple-950/60 ring-4 ring-purple-500/20"
                />
                <span className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-purple-600 border-2 border-slate-900 flex items-center justify-center text-[10px] font-black">
                  ✓
                </span>
              </div>
              <div>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-purple-300">
                  <Sparkles size={10} className="text-purple-400" />
                  Verified Tamil Maestro
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-white leading-tight mt-0.5">
                  {artist.name}
                </h2>
                <p className="text-xs text-purple-200/80 font-medium">
                  {artist.monthlyListeners} monthly listeners
                </p>
              </div>
            </div>

            <button
              onClick={() => onToggleFollow(artist.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer shrink-0 ${
                artist.isFollowing
                  ? 'bg-purple-900/50 text-purple-200 border border-purple-500/40'
                  : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-600/30 hover:scale-105 active:scale-95'
              }`}
            >
              {artist.isFollowing ? 'Following' : '+ Follow'}
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6 no-scrollbar">
          {/* Quick Play All Header */}
          <div className="flex items-center justify-between bg-purple-950/40 border border-purple-500/20 rounded-2xl p-3.5 backdrop-blur-md">
            <div>
              <p className="text-xs font-bold text-white flex items-center gap-1.5">
                <Flame size={14} className="text-amber-400 fill-amber-400" />
                Discography & Top Hits
              </p>
              <p className="text-[11px] text-purple-300/80 font-medium">
                {artist.topTracks.length} legendary hit tracks available
              </p>
            </div>
            <button
              onClick={handlePlayAll}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-xs shadow-lg shadow-purple-600/40 hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              <Play size={13} className="fill-white" />
              Play All
            </button>
          </div>

          {/* About Section */}
          <div>
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-purple-300/80 mb-2">
              About
            </h3>
            <p className="text-xs font-medium text-slate-300 leading-relaxed bg-slate-800/40 rounded-2xl p-3.5 border border-slate-700/40">
              {artist.bio}
            </p>
          </div>

          {/* Famous Songs Ordered by Popularity */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-purple-300/80 flex items-center gap-1.5">
                <Music2 size={13} className="text-purple-400" />
                Famous Songs (Ranked by Fame)
              </h3>
              <span className="text-[10px] font-bold text-slate-400">Order by Popularity</span>
            </div>

            <div className="space-y-2">
              {artist.topTracks.map((track, index) => {
                const rank = index + 1;
                const isCurrent = currentTrackId === track.id && isPlaying;

                return (
                  <div
                    key={track.id}
                    onClick={() => onPlayTrack(track)}
                    className={`flex items-center gap-3 p-2.5 rounded-2xl border transition-all cursor-pointer group ${
                      isCurrent
                        ? 'bg-purple-900/40 border-purple-500/50 shadow-md shadow-purple-950/40'
                        : 'bg-slate-800/50 border-slate-700/40 hover:bg-slate-800 hover:border-purple-500/30'
                    }`}
                  >
                    {/* Rank Badge */}
                    <div className="w-6 flex items-center justify-center shrink-0">
                      {rank === 1 ? (
                        <span className="w-5 h-5 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 text-[11px] font-black flex items-center justify-center shadow-xs">
                          1
                        </span>
                      ) : rank === 2 ? (
                        <span className="w-5 h-5 rounded-full bg-slate-300 text-slate-900 text-[11px] font-black flex items-center justify-center">
                          2
                        </span>
                      ) : rank === 3 ? (
                        <span className="w-5 h-5 rounded-full bg-amber-700 text-white text-[11px] font-black flex items-center justify-center">
                          3
                        </span>
                      ) : (
                        <span className="text-xs font-bold text-slate-500 group-hover:text-purple-300">
                          {rank}
                        </span>
                      )}
                    </div>

                    {/* Track Cover */}
                    <img
                      src={track.coverUrl}
                      alt={track.title}
                      referrerPolicy="no-referrer"
                      className="w-11 h-11 rounded-xl object-cover shrink-0 border border-slate-700/60"
                    />

                    {/* Title & Info */}
                    <div className="flex-1 min-w-0">
                      <h4 className={`font-bold text-xs truncate ${isCurrent ? 'text-purple-300' : 'text-white'}`}>
                        {track.title}
                      </h4>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">
                        {track.album || track.genre} • <span className="text-purple-400 font-semibold">{track.plays} plays</span>
                      </p>
                    </div>

                    {/* Duration / Play Button */}
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[11px] font-medium text-slate-400 hidden sm:inline">
                        {track.duration}
                      </span>
                      <button className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                        isCurrent
                          ? 'bg-purple-500 text-white shadow-md shadow-purple-500/40 scale-105'
                          : 'bg-purple-900/40 text-purple-300 group-hover:bg-purple-600 group-hover:text-white'
                      }`}>
                        <Play size={13} className="fill-current ml-0.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
