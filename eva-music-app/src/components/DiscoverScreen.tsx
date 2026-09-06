import React, { useState, useEffect } from 'react';
import { Search, Radio, Music, Play, Disc, Sparkles, Loader2, Dices, Flame, Zap, Heart } from 'lucide-react';
import { GenreCategory, Track } from '../types';
import { searchOnlineTracks } from '../services/musicApi';
import { SmoothInput } from './SmoothInput';

interface DiscoverScreenProps {
  categories?: GenreCategory[];
  tracks: Track[];
  onPlayTrack: (track: Track) => void;
  onSelectCategory?: (cat: GenreCategory) => void;
}

export const DiscoverScreen: React.FC<DiscoverScreenProps> = ({
  tracks,
  onPlayTrack,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [onlineResults, setOnlineResults] = useState<Track[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setOnlineResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(() => {
      searchOnlineTracks(searchQuery).then(results => {
        setOnlineResults(results);
        setIsSearching(false);
      });
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSpinRoulette = () => {
    if (tracks.length === 0) return;
    setIsSpinning(true);
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * tracks.length);
      const chosenTrack = tracks[randomIndex];
      setIsSpinning(false);
      if (chosenTrack) {
        onPlayTrack(chosenTrack);
      }
    }, 600);
  };

  const localFiltered = tracks.filter(t => 
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.genre.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const displayedResults = onlineResults.length > 0 ? onlineResults : localFiltered;

  return (
    <div className="flex flex-col gap-6 pb-36 w-full max-w-md mx-auto px-6">
      {/* Search Input Bar with Smooth Spring Caret */}
      <SmoothInput
        type="search"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search songs, artists, or lyrics..."
        icon={<Search size={18} className="text-slate-400" />}
        rightElement={
          searchQuery ? (
            <button
              onClick={() => setSearchQuery('')}
              className="text-xs font-semibold text-purple-600 hover:text-purple-800 cursor-pointer px-2 py-1 rounded-full hover:bg-purple-50 transition-colors"
            >
              Clear
            </button>
          ) : null
        }
        wrapperClassName="rounded-full py-3 px-4 bg-white/80 backdrop-blur-xl border border-white/90 shadow-2xs focus-within:ring-4 focus-within:ring-purple-400/20"
      />

      {/* Search Results overlay if searching */}
      {searchQuery ? (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-bold text-slate-900">Search Results</h2>
            {isSearching && (
              <span className="text-xs font-medium text-purple-600 flex items-center gap-1">
                <Loader2 size={13} className="animate-spin" /> Searching live catalog...
              </span>
            )}
          </div>
          {displayedResults.length === 0 && !isSearching ? (
            <p className="text-sm text-slate-500 py-8 text-center">No tracks found matching "{searchQuery}"</p>
          ) : (
            <div className="space-y-2">
              {displayedResults.map((track) => (
                <div
                  key={track.id}
                  onClick={() => onPlayTrack(track)}
                  className="flex items-center gap-3 p-2.5 rounded-2xl bg-white/70 backdrop-blur-xl border border-white/80 hover:bg-white transition-all cursor-pointer group shadow-2xs"
                >
                  <img
                    src={track.coverUrl}
                    alt={track.title}
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80';
                    }}
                    className="w-12 h-12 rounded-xl object-cover shadow-2xs bg-slate-100"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-sm text-slate-900 truncate">{track.title}</h4>
                    <p className="text-xs text-slate-500 truncate">{track.artist}</p>
                  </div>
                  <button className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-colors">
                    <Play size={14} className="fill-current ml-0.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Interactive Feature 1: Spin to Discover Roulette */}
          <div className="relative overflow-hidden rounded-3xl p-5 bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 text-white shadow-xl shadow-purple-300/30">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/15 rounded-full blur-2xl pointer-events-none" />
            
            <div className="relative z-10 flex items-center justify-between">
              <div className="space-y-1 max-w-[210px]">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/20 text-[10px] font-black uppercase tracking-wider backdrop-blur-md">
                  <Sparkles size={11} />
                  Beat Roulette
                </span>
                <h3 className="text-lg font-black tracking-tight leading-tight">Spin & Discover</h3>
                <p className="text-xs text-purple-100 font-medium">
                  Drop into a random explosive hit from the catalog
                </p>
              </div>

              <button
                onClick={handleSpinRoulette}
                disabled={isSpinning}
                className={`px-4 py-3 rounded-2xl bg-white text-purple-950 font-black text-xs shadow-lg hover:bg-purple-50 active:scale-95 transition-all flex items-center gap-2 cursor-pointer ${
                  isSpinning ? 'opacity-80 animate-pulse' : ''
                }`}
              >
                <Dices size={18} className={`text-purple-600 ${isSpinning ? 'animate-spin' : ''}`} />
                <span>{isSpinning ? 'Spinning...' : 'Spin Drop'}</span>
              </button>
            </div>
          </div>


        </>
      )}
    </div>
  );
};
