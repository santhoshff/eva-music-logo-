import React, { useState, useEffect } from 'react';
import { Search, Radio, Music, Play, Disc, Sparkles, Loader2, Dices, Flame, Zap, Heart } from 'lucide-react';
import { GenreCategory, Track } from '../types';
import { searchOnlineTracks } from '../services/musicApi';

interface DiscoverScreenProps {
  categories: GenreCategory[];
  tracks: Track[];
  onPlayTrack: (track: Track) => void;
  onSelectCategory: (cat: GenreCategory) => void;
}

export const DiscoverScreen: React.FC<DiscoverScreenProps> = ({
  categories,
  tracks,
  onPlayTrack,
  onSelectCategory,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [onlineResults, setOnlineResults] = useState<Track[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedGenreFilter, setSelectedGenreFilter] = useState('All');

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

  const genreFilters = ['All', 'Tamil', 'Pop', 'Bollywood', 'Lo-Fi', 'South'];

  const filteredCategories = categories.filter(cat => {
    if (selectedGenreFilter === 'All') return true;
    return cat.name.toLowerCase().includes(selectedGenreFilter.toLowerCase());
  });

  const localFiltered = tracks.filter(t => 
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.genre.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const displayedResults = onlineResults.length > 0 ? onlineResults : localFiltered;

  return (
    <div className="flex flex-col gap-6 pb-36 w-full max-w-md mx-auto px-6">
      {/* Search Input Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400">
          <Search size={18} />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search songs, artists, or lyrics..."
          className="w-full pl-11 pr-4 py-3.5 rounded-full bg-white/70 backdrop-blur-xl border border-white/90 shadow-2xs text-slate-900 placeholder:text-slate-400 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-400 focus:bg-white transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute inset-y-0 right-4 flex items-center text-xs font-semibold text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            Clear
          </button>
        )}
      </div>

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

          {/* Interactive Genre Filter Bar */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                Explore Soundscapes
              </h2>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar mb-3">
              {genreFilters.map((gf) => {
                const isSelected = selectedGenreFilter === gf;
                return (
                  <button
                    key={gf}
                    onClick={() => setSelectedGenreFilter(gf)}
                    className={`py-2 px-3.5 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                      isSelected
                        ? 'bg-purple-600 text-white shadow-md shadow-purple-200'
                        : 'bg-white/70 text-slate-700 hover:bg-white border border-white/80 backdrop-blur-md'
                    }`}
                  >
                    {gf === 'All' ? '🔥 All Genres' : gf}
                  </button>
                );
              })}
            </div>

            {/* Interactive Soundscape Grid */}
            <div className="grid grid-cols-2 gap-3.5">
              {filteredCategories.map((cat, index) => {
                const defaultGradients = [
                  'from-purple-600 via-indigo-700 to-slate-950',
                  'from-rose-600 via-red-700 to-amber-950',
                  'from-teal-500 via-emerald-700 to-slate-950',
                  'from-pink-600 via-rose-700 to-purple-950',
                  'from-blue-600 via-indigo-800 to-slate-950',
                ];
                const gradient = cat.color?.includes('from-')
                  ? cat.color
                  : defaultGradients[index % defaultGradients.length];

                return (
                  <div
                    key={cat.id}
                    onClick={() => onSelectCategory(cat)}
                    className={`relative rounded-3xl overflow-hidden shadow-lg group cursor-pointer border border-white/20 bg-gradient-to-br ${gradient} p-4 flex flex-col justify-between transition-all duration-300 hover:scale-[1.02] active:scale-95 ${
                      index === 4 && filteredCategories.length % 2 !== 0 ? 'col-span-2 h-36' : 'h-40'
                    }`}
                  >
                    {/* Top Badge & Play Action */}
                    <div className="relative z-10 flex items-center justify-between">
                      <span className="text-[10px] font-extrabold uppercase tracking-widest text-white/90 bg-white/15 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10">
                        {cat.trackCount ? `${cat.trackCount} Tracks` : 'Curated'}
                      </span>
                      <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white group-hover:bg-white group-hover:text-slate-900 transition-colors shadow-xs">
                        <Play size={13} className="fill-current ml-0.5" />
                      </div>
                    </div>

                    {/* Text Content */}
                    <div className="relative z-10 space-y-0.5">
                      <p className="text-[11px] font-semibold text-white/80 line-clamp-1">
                        {cat.subtitle}
                      </p>
                      <h3 className="text-base font-black text-white leading-tight tracking-tight">
                        {cat.name}
                      </h3>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
