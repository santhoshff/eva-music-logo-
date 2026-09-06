import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { HomeScreen } from './components/HomeScreen';
import { DiscoverScreen } from './components/DiscoverScreen';
import { LibraryScreen } from './components/LibraryScreen';
import { SettingsScreen } from './components/SettingsScreen';
import { MiniPlayer } from './components/MiniPlayer';
import { BottomNav } from './components/BottomNav';
import { FullPlayerModal } from './components/FullPlayerModal';
import { ArtistDetailModal } from './components/ArtistDetailModal';
import { PlaylistDetailModal } from './components/PlaylistDetailModal';
import { UserProfileModal } from './components/UserProfileModal';
import { SongInstallModal } from './components/SongInstallModal';

import { INITIAL_TRACKS, FEATURED_PLAYLISTS, POPULAR_ARTISTS, GENRE_CATEGORIES, getRandomizedTracks } from './data/musicData';
import { audioEngine } from './services/audioEngine';
import { fetchTopTrendingHits } from './services/musicApi';
import { evaBrainService } from './services/evaBrainService';
import { syncUserProfileToSupabase } from './services/supabaseClient';
import { apiToggleFavorite } from './services/backendApi';
import { NavTab, Track, Artist, Playlist, GenreCategory, UserProfile } from './types';

