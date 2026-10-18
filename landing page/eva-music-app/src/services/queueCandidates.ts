import type { Track } from '../types';
export function availableCandidates(tracks: Track[]) {
  const seen = new Set<string>();
  return tracks.filter(track => {
    const url = track.audioUrl || track.fallbackAudioUrl;
    if (!url || /apple\.com|itunes|mzstatic|preview/i.test(url) || seen.has(track.id)) return false;
    seen.add(track.id); return true;
  }).slice(0, 60);
}
