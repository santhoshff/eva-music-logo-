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
import { LoginScreen } from './components/LoginScreen';

import { INITIAL_TRACKS, FEATURED_PLAYLISTS, POPULAR_ARTISTS, GENRE_CATEGORIES, getRandomizedTracks } from './data/musicData';
import { audioEngine } from './services/audioEngine';
import { fetchTopTrendingHits } from './services/musicApi';
import { evaBrainService } from './services/evaBrainService';
import { 
  syncUserProfileToSupabase, 
  supabase, 
  saveUserFavorite, 
  fetchUserFavoriteTrackIds,
  fetchUserLibraryData,
  saveUserLibraryData
} from './services/supabaseClient';
import { apiToggleFavorite } from './services/backendApi';
import { NavTab, Track, Artist, Playlist, GenreCategory, UserProfile } from './types';

const DEFAULT_GUEST_PROFILE: UserProfile = {
  name: 'Guest Listener',
  handle: '@guest',
  email: 'guest@evamusic.app',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
  coverUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
  isPro: false,
  statusMood: 'Exploring Music',
  statusEmoji: '🎧',
  vibeArchetype: 'Aesthetic Explorer 🌌',
  bio: 'Sign in with your Gmail to sync your personal liked songs, custom playlists, and listening history.',
  anthemTrackId: '1',
  socials: {},
  stats: {
    minutesStreamed: 0,
    listeningStreakDays: 1,
    topPercentile: 'Guest Explorer',
    topGenres: [
      { genre: 'Tamil Mass Hits', percentage: 50, color: 'bg-purple-500' },
      { genre: 'Tamil Melodies', percentage: 30, color: 'bg-pink-500' },
      { genre: 'Pop & Synth', percentage: 20, color: 'bg-cyan-400' },
    ],
    badges: [
      { id: '1', label: 'Music Explorer', icon: '🌌', description: 'Started your listening journey' },
    ],
  },
};

