import { getCache, setCache } from './cache.js';

export interface ShareResponse {
  trackId: string;
  songLinkUrl: string;
  title?: string;
  artist?: string;
  platforms?: Record<string, string>;
}

export async function getSongShareLink(trackId: string, title?: string, artist?: string): Promise<ShareResponse> {
  const cacheKey = `share:${trackId}`;
  const cached = await getCache(cacheKey);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch {
      // ignore
    }
  }

  let songLinkUrl = `https://song.link/i/${trackId.replace(/^(yt-|itunes-|saavn-)/, '')}`;
  const platforms: Record<string, string> = {
    spotify: '',
    appleMusic: '',
    youtube: `https://www.youtube.com/watch?v=${trackId.replace(/^(yt-|itunes-|saavn-)/, '')}`,
  };

  try {
    const queryUrl = `https://api.song.link/v1-0.0/links?url=${encodeURIComponent(platforms.youtube)}`;
    const res = await fetch(queryUrl);
    if (res.ok) {
      const data: any = await res.json();
      if (data.pageUrl) {
        songLinkUrl = data.pageUrl;
      }
    }
  } catch (err: any) {
    console.warn('[Odesli] Odesli API notice:', err?.message || err);
  }

  const result: ShareResponse = {
    trackId,
    songLinkUrl,
    title,
    artist,
    platforms,
  };

  await setCache(cacheKey, JSON.stringify(result), 86400);
  return result;
}
