import { Track } from '../types';
import { apiSearch, apiGetRecommendations } from './backendApi';

export async function fetchTopTrendingHits(preferredGenre?: string): Promise<Track[]> {
  const backendRecs = await apiGetRecommendations(undefined, preferredGenre);
  if (backendRecs && backendRecs.length > 0) {
    const seenCovers = new Set<string>();
    const seenTitles = new Set<string>();
    const artistCounts: Record<string, number> = {};
    const filtered: Track[] = [];

    for (const t of backendRecs) {
      const cover = (t.coverUrl || '').trim();
      const normTitle = (t.title || '').toLowerCase().trim();
      const normArtist = (t.artist || '').toLowerCase().trim();

      if (cover && seenCovers.has(cover)) continue;
      if (normTitle && seenTitles.has(normTitle)) continue;
      if (normArtist && (artistCounts[normArtist] || 0) >= 2) continue;

      if (cover) seenCovers.add(cover);
      if (normTitle) seenTitles.add(normTitle);
      if (normArtist) artistCounts[normArtist] = (artistCounts[normArtist] || 0) + 1;
      filtered.push(t);
    }

    if (filtered.length >= 4) {
      return filtered;
    }
  }

  const trendingQueries = [
    'God Mode Karuppu',
    'Blinding Lights The Weeknd',
    'Kesariya Brahmastra',
    'Katchi Sera Sai Abhyankkar',
    'Levitating Dua Lipa',
    'Naa Ready Leo Vijay',
    'Apna Bana Le Arijit Singh',
    'Big Dawgs Hanumankind',
    'Aasa Kooda Sai Abhyankkar',
    'Hukum Jailer Anirudh'
  ];
  try {
    const promises = trendingQueries.map(q => searchOnlineTracks(q));
    const resultsArray = await Promise.all(promises);
    const seenCovers = new Set<string>();
    const seenTitles = new Set<string>();
    const diverseFallback: Track[] = [];

    for (const t of resultsArray.flat()) {
      const cover = (t.coverUrl || '').trim();
      const normTitle = (t.title || '').toLowerCase().trim();
      if (cover && seenCovers.has(cover)) continue;
      if (normTitle && seenTitles.has(normTitle)) continue;
      if (cover) seenCovers.add(cover);
      if (normTitle) seenTitles.add(normTitle);
      diverseFallback.push(t);
    }
    if (diverseFallback.length > 0) return diverseFallback;
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
              audioUrl: `/api/stream/${item.trackName ? encodeURIComponent(cleanText(item.trackName) + ' ' + cleanText(item.artistName)) : `itunes-${item.trackId}`}`,
              fallbackAudioUrl: item.previewUrl,
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