const buildUserProfile = (user: any): UserProfile => {
  const displayName =
    user.user_metadata?.name ||
    user.user_metadata?.full_name ||
    user.email?.split('@')[0] ||
    'Member';
  const cleanHandle =
    '@' +
    (user.email
      ? user.email.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '')
      : 'listener');
  const avatar =
    user.user_metadata?.avatar_url ||
    user.user_metadata?.picture ||
    `https://api.dicebear.com/7.x/bottts/svg?seed=${user.id}`;

  return {
    name: displayName,
    handle: cleanHandle,
    email: user.email || 'user@evamusic.app',
    avatarUrl: avatar,
    coverUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
    isPro: true,
    statusMood: 'Personal Library Active',
    statusEmoji: '✨',
    vibeArchetype: 'Cosmic Curator 🎵',
    bio: `Personal music library active • Connected via ${user.email}`,
    anthemTrackId: '1',
    socials: {},
    stats: {
      minutesStreamed: 0,
      listeningStreakDays: 1,
      topPercentile: 'Top Curator',
      topGenres: [
        { genre: 'Your Favorites', percentage: 100, color: 'bg-purple-500' }
      ],
      badges: [
        { id: '1', label: 'Cloud Member', icon: '☁️', description: 'Personal storage connected with Supabase Cloud' },
      ],
    },
  };
};

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  // Track State
  const [tracks, setTracks] = useState<Track[]>(() => getRandomizedTracks().map(t => ({ ...t, isLiked: false })));
  const [artists, setArtists] = useState<Artist[]>(POPULAR_ARTISTS);
  const [playlists] = useState<Playlist[]>(FEATURED_PLAYLISTS);
  const [categories] = useState<GenreCategory[]>(GENRE_CATEGORIES);

  // User Profile State (Dynamic per account)
  const [userProfile, setUserProfile] = useState<UserProfile>(DEFAULT_GUEST_PROFILE);

  // Modals & Screens
  const [isFullPlayerOpen, setIsFullPlayerOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | GenreCategory | null>(null);

  // Active Audio State
  const [currentTrackId, setCurrentTrackId] = useState<string | null>(INITIAL_TRACKS[0].id);
  const [playerState, setPlayerState] = useState(audioEngine.getState());

  // Helper: Retrieve currently active liked IDs across storage
  const getActiveLikedIds = (email?: string, id?: string): string[] => {
    const cleanEmail = (email || currentUser?.email || localStorage.getItem('eva_active_user_email') || '').toLowerCase().trim();
    const userId = id || currentUser?.id || localStorage.getItem('eva_active_user_id') || '';

    if (cleanEmail || userId) {
      const emailKey = cleanEmail ? `eva_user_${cleanEmail}_likes` : '';
      const idKey = userId ? `eva_user_${userId}_likes` : '';
      const raw = (emailKey && localStorage.getItem(emailKey)) || (idKey && localStorage.getItem(idKey));
      if (raw) {
        try { return JSON.parse(raw); } catch {}
      }
      return [];
    }

    const guestRaw = localStorage.getItem('eva_guest_likes');
    if (guestRaw) {
      try { return JSON.parse(guestRaw); } catch {}
    }
    return [];
  };

  // Helper: Load library partitioned strictly to the user
  const loadUserLibrary = async (user: any | null) => {
    if (user) {
      const cleanEmail = (user?.email || localStorage.getItem('eva_active_user_email') || '').toLowerCase().trim();
      const userId = user?.id || localStorage.getItem('eva_active_user_id') || '';

      // Persist active user session markers
      if (cleanEmail) localStorage.setItem('eva_active_user_email', cleanEmail);
      if (userId) localStorage.setItem('eva_active_user_id', userId);

      // Storage keys for both email and id (dual-layer)
      const emailLikesKey = cleanEmail ? `eva_user_${cleanEmail}_likes` : '';
      const idLikesKey = userId ? `eva_user_${userId}_likes` : '';
      const emailTracksKey = cleanEmail ? `eva_user_${cleanEmail}_tracks` : '';
      const idTracksKey = userId ? `eva_user_${userId}_tracks` : '';

      // 1. FAST ZERO-LATENCY HYDRATION (Instant from localStorage)
      let cachedLikedIds: string[] | null = null;
      let cachedLikedTracks: Track[] = [];

      try {
        const rawLikes = (emailLikesKey && localStorage.getItem(emailLikesKey)) || (idLikesKey && localStorage.getItem(idLikesKey));
        if (rawLikes) cachedLikedIds = JSON.parse(rawLikes);

        const rawTracks = (emailTracksKey && localStorage.getItem(emailTracksKey)) || (idTracksKey && localStorage.getItem(idTracksKey));
        if (rawTracks) cachedLikedTracks = JSON.parse(rawTracks);
      } catch (e) {
        console.warn('Local cache read note:', e);
      }

      // Check user-installed custom tracks
      const installedKey = cleanEmail ? `eva_user_${cleanEmail}_installed` : `eva_user_${userId}_installed`;
      let userInstalled: Track[] = [];
      try {
        const rawInstalled = localStorage.getItem(installedKey);
        if (rawInstalled) userInstalled = JSON.parse(rawInstalled);
      } catch {}

      // If cached data exists for this user, apply it immediately
      if (cachedLikedIds !== null) {
        const currentLikedIds = cachedLikedIds;
        setTracks((prev) => {
          const merged = [...cachedLikedTracks, ...userInstalled, ...prev];
          const unique = merged.filter((t, idx, self) => idx === self.findIndex((s) => s.id === t.id));
          return unique.map((t) => ({
            ...t,
            isLiked: currentLikedIds.includes(t.id),
          }));
        });
      } else {
        // New account with no prior history: clean slate (0 liked songs)
        setTracks((prev) => {
          const merged = [...userInstalled, ...prev];
          const unique = merged.filter((t, idx, self) => idx === self.findIndex((s) => s.id === t.id));
          return unique.map((t) => ({
            ...t,
            isLiked: false,
          }));
        });
      }

      // 2. ASYNCHRONOUS SUPABASE CLOUD SYNC
      try {
        const { likedIds: cloudIds, likedTracks: cloudTracks } = await fetchUserLibraryData(userId, cleanEmail);

        if (cloudIds.length > 0 || cloudTracks.length > 0 || cachedLikedIds !== null) {
          const mergedLikedIds = Array.from(new Set([...(cachedLikedIds || []), ...cloudIds]));
          
          // Merge rich track metadata
          const trackMap = new Map<string, Track>();
          cachedLikedTracks.forEach((t) => trackMap.set(t.id, t));
          cloudTracks.forEach((t) => trackMap.set(t.id, t));
          const finalLikedTracks = Array.from(trackMap.values());

          // Write back to both keys in localStorage
          if (emailLikesKey) {
            localStorage.setItem(emailLikesKey, JSON.stringify(mergedLikedIds));
            localStorage.setItem(emailTracksKey, JSON.stringify(finalLikedTracks));
          }
          if (idLikesKey) {
            localStorage.setItem(idLikesKey, JSON.stringify(mergedLikedIds));
            localStorage.setItem(idTracksKey, JSON.stringify(finalLikedTracks));
          }

          // Update React state
          setTracks((prev) => {
            const merged = [...finalLikedTracks, ...userInstalled, ...prev];
            const unique = merged.filter((t, idx, self) => idx === self.findIndex((s) => s.id === t.id));
            return unique.map((t) => ({
              ...t,
              isLiked: mergedLikedIds.includes(t.id),
            }));
          });
        }
      } catch (err) {
        console.warn('[Supabase] Library sync warning:', err);
      }
    } else {
      // Guest mode: clean slate (0 liked songs unless guest specifically liked tracks in this session)
      const guestCache = localStorage.getItem('eva_guest_likes');
      let guestIds: string[] = [];
      if (guestCache) {
        try {
          guestIds = JSON.parse(guestCache);
        } catch {}
      }
      setTracks((prev) =>
        prev.map((t) => ({
          ...t,
          isLiked: guestIds.includes(t.id),
        }))
      );
    }
  };

  // Supabase Auth session listener
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const user = session?.user || null;
      setCurrentUser(user);
      if (user) {
        const cleanEmail = (user.email || '').toLowerCase().trim();
        if (cleanEmail) localStorage.setItem('eva_active_user_email', cleanEmail);
        if (user.id) localStorage.setItem('eva_active_user_id', user.id);
        setUserProfile(buildUserProfile(user));
        loadUserLibrary(user);
      } else {
        setUserProfile(DEFAULT_GUEST_PROFILE);
        loadUserLibrary(null);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user || null;
      setCurrentUser(user);
      if (user) {
        const cleanEmail = (user.email || '').toLowerCase().trim();
        if (cleanEmail) localStorage.setItem('eva_active_user_email', cleanEmail);
        if (user.id) localStorage.setItem('eva_active_user_id', user.id);
        setUserProfile(buildUserProfile(user));
        loadUserLibrary(user);
      } else {
        setUserProfile(DEFAULT_GUEST_PROFILE);
        loadUserLibrary(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Subscribe to Audio Engine state updates & fetch live trending hits
  useEffect(() => {
    // Load initial randomized track into engine
    const initialTrack = tracks[0] || INITIAL_TRACKS[0];
    audioEngine.loadTrack(initialTrack.id, initialTrack.audioUrl, initialTrack.durationSeconds);

    // Fetch live top trending hit songs tailored to user taste
    const primaryGenre = userProfile.stats.topGenres[0]?.genre;
    fetchTopTrendingHits(primaryGenre).then(liveHits => {
      if (liveHits && liveHits.length > 0) {
        const likedIds = getActiveLikedIds();
        setTracks(prev => {
          const merged = [...liveHits, ...prev];
          const unique = merged.filter((t, index, self) => index === self.findIndex(s => s.id === t.id));
          return unique.map(t => ({
            ...t,
            isLiked: likedIds.includes(t.id),
          }));
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
    // Identify active user credentials from state or localStorage
    const activeEmail = (currentUser?.email || localStorage.getItem('eva_active_user_email') || '').toLowerCase().trim();
    const activeUserId = currentUser?.id || localStorage.getItem('eva_active_user_id') || '';
    const isLoggedIn = Boolean(currentUser || activeEmail || activeUserId);

    setTracks(prev => {
      const target = prev.find(t => t.id === trackId);
      if (!target) return prev;

      const nextLiked = !target.isLiked;
      const updatedTrack: Track = { ...target, isLiked: nextLiked };

      // 1. Sync to backend & EVA Brain
      apiToggleFavorite(target, nextLiked);
      evaBrainService.recordLike(target, nextLiked);

      // 2. Per-user isolated storage
      if (isLoggedIn) {
        const emailLikesKey = activeEmail ? `eva_user_${activeEmail}_likes` : '';
        const idLikesKey = activeUserId ? `eva_user_${activeUserId}_likes` : '';
        const emailTracksKey = activeEmail ? `eva_user_${activeEmail}_tracks` : '';
        const idTracksKey = activeUserId ? `eva_user_${activeUserId}_tracks` : '';

        // Read current cache
        const rawLikes = (emailLikesKey && localStorage.getItem(emailLikesKey)) || (idLikesKey && localStorage.getItem(idLikesKey));
        const rawTracks = (emailTracksKey && localStorage.getItem(emailTracksKey)) || (idTracksKey && localStorage.getItem(idTracksKey));

        const curLikes: string[] = rawLikes ? JSON.parse(rawLikes) : [];
        const curTracks: Track[] = rawTracks ? JSON.parse(rawTracks) : [];

        // Update list of IDs
        const nextLikes = nextLiked
          ? Array.from(new Set([...curLikes, trackId]))
          : curLikes.filter(id => id !== trackId);

        // Update list of rich Track objects
        const nextTracks = nextLiked
          ? Array.from(new Map([...curTracks, updatedTrack].map(t => [t.id, t])).values())
          : curTracks.filter(t => t.id !== trackId);

        // Save immediately to localStorage for fast access
        if (emailLikesKey) {
          localStorage.setItem(emailLikesKey, JSON.stringify(nextLikes));
          localStorage.setItem(emailTracksKey, JSON.stringify(nextTracks));
        }
        if (idLikesKey) {
          localStorage.setItem(idLikesKey, JSON.stringify(nextLikes));
          localStorage.setItem(idTracksKey, JSON.stringify(nextTracks));
        }

        // Save to Supabase Cloud in background
        saveUserLibraryData(activeUserId, activeEmail, nextLikes, nextTracks, userProfile);
      } else {
        // Guest mode storage
        try {
          const guestKey = 'eva_guest_likes';
          const raw = localStorage.getItem(guestKey);
          const cur: string[] = raw ? JSON.parse(raw) : [];
          const next = nextLiked ? Array.from(new Set([...cur, trackId])) : cur.filter(id => id !== trackId);
          localStorage.setItem(guestKey, JSON.stringify(next));
        } catch {}
      }

      return prev.map(t => (t.id === trackId ? updatedTrack : t));
    });
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
    const activeEmail = (currentUser?.email || localStorage.getItem('eva_active_user_email') || '').toLowerCase().trim();
    const activeUserId = currentUser?.id || localStorage.getItem('eva_active_user_id') || '';

    setTracks(prev => {
      const merged = [...newTracks, ...prev];
      const unique = merged.filter((t, idx, self) => idx === self.findIndex(s => s.id === t.id));
      
      // Save local tracks to per-user storage
      const localOnly = unique.filter(t => t.id.startsWith('local-'));
      if (localOnly.length > 0) {
        try {
          const storageKey = activeEmail
            ? `eva_user_${activeEmail}_installed`
            : activeUserId
            ? `eva_user_${activeUserId}_installed`
            : 'eva_guest_installed';
          localStorage.setItem(storageKey, JSON.stringify(localOnly));
        } catch {
          // localStorage error handling
        }
      }
      return unique;
    });
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch {}
    localStorage.removeItem('eva_active_user_email');
    localStorage.removeItem('eva_active_user_id');
    setCurrentUser(null);
    setUserProfile(DEFAULT_GUEST_PROFILE);
    loadUserLibrary(null);
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
              currentUser={currentUser}
              onOpenProfile={() => setIsProfileOpen(true)}
              onOpenLogin={() => setIsLoginOpen(true)}
              onLogout={handleLogout}
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

        {/* Dedicated Full-Screen Login / Sign-Up Page */}
        {isLoginOpen && (
          <div className="fixed inset-0 z-[100] bg-[#fcf8ff] overflow-y-auto animate-fade-in">
            <LoginScreen
              onBack={() => setIsLoginOpen(false)}
              onLoginSuccess={(user) => {
                setCurrentUser(user);
                if (user) {
                  const cleanEmail = (user.email || '').toLowerCase().trim();
                  if (cleanEmail) localStorage.setItem('eva_active_user_email', cleanEmail);
                  if (user.id) localStorage.setItem('eva_active_user_id', user.id);
                  setUserProfile(buildUserProfile(user));
                  loadUserLibrary(user);
                }
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
