/// <reference types="vite/client" />
import { Track } from '../types';
import { getAuthHeaders } from './supabaseClient';

const API_BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080/api';

/**
 * Backend API Client Service for EVA AI Music App
 */
export async function apiSearch(query: string, type: string = 'song'): Promise<Track[]> {
  try {
    const res = await fetch(`${API_BASE}/search?q=${encodeURIComponent(query)}&type=${encodeURIComponent(type)}`);
    if (res.ok) {
      const data = await res.json();
      if (data.results && Array.isArray(data.results)) {
        return data.results;
      }
    }
  } catch (err) {
    console.warn('[BackendAPI] Search fallback notice:', err);
  }
  return [];
}

export async function apiGetLyrics(trackId: string, title?: string, artist?: string): Promise<string[]> {
  try {
    const query = new URLSearchParams();
    if (title) query.append('title', title);
    if (artist) query.append('artist', artist);

    const res = await fetch(`${API_BASE}/lyrics/${encodeURIComponent(trackId)}?${query.toString()}`);
    if (res.ok) {
      const data = await res.json();
      if (data.lines && Array.isArray(data.lines)) {
        return data.lines;
      }
      if (data.plainLyrics) {
        return data.plainLyrics.split('\n');
      }
    }
  } catch (err) {
    console.warn('[BackendAPI] Lyrics fallback notice:', err);
  }
  return [
    `🎵 ${title || 'Track'} - ${artist || 'Artist'}`,
    'Feel the full frequency in your soul...',
    'Vibing with the rhythm of the beat,',
    'Every moment carrying us through the night.',
  ];
}

export async function apiGetRecommendations(trackId?: string, genre?: string): Promise<Track[]> {
  try {
    const params = new URLSearchParams();
    if (trackId) params.append('trackId', trackId);
    if (genre) params.append('genre', genre);
    const res = await fetch(`${API_BASE}/recommendations?${params.toString()}`);
    if (res.ok) {
      const data = await res.json();
      if (data.recommendations && Array.isArray(data.recommendations)) {
        return data.recommendations;
      }
    }
  } catch (err) {
    console.warn('[BackendAPI] Recommendations fallback notice:', err);
  }
  return [];
}
export const apiGetSongRecommendations = apiGetRecommendations;

export async function apiGetShareLink(trackId: string, title?: string, artist?: string): Promise<string> {
  try {
    const res = await fetch(`${API_BASE}/share/${encodeURIComponent(trackId)}?title=${encodeURIComponent(title || '')}&artist=${encodeURIComponent(artist || '')}`);
    if (res.ok) {
      const data = await res.json();
      if (data.songLinkUrl || data.shareUrl) {
        return data.songLinkUrl || data.shareUrl;
      }
    }
  } catch (err) {
    console.warn('[BackendAPI] Share link fallback notice:', err);
  }
  return `https://song.link/i/${trackId}`;
}
export const apiCreateShareLink = apiGetShareLink;

export async function apiToggleFavorite(track: Track, isLiked: boolean): Promise<boolean> {
  try {
    const headers = await getAuthHeaders();
    if (isLiked) {
      const res = await fetch(`${API_BASE}/library/favorites`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          trackId: track.id,
          title: track.title,
          artist: track.artist,
          thumbnailUrl: track.coverUrl,
          audioUrl: track.audioUrl,
        }),
      });
      return res.ok;
    } else {
      const res = await fetch(`${API_BASE}/library/favorites/${encodeURIComponent(track.id)}`, {
        method: 'DELETE',
        headers,
      });
      return res.ok;
    }
  } catch (err) {
    console.warn('[BackendAPI] Favorite sync notice:', err);
    return false;
  }
}

export async function apiRecordHistory(track: Track, msPlayed: number): Promise<void> {
  try {
    await fetch(`${API_BASE}/library/history`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        trackId: track.id,
        title: track.title,
        artist: track.artist,
        msPlayed,
      }),
    });
  } catch (err) {
    console.warn('[BackendAPI] History record notice:', err);
  }
}

export async function apiInitiateDownload(track: Track): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/downloads/${encodeURIComponent(track.id)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: track.title,
        artist: track.artist,
      }),
    });
    return res.ok;
  } catch (err) {
    console.warn('[BackendAPI] Download trigger notice:', err);
    return false;
  }
}

export function getBackendStreamUrl(trackId: string): string {
  if (trackId.startsWith('http://') || trackId.startsWith('https://')) {
    return trackId;
  }
  return `${API_BASE}/stream/${encodeURIComponent(trackId)}`;
}
