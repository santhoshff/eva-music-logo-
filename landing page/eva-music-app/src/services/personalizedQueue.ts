import type { Track } from '../types';
import { getAuthHeaders } from './supabaseClient';
import { searchOnlineTracks } from './musicApi';
import { availableCandidates } from './queueCandidates';
export type QueuePreferences = { artists: string[]; genres: string[]; mood: string };
export type PersonalizedQueue = { title: string; explanation: string; tracks: Track[] };
export async function createPersonalizedQueue(preferences: QueuePreferences, catalog: Track[], signal: AbortSignal, status: (message: string) => void): Promise<PersonalizedQueue> {
  const headers = await getAuthHeaders();
  if (!headers.Authorization) throw new Error('Sign in to create your personalized queue.');
  status('Finding available songs…');
  const searches = [...preferences.artists, ...preferences.genres].slice(0, 4);
  const results: Track[] = [];
  for (const query of searches) {
    if (signal.aborted) throw new DOMException('Cancelled', 'AbortError');
    results.push(...await searchOnlineTracks(query).catch(() => []));
  }
  const candidates = availableCandidates([...results, ...catalog]);
  if (!candidates.length) throw new Error('No full songs are available for these choices. Try another artist or genre.');
  status('Choosing songs for your mood…');
  const response = await fetch('https://eva-flow-craft.lovable.app/api/public/music-queue', {
    method: 'POST', headers, signal,
    body: JSON.stringify({ ...preferences, candidates: candidates.map(({ id, title, artist, genre }) => ({ id, title, artist, genre })) }),
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.message || `Queue request failed (${response.status}).`);
  }
  if (!response.body) throw new Error('No queue response was received.');
  const reader = response.body.getReader();
  const decoder = new TextDecoder(); let buffer = ''; let queue: PersonalizedQueue | undefined;
  try {
    while (true) {
      const { value, done } = await reader.read();
      buffer += done ? decoder.decode() : decoder.decode(value, { stream: true });
      const lines = buffer.split('\n'); buffer = lines.pop() || '';
      for (const line of lines) {
        if (!line.trim()) continue;
        const event = JSON.parse(line);
        if (event.type === 'error') throw new Error(event.message);
        if (event.type === 'status') status(event.message);
        if (event.type === 'queue') {
          const ids: string[] = Array.isArray(event.queue?.trackIds) ? event.queue.trackIds : [];
          const tracks = [...new Set(ids)].map(id => candidates.find(track => track.id === id)).filter((track): track is Track => !!track);
          if (!tracks.length) throw new Error('No available songs were returned.');
          queue = { title: event.queue.title, explanation: event.queue.explanation, tracks };
        }
      }
      if (done) break;
    }
  } finally { await reader.cancel().catch(() => {}); reader.releaseLock(); }
  if (!queue) throw new Error('The request ended without a listening queue.');
  return queue;
}
