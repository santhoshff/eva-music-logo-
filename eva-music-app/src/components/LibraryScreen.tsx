import React, { useState } from 'react';
import { MoreVertical, SlidersHorizontal, Heart, Play, Music, ListMusic } from 'lucide-react';
import { Track } from '../types';

interface LibraryScreenProps {
  tracks: Track[];
  currentTrackId: string | null;
  isPlaying: boolean;
  onPlayTrack: (track: Track) => void;
  onToggleLike: (trackId: string) => void;
  onOpenInstallModal?: () => void;
}

export const LibraryScreen: React.FC<LibraryScreenProps> = ({
  tracks,
  currentTrackId,
  isPlaying,
  onPlayTrack,
  onToggleLike,
}) => {
  const [selectedSubCategory, setSelectedSubCategory] = useState<'Liked' | 'Playlists'>('Liked');
  const [sortOrder, setSortOrder] = useState<'Recently Added' | 'Title A-Z' | 'Most Liked'>('Recently Added');

  const cycleSortOrder = () => {
    if (sortOrder === 'Recently Added') setSortOrder('Title A-Z');
    else if (sortOrder === 'Title A-Z') setSortOrder('Most Liked');
    else setSortOrder('Recently Added');
  };

  // Filter based on subcategory
  let filteredTracks = [...tracks];
  if (selectedSubCategory === 'Liked') {
    filteredTracks = tracks.filter(t => t.isLiked);
  }

  const sortedTracks = filteredTracks.sort((a, b) => {
    if (sortOrder === 'Title A-Z') {
      return a.title.localeCompare(b.title);
    } else if (sortOrder === 'Most Liked') {
      return (b.isLiked ? 1 : 0) - (a.isLiked ? 1 : 0);
    }
    return 0;
  });

  return (
    <div className="flex flex-col gap-5 pb-36 w-full max-w-md mx-auto px-6">
      {/* Subcategory Filter Pills: Liked, Playlists */}
      <div className="flex items-center gap-2 pt-2">
        {(['Liked', 'Playlists'] as const).map((category) => {
          const isSelected = selectedSubCategory === category;
          return (
            <button
              key={category}
              onClick={() => setSelectedSubCategory(category)}
              className={`flex-1 py-2.5 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer ${
                isSelected
                  ? 'bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 text-white shadow-md shadow-purple-200/50 scale-102'
                  : 'bg-white/70 hover:bg-white text-slate-700 border border-white/80 shadow-2xs backdrop-blur-md'
              }`}
            >
              {category === 'Liked' && '❤️ '}
              {category === 'Playlists' && '💿 '}
              {category}
            </button>
          );
        })}
      </div>

      {/* Library Title & Sort Row */}
      <div className="flex items-end justify-between pt-1">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {selectedSubCategory === 'Liked' ? 'Liked Songs' : 'Your Playlists'}
          </h2>
          <p className="text-xs font-semibold text-slate-500 mt-0.5">
            {sortedTracks.length} {sortedTracks.length === 1 ? 'track' : 'tracks'} available
          </p>
        </div>

        <button
          onClick={cycleSortOrder}
          className="flex items-center gap-1.5 text-xs font-bold text-purple-800 bg-white/70 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/90 shadow-2xs hover:bg-white active:scale-95 transition-all cursor-pointer"
        >
          <SlidersHorizontal size={13} />
          {sortOrder}
        </button>
      </div>

      {/* Track List Container Card */}
      {sortedTracks.length === 0 ? (
        <div className="rounded-3xl p-8 bg-white/70 backdrop-blur-2xl border border-white/90 text-center space-y-3 shadow-md">
          <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center mx-auto">
            {selectedSubCategory === 'Liked' && <Heart size={24} className="text-pink-500" />}
            {selectedSubCategory === 'Playlists' && <ListMusic size={24} className="text-purple-600" />}
          </div>
          <h4 className="text-sm font-bold text-slate-800">
            {selectedSubCategory === 'Liked' && 'No liked songs yet'}
            {selectedSubCategory === 'Playlists' && 'No playlists available'}
          </h4>
          <p className="text-xs text-slate-400">
            {selectedSubCategory === 'Liked' && 'Tap the heart icon on any song to add it here.'}
            {selectedSubCategory === 'Playlists' && 'Your curated collections and playlists will show up here.'}
          </p>
        </div>
      ) : (
        <div className="rounded-3xl p-3 bg-white/70 backdrop-blur-2xl border border-white/90 shadow-md divide-y divide-slate-100/60">
          {sortedTracks.map((track) => {
            const isCurrent = currentTrackId === track.id;
            return (
              <div
                key={track.id}
                className={`group flex items-center justify-between p-3 rounded-2xl transition-all duration-200 cursor-pointer ${
                  isCurrent
                    ? 'bg-purple-100/80 border border-purple-200/80 shadow-2xs'
                    : 'hover:bg-white/80'
                }`}
              >
                {/* Track Cover & Details */}
                <div
                  onClick={() => onPlayTrack(track)}
                  className="flex items-center gap-3.5 flex-1 min-w-0 pr-2"
                >
                  <div className="relative flex-none w-14 h-14 rounded-xl overflow-hidden shadow-2xs bg-slate-100">
                    <img
                      src={track.coverUrl}
                      alt={track.title}
                      onError={(e) => {
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80';
                      }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    {isCurrent && (
                      <div className="absolute inset-0 bg-purple-900/40 backdrop-blur-[1px] flex items-center justify-center">
                        <div className="flex items-end gap-0.5 h-4">
                          <span className="w-1 bg-white animate-bounce h-3 rounded-full" style={{ animationDelay: '0ms' }} />
                          <span className="w-1 bg-white animate-bounce h-4 rounded-full" style={{ animationDelay: '150ms' }} />
                          <span className="w-1 bg-white animate-bounce h-2 rounded-full" style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h3 className={`font-bold text-sm truncate ${
                        isCurrent ? 'text-purple-900 font-extrabold' : 'text-slate-900'
                      }`}>
                        {track.title}
                      </h3>
                      {track.id.startsWith('local-') && (
                        <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 flex-none">
                          Local
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-medium text-slate-500 truncate mt-0.5">
                      {track.artist}
                    </p>
                  </div>
                </div>

                {/* Duration & Options */}
                <div className="flex items-center gap-3 flex-none text-slate-500">
                  <span className="text-xs font-semibold tracking-tight text-purple-900/70">
                    {track.duration}
                  </span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleLike(track.id);
                    }}
                    className={`p-1.5 rounded-full hover:bg-slate-100 transition-colors ${
                      track.isLiked ? 'text-pink-500' : 'text-slate-400 hover:text-slate-600'
                    }`}
                    aria-label="Like track"
                  >
                    <Heart size={16} className={track.isLiked ? 'fill-pink-500' : ''} />
                  </button>

                  <button
                    onClick={(e) => e.stopPropagation()}
                    className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                    aria-label="More options"
                  >
                    <MoreVertical size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
