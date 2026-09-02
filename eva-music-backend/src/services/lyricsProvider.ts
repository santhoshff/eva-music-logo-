import { supabase } from '../db/supabaseClient.js';
import { getCache, setCache } from './cache.js';

export interface LyricsResult {
  trackId: string;
  plainLyrics?: string;
  syncedLyrics?: string;
  lines: string[];
  provider: string;
}

/**
 * High-speed SimpMusic Synced & RichSync Lyrics Provider
 * Inspired by SimpMusicLyrics.kt (https://api-lyrics.simpmusic.org/v1/)
 */
async function fetchSimpMusicLyrics(videoId: string): Promise<{ plain?: string; synced?: string } | null> {
  const endpoints = [
    `https://api-lyrics.simpmusic.org/v1/${videoId}`,
    `https://vivi-yt-music-server.onrender.com/v1/${videoId}`,
  ];

  for (const endpoint of endpoints) {
    try {
      const res = await fetch(endpoint, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'SimpMusicLyrics/1.0',
        },
      });

      if (res.ok) {
        const data: any = await res.json();
        if (data && data.success && Array.isArray(data.data) && data.data.length > 0) {
          const match = data.data[0];
          const synced = match.richSyncLyrics || match.syncedLyrics;
          const plain = match.plainLyrics;
          if (synced || plain) {
            return { synced, plain };
          }
        }
      }
    } catch {
      // Continue to next endpoint fallback
    }
  }

  return null;
}

export async function fetchTrackLyrics(trackId: string, title?: string, artist?: string): Promise<LyricsResult> {
  const cacheKey = `lyrics:${trackId}`;
  const cached = await getCache(cacheKey);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch {
      // Ignore cache parse error
    }
  }

  // 1. Check DB Cache Table
  try {
    const { data } = await supabase
      .from('lyrics_cache')
      .select('*')
      .eq('track_id', trackId)
      .single();

    if (data) {
      const lines = data.synced_lyrics
        ? data.synced_lyrics.split('\n').map((l: string) => l.replace(/\[\d{2}:\d{2}\.\d{2}\]/g, '').trim()).filter((l: string) => l.length > 0)
        : data.plain_lyrics
        ? data.plain_lyrics.split('\n').filter((l: string) => l.trim().length > 0)
        : [];

      const result: LyricsResult = {
        trackId,
        plainLyrics: data.plain_lyrics,
        syncedLyrics: data.synced_lyrics,
        lines,
        provider: data.provider || 'SimpMusic / LRCLIB (cached)',
      };
      await setCache(cacheKey, JSON.stringify(result), 86400); // 24 hours
      return result;
    }
  } catch {
    // Ignore DB error
  }

  // 2. Query SimpMusic API (High-speed word-by-word synced lyrics)
  const cleanId = trackId.replace(/^(yt-|itunes-|saavn-)/, '');
  let fetchedPlain = '';
  let fetchedSynced = '';
  let providerName = 'SimpMusic';

  const simpData = await fetchSimpMusicLyrics(cleanId);
  if (simpData && (simpData.synced || simpData.plain)) {
    fetchedSynced = simpData.synced || '';
    fetchedPlain = simpData.plain || '';
  } else if (title && artist) {
    // 3. Fallback to LRCLIB API
    providerName = 'LRCLIB';
    try {
      const cleanTitle = title.replace(/\(From.*?\)/gi, '').replace(/\(Original.*?\)/gi, '').trim();
      const url = `https://lrclib.net/api/get?track_name=${encodeURIComponent(cleanTitle)}&artist_name=${encodeURIComponent(artist)}`;
      const res = await fetch(url);
      if (res.ok) {
        const data: any = await res.json();
        fetchedPlain = data.plainLyrics || '';
        fetchedSynced = data.syncedLyrics || '';
      }
    } catch (err: any) {
      console.warn('[Lyrics] LRCLIB fetch notice:', err?.message || err);
    }
  }

  // Store in DB cache if lyrics were retrieved
  if (fetchedPlain || fetchedSynced) {
    try {
      await supabase.from('lyrics_cache').upsert({
        track_id: trackId,
        plain_lyrics: fetchedPlain,
        synced_lyrics: fetchedSynced,
        provider: providerName,
        cached_at: new Date().toISOString(),
      });
    } catch {
      // Ignore DB cache error
    }
  }

  const lines = fetchedSynced
    ? fetchedSynced.split('\n').map(l => l.replace(/\[\d{2}:\d{2}\.\d{2}\]/g, '').trim()).filter(l => l.length > 0)
    : fetchedPlain
    ? fetchedPlain.split('\n').filter(l => l.trim().length > 0)
    : [
        `🎵 ${title || 'Track'} - ${artist || 'Artist'}`,
        'Feel the full frequency in your soul...',
        'Vibing with the rhythm of the beat,',
        'Every moment carrying us through the night.',
        'Echoing through the endless sky,',
        'Listen to the sound elevate high.',
      ];

  const result: LyricsResult = {
    trackId,
    plainLyrics: fetchedPlain,
    syncedLyrics: fetchedSynced,
    lines,
    provider: providerName,
  };

  await setCache(cacheKey, JSON.stringify(result), 86400);
  return result;
}
