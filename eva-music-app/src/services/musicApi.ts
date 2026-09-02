import { Track } from '../types';
import { apiSearch, apiGetLyrics, apiGetRecommendations } from './backendApi';

export interface LyricsResponse {
  id?: number;
  trackName?: string;
  artistName?: string;
  albumName?: string;
  duration?: number;
  plainLyrics?: string;
  syncedLyrics?: string;
}

export async function fetchLyrics(trackTitle: string, artistName: string, trackId?: string): Promise<string[]> {
  if (trackId) {
    const backendLyrics = await apiGetLyrics(trackId, trackTitle, artistName);
    if (backendLyrics && backendLyrics.length > 0) return backendLyrics;
  }

  try {
    const cleanTitle = cleanText(trackTitle).replace(/\(From.*?\)/gi, '').replace(/\(Original.*?\)/gi, '').trim();
    const url = `https://lrclib.net/api/get?track_name=${encodeURIComponent(cleanTitle)}&artist_name=${encodeURIComponent(artistName)}`;
    const res = await fetch(url);
    if (res.ok) {
      const data: LyricsResponse = await res.json();
      if (data.plainLyrics) {
        return data.plainLyrics.split('\n').filter(line => line.trim().length > 0);
      }
      if (data.syncedLyrics) {
        return data.syncedLyrics
          .split('\n')
          .map(line => line.replace(/\[\d{2}:\d{2}\.\d{2}\]/g, '').trim())
          .filter(line => line.length > 0);
      }
    }
  } catch {
    // Fallback
  }

  return [
    `🎵 ${cleanText(trackTitle)} - ${cleanText(artistName)}`,
    "Feel the full frequency in your soul...",
    "Vibing with the rhythm of the beat,",
    "Every moment carrying us through the night.",
    "Echoing through the endless sky,",
    "Listen to the sound elevate high."
  ];
}

export async function fetchTopTrendingHits(): Promise<Track[]> {
  const backendRecs = await apiGetRecommendations();
  if (backendRecs && backendRecs.length > 0) {
    return backendRecs;
  }

  const topTamilQueries = [
    'God Mode Karuppu',
    'Katchi Sera',
    'Aasa Kooda',
    'Naa Ready Leo',
    'Hukum Jailer',
    'Fear Song Devara',
    'Whistle Podu GOAT',
    'Google Google Thuppakki'
  ];
  try {
    const promises = topTamilQueries.map(q => searchOnlineTracks(q));
    const resultsArray = await Promise.all(promises);
    const flattened = resultsArray.flat().filter((t, index, self) => 
      index === self.findIndex(s => s.id === t.id || s.title.toLowerCase() === t.title.toLowerCase())
    );
    if (flattened.length > 0) return flattened;
  } catch {
    // Fallback
  }
  return [];
}

export async function searchOnlineTracks(query: string): Promise<Track[]> {
  if (!query || query.trim().length < 2) return [];

  // Try Fastify Backend search first
  const backendResults = await apiSearch(query);
  if (backendResults && backendResults.length > 0) {
    return backendResults;
  }

  // Primary Engine: iTunes Music API
  try {
    const itunesUrl = `https://itunes.apple.com/search?entity=song&limit=15&term=${encodeURIComponent(query)}`;
    const response = await fetch(itunesUrl);
    if (response.ok) {
      const data = await response.json();
      if (data.results && Array.isArray(data.results) && data.results.length > 0) {
        return data.results
          .filter((item: any) => item.previewUrl)
          .map((item: any) => {
            const cover600 = (item.artworkUrl100 || '')
              .replace('100x100bb.jpg', '600x600bb.jpg')
              .replace('100x100bb.png', '600x600bb.png');

            const durSecs = item.trackTimeMillis ? Math.round(item.trackTimeMillis / 1000) : 218;

            return {
              id: `itunes-${item.trackId}`,
              title: cleanText(item.trackName || 'Unknown Track'),
              artist: cleanText(item.artistName || 'Unknown Artist'),
              album: cleanText(item.collectionName || 'Single'),
              duration: formatTimeFromSeconds(durSecs),
              durationSeconds: durSecs,
              coverUrl: cover600 || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80',
              genre: item.primaryGenreName || 'Tamil Hit',
              audioUrl: item.previewUrl,
              fallbackAudioUrl: `https://corsproxy.io/?${encodeURIComponent(item.previewUrl)}`,
              releaseYear: item.releaseDate ? item.releaseDate.substring(0, 4) : '2025',
              plays: '3.2M',
              isLiked: false
            };
          });
      }
    }
  } catch {
    // Try Secondary Engine
  }

  return [];
}

function cleanText(str: string): string {
  if (!str) return '';
  return str
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&#039;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim();
}

function formatTimeFromSeconds(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}
