import React from 'react';
import { X, Play, Heart, UserPlus, UserCheck, Music2 } from 'lucide-react';
import { Artist, Track } from '../types';

interface ArtistDetailModalProps {
  artist: Artist | null;
  onClose: () => void;
  onPlayTrack: (track: Track) => void;
  onToggleFollow: (artistId: string) => void;
}

export const ArtistDetailModal: React.FC<ArtistDetailModalProps> = ({
  artist,
  onClose,
  onPlayTrack,
  onToggleFollow,
}) => {
  if (!artist) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
      <div className="relative w-full max-w-md h-[85vh] max-h-[750px] rounded-[32px] bg-white/90 backdrop-blur-2xl border border-white/90 shadow-2xl overflow-hidden flex flex-col">
        {/* Banner */}
        <div className="relative h-56 w-full">
          <img src={artist.coverUrl} alt={artist.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent" />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/40 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/60"
          >
            <X size={18} />
          </button>

          <div className="absolute bottom-4 left-6 right-6 flex items-end justify-between">
            <div className="flex items-center gap-3">
              <img
                src={artist.avatarUrl}
                alt={artist.name}
                className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-md"
              />
              <div>
                <h2 className="text-2xl font-extrabold text-white leading-tight">{artist.name}</h2>
                <p className="text-xs text-purple-200 font-medium">{artist.monthlyListeners} monthly listeners</p>
              </div>
            </div>

            <button
              onClick={() => onToggleFollow(artist.id)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                artist.isFollowing
                  ? 'bg-white/20 text-white backdrop-blur-md border border-white/40'
                  : 'bg-purple-600 text-white shadow-md hover:bg-purple-700'
              }`}
            >
              {artist.isFollowing ? 'Following' : 'Follow'}
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          <div>
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-purple-900/60 mb-1.5">
              About
            </h3>
            <p className="text-xs font-medium text-slate-600 leading-relaxed">{artist.bio}</p>
          </div>

          <div>
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-purple-900/60 mb-3">
              Popular Tracks
            </h3>
            <div className="space-y-2">
              {artist.topTracks.map((track) => (
                <div
                  key={track.id}
                  onClick={() => onPlayTrack(track)}
                  className="flex items-center gap-3 p-2.5 rounded-2xl bg-white/70 backdrop-blur-md border border-white/80 hover:bg-white transition-all cursor-pointer group"
                >
                  <img src={track.coverUrl} alt={track.title} className="w-11 h-11 rounded-xl object-cover" />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-xs text-slate-900 truncate">{track.title}</h4>
                    <p className="text-[11px] text-slate-500 truncate">{track.plays} plays</p>
                  </div>
                  <button className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-colors">
                    <Play size={14} className="fill-current ml-0.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