const LOCAL_STORAGE_KEY_INSTALLED = 'eva_installed_local_tracks';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  
  const [tracks, setTracks] = useState<Track[]>(() => {
    const baseTracks = getRandomizedTracks();
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_INSTALLED);
      if (saved) {
        const parsed: Track[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const merged = [...parsed, ...baseTracks];
          return merged.filter((t, idx, self) => idx === self.findIndex(s => s.id === t.id));
        }
      }
    } catch {
      // Ignore parse error
    }
    return baseTracks;
  });

  const [artists, setArtists] = useState<Artist[]>(POPULAR_ARTISTS);
  const [playlists] = useState<Playlist[]>(FEATURED_PLAYLISTS);
  const [categories] = useState<GenreCategory[]>(GENRE_CATEGORIES);

  // User Profile State (Gen Z Theme)
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: 'Samantha',
    handle: 'samantha_vibe',
    email: 'samantha@evamusic.app',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    coverUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
    isPro: true,
    statusMood: 'Vibing to Synthwave',
    statusEmoji: '🎧',
    vibeArchetype: 'Aesthetic Dreamer 🌌',
    bio: 'Music enthusiast, synthwave collector & lo-fi beat maker. Living in 4:20 AM audio frequencies 🎧✨',
    anthemTrackId: '1',
    socials: {
      instagram: 'samantha_vibe',
      tiktok: 'samantha_vibe',
      spotify: 'samantha_eva',
      discord: 'samantha#0001'
    },
    stats: {
      minutesStreamed: 48290,
      listeningStreakDays: 94,
      topPercentile: 'Top 0.5%',
      topGenres: [
        { genre: 'Lo-Fi Chill', percentage: 38, color: 'bg-purple-500' },
        { genre: 'Neon Synthwave', percentage: 27, color: 'bg-pink-500' },
        { genre: 'Hyperpop & Cyber', percentage: 20, color: 'bg-cyan-400' },
        { genre: 'Indie Acoustic', percentage: 15, color: 'bg-amber-400' }
      ],
      badges: [
        { id: '1', label: 'Synthwave Legend', icon: '🌌', description: 'Listened to 500+ hours of retro synth' },
        { id: '2', label: '94-Day Streak', icon: '🔥', description: 'Streamed music 94 consecutive days' },
        { id: '3', label: 'Night Owl Listener', icon: '🦉', description: 'Active listener from 1 AM - 5 AM' },
        { id: '4', label: 'Curator Supreme', icon: '💿', description: 'Created 15+ viral playlists' }
      ]
    }
  });

  // Active playing state
  const [currentTrackId, setCurrentTrackId] = useState<string | null>(INITIAL_TRACKS[0].id);
  const [playerState, setPlayerState] = useState(audioEngine.getState());

  // Modals
  const [isFullPlayerOpen, setIsFullPlayerOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | GenreCategory | null>(null);

  // Subscribe to Audio Engine state updates & fetch live trending hits
  useEffect(() => {
    // Load initial randomized track into engine
    const initialTrack = tracks[0] || INITIAL_TRACKS[0];
    audioEngine.loadTrack(initialTrack.id, initialTrack.audioUrl, initialTrack.durationSeconds);

    // Fetch live top trending hit songs tailored to user taste
    const primaryGenre = userProfile.stats.topGenres[0]?.genre;
    fetchTopTrendingHits(primaryGenre).then(liveHits => {
      if (liveHits && liveHits.length > 0) {
        setTracks(prev => {
          const merged = [...liveHits, ...prev];
          return merged.filter((t, index, self) => index === self.findIndex(s => s.id === t.id));
        });
      }
    });

    const unsubscribe = audioEngine.subscribe(() => {
      const state = audioEngine.getState();
      setPlayerState(state);
      if (state.currentTrackId) {
        setCurrentTrackId(state.currentTrackId);
      }
    });

    return () => unsubscribe();
  }, []);

  const currentTrack = tracks.find(t => t.id === currentTrackId) || tracks[0];

  // Track Playback Callbacks
  const handlePlayTrack = (track: Track) => {
    setTracks(prev => {
      if (!prev.some(t => t.id === track.id)) {
        return [track, ...prev];
      }
      return prev;
    });
    setCurrentTrackId(track.id);
    audioEngine.playTrack(track.id, track.audioUrl, track.durationSeconds, track.fallbackAudioUrl);
  };

  const handleTogglePlay = () => {
    audioEngine.togglePlay();
  };

  const handleNextTrack = () => {
    const currentIndex = tracks.findIndex(t => t.id === currentTrackId);
    const nextIndex = (currentIndex + 1) % tracks.length;
    handlePlayTrack(tracks[nextIndex]);
  };

  const handlePrevTrack = () => {
    const currentIndex = tracks.findIndex(t => t.id === currentTrackId);
    const prevIndex = (currentIndex - 1 + tracks.length) % tracks.length;
    handlePlayTrack(tracks[prevIndex]);
  };

  const handleToggleLike = (trackId: string) => {
    setTracks(prev =>
      prev.map(t => {
        if (t.id === trackId) {
          const nextLiked = !t.isLiked;
          apiToggleFavorite(t, nextLiked);
          evaBrainService.recordLike(t, nextLiked);
          return { ...t, isLiked: nextLiked };
        }
        return t;
      })
    );
  };

  const handleToggleFollowArtist = (artistId: string) => {
    setArtists(prev =>
      prev.map(a => (a.id === artistId ? { ...a, isFollowing: !a.isFollowing } : a))
    );
    if (selectedArtist && selectedArtist.id === artistId) {
      setSelectedArtist(prev => prev ? { ...prev, isFollowing: !prev.isFollowing } : null);
    }
  };

  const handlePlayAll = (trackList: Track[]) => {
    if (trackList.length > 0) {
      handlePlayTrack(trackList[0]);
    }
  };

  const handleInstallNewTracks = (newTracks: Track[]) => {
    setTracks(prev => {
      const merged = [...newTracks, ...prev];
      const unique = merged.filter((t, idx, self) => idx === self.findIndex(s => s.id === t.id));
      
      // Save local tracks to localStorage
      const localOnly = unique.filter(t => t.id.startsWith('local-'));
      if (localOnly.length > 0) {
        try {
          localStorage.setItem(LOCAL_STORAGE_KEY_INSTALLED, JSON.stringify(localOnly));
        } catch {
          // localStorage error handling
        }
      }
      return unique;
    });
  };

  return (
    <div className="relative min-h-screen w-full bg-[#fcf8ff] text-slate-900 font-sans selection:bg-purple-200 antialiased overflow-x-hidden">
      {/* Ambient Glassmorphism Gradient Background Lights */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[450px] h-[450px] rounded-full bg-gradient-to-br from-purple-300/40 via-fuchsia-200/30 to-transparent blur-3xl" />
        <div className="absolute top-[20%] right-[-15%] w-[400px] h-[400px] rounded-full bg-gradient-to-bl from-pink-200/40 via-purple-200/30 to-transparent blur-3xl" />
        <div className="absolute bottom-[-10%] left-[20%] w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-indigo-200/40 via-sky-100/30 to-transparent blur-3xl" />
      </div>

      {/* Main Container */}
      <div className="relative z-10 min-h-screen flex flex-col justify-between max-w-md mx-auto">
        {/* Top Header */}
        <Header
          userName={userProfile.name}
          userAvatarUrl={userProfile.avatarUrl}
          onOpenSearch={() => setActiveTab('discover')}
          onOpenFavorites={() => setActiveTab('library')}
          onOpenProfile={() => setIsProfileOpen(true)}
          title={activeTab === 'discover' ? 'Discover' : activeTab === 'library' ? 'EVA MUSIC' : undefined}
        />

        {/* Tab Content */}
        <main className="flex-1 mt-3">
          {activeTab === 'home' && (
            <HomeScreen
              tracks={tracks}
              playlists={playlists}
              artists={artists}
              currentTrackId={currentTrackId}
              isPlaying={playerState.isPlaying}
              onPlayTrack={handlePlayTrack}
              onPlayPlaylist={setSelectedPlaylist}
              onSelectArtist={setSelectedArtist}
              onToggleLike={handleToggleLike}
              onNavigateToDiscover={() => setActiveTab('discover')}
            />
          )}

          {activeTab === 'discover' && (
            <DiscoverScreen
              categories={categories}
              tracks={tracks}
              onPlayTrack={handlePlayTrack}
              onSelectCategory={setSelectedPlaylist}
            />
          )}

          {activeTab === 'library' && (
            <LibraryScreen
              tracks={tracks}
              currentTrackId={currentTrackId}
              isPlaying={playerState.isPlaying}
              onPlayTrack={handlePlayTrack}
              onToggleLike={handleToggleLike}
              onOpenInstallModal={() => setIsInstallModalOpen(true)}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsScreen
              profile={userProfile}
              onOpenProfile={() => setIsProfileOpen(true)}
            />
          )}
        </main>

        {/* Floating Mini Player (Always visible when a track is loaded) */}
        <MiniPlayer
          currentTrack={currentTrack}
          isPlaying={playerState.isPlaying}
          currentTime={playerState.currentTime}
          duration={playerState.duration}
          onTogglePlay={handleTogglePlay}
          onNextTrack={handleNextTrack}
          onToggleLike={handleToggleLike}
          onOpenFullPlayer={() => setIsFullPlayerOpen(true)}
        />

        {/* Floating Dock Bottom Navigation */}
        <BottomNav
          activeTab={activeTab}
          onSelectTab={(tab) => {
            setActiveTab(tab);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />

        {/* Full Expanded Audio Player Modal */}
        <FullPlayerModal
          isOpen={isFullPlayerOpen}
          onClose={() => setIsFullPlayerOpen(false)}
          currentTrack={currentTrack}
          queue={tracks}
          isPlaying={playerState.isPlaying}
          currentTime={playerState.currentTime}
          duration={playerState.duration}
          volume={playerState.volume}
          isMuted={playerState.isMuted}
          isShuffle={playerState.isShuffle}
          repeatMode={playerState.repeatMode}
          onTogglePlay={handleTogglePlay}
          onNextTrack={handleNextTrack}
          onPrevTrack={handlePrevTrack}
          onSeek={(secs) => audioEngine.seek(secs)}
          onVolumeChange={(vol) => audioEngine.setVolume(vol)}
          onToggleMute={() => audioEngine.toggleMute()}
          onToggleShuffle={() => audioEngine.toggleShuffle()}
          onToggleRepeat={() => audioEngine.toggleRepeat()}
          onToggleLike={handleToggleLike}
          onSelectQueueTrack={handlePlayTrack}
        />

        {/* Gen Z User Profile Modal */}
        <UserProfileModal
          isOpen={isProfileOpen}
          onClose={() => setIsProfileOpen(false)}
          profile={userProfile}
          onUpdateProfile={(updated) => setUserProfile(updated)}
          allTracks={tracks}
          onPlayTrack={handlePlayTrack}
          isPlaying={playerState.isPlaying}
          currentTrackId={currentTrackId}
        />

        {/* Song Install / Import Modal */}
        <SongInstallModal
          isOpen={isInstallModalOpen}
          onClose={() => setIsInstallModalOpen(false)}
          onInstallTracks={handleInstallNewTracks}
          existingTracks={tracks}
        />

        {/* Artist Profile Detail Modal */}
        <ArtistDetailModal
          artist={selectedArtist}
          onClose={() => setSelectedArtist(null)}
          onPlayTrack={handlePlayTrack}
          onToggleFollow={handleToggleFollowArtist}
          currentTrackId={currentTrackId}
          isPlaying={playerState.isPlaying}
        />

        {/* Playlist / Genre Detail Modal */}
        <PlaylistDetailModal
          playlist={selectedPlaylist}
          tracks={tracks}
          onClose={() => setSelectedPlaylist(null)}
          onPlayTrack={handlePlayTrack}
          onPlayAll={handlePlayAll}
        />
      </div>
    </div>
  );
}
