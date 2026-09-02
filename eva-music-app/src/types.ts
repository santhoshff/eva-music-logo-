export interface Track {
  id: string;
  title: string;
  artist: string;
  album?: string;
  duration: string; // e.g. "4:28"
  durationSeconds: number;
  coverUrl: string;
  genre: string;
  isLiked?: boolean;
  audioUrl?: string; // High quality audio stream
  fallbackAudioUrl?: string; // Secondary backup audio stream URL
  releaseYear?: string;
  plays?: string;
  lyrics?: string[];
}

export interface Playlist {
  id: string;
  title: string;
  subtitle: string;
  badge?: string;
  description: string;
  coverUrl: string;
  tracks: Track[];
  trackCount: number;
  color: string;
}

export interface Artist {
  id: string;
  name: string;
  handle: string;
  avatarUrl: string;
  coverUrl: string;
  monthlyListeners: string;
  followers: string;
  bio: string;
  topTracks: Track[];
  isFollowing?: boolean;
}

export interface GenreCategory {
  id: string;
  name: string;
  subtitle?: string;
  coverUrl: string;
  color: string;
  trackCount: number;
}

export type NavTab = 'home' | 'library' | 'discover' | 'settings';

export interface UserProfile {
  name: string;
  handle: string;
  email: string;
  avatarUrl: string;
  coverUrl: string;
  isPro: boolean;
  statusMood: string;
  statusEmoji: string;
  vibeArchetype: string;
  bio: string;
  anthemTrackId: string;
  socials: {
    instagram?: string;
    tiktok?: string;
    spotify?: string;
    discord?: string;
  };
  stats: {
    minutesStreamed: number;
    listeningStreakDays: number;
    topPercentile: string;
    topGenres: { genre: string; percentage: number; color: string }[];
    badges: { id: string; label: string; icon: string; description: string }[];
  };
}

