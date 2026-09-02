import React from 'react';
import { X, Play, Heart, Music, Shuffle } from 'lucide-react';
import { Playlist, Track, GenreCategory } from '../types';

interface PlaylistDetailModalProps {
  playlist: Playlist | GenreCategory | null;
  tracks: Track[];
  onClose: () => void;
  onPlayTrack: (track: Track) => void;
  onPlayAll: (tracks: Track[]) => void;
}

export const PlaylistDetailModal: React.FC<PlaylistDetailModalProps> = ({
  playlist,
  tracks,
  onClose,
  onPlayTrack,
  onPlayAll,
}) => {
  if (!playlist) return null;

  const isPlaylist = 'tracks' in playlist;
  const playlistTracks = isPlaylist
    ? (playlist as Playlist).tracks
    : tracks.filter(t => t.genre.toLowerCase().includes(playlist.name.toLowerCase()));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
      <div className="relative w-full max-w-md h-[85vh] max-h-[750px] rounded-[32px] bg-white/90 backdrop-blur-2xl border border-white/90 shadow-2xl overflow-hidden flex flex-col">
        {/* Banner */}
        <div className="relative h-52 w-full">
          <img src={playlist.coverUrl} alt={playlist.title || playlist.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent" />
          
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/40 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/60"
          >
            <X size={18} />
          </button>

          <div className="absolute bottom-4 left-6 right-6 flex items-end justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300">
                {(playlist as Playlist).subtitle || (playlist as GenreCategory).subtitle || 'Playlist'}
              </span>
              <h2 className="text-2xl font-extrabold text-white leading-tight">
                {(playlist as Playlist).title || (playlist as GenreCategory).name}
              </h2>
            </div>

            <button
              onClick={() => onPlayAll(playlistTracks)}
              className="w-12 h-12 rounded-full bg-purple-600 text-white flex items-center justify-center shadow-lg hover:bg-purple-700 active:scale-95 transition-all"
            >
              <Play size={20} className="fill-white ml-0.5" />
            </button>
          </div>
        </div>

        {/* Track List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {playlistTracks.map((track) => (
            <div
              key={track.id}
              onClick={() => onPlayTrack(track)}
              className="flex items-center gap-3 p-2.5 rounded-2xl bg-white/70 backdrop-blur-md border border-white/80 hover:bg-white transition-all cursor-pointer group"
            >
              <img src={track.coverUrl} alt={track.title} className="w-11 h-11 rounded-xl object-cover" />
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-xs text-slate-900 truncate">{track.title}</h4>
                <p className="text-[11px] text-slate-500 truncate">{track.artist}</p>
              </div>
              <span className="text-[11px] font-semibold text-slate-400">{track.duration}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
