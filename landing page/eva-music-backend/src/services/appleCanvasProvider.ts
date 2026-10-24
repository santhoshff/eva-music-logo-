/**
 * Apple Music Motion Artwork & Animated Canvas Provider
 * Ported from AppleMusicCanvasProvider.kt (D:\all\Downloads\applecanvas)
 * Fetches Apple Music album motion artwork (HLS / animated canvas) for songs and albums.
 */

export interface CanvasArtwork {
  found: boolean;
  title: string;
  artist: string;
  albumName?: string;
  albumId?: string;
  animatedUrl?: string;
  tallAnimatedUrl?: string;
  previewUrl?: string;
  colors?: {
    bgColor?: string;
    textColor1?: string;
    textColor2?: string;
  };
}

interface CacheEntry {
  value: CanvasArtwork | null;
  expiresAt: number;
}

const memoryCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 1000 * 60 * 60 * 24; // 24 hours

// Token cache
let cachedToken: string | null = null;
let tokenExpiresAt = 0;

const FALLBACK_TOKEN =
  'eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NiIsImtpZCI6IldlYlBsYXlLaWQifQ.eyJpc3MiOiJBTVBXZWJQbGF5IiwiaWF0IjoxNzc0NDU2MzgyLCJleHAiOjE3ODE3MTM5ODIsInJvb3RfaHR0cHNfb3JpZ2luIjpbImFwcGxlLmNvbSJdfQ.4n8qYF4qa18sL1E0G9A3qX35cD8wQ-IJcS9Bh8ZT8JV_yLBtVq46B-9-2ZS3EvWHuw3yK9BYFYAhAdTaDm38vQ';

const AMP_BASE_URL = 'https://amp-api.music.apple.com';

/**
 * Dynamically extract JWT developer token from Apple Music web player
 */
export async function getAppleMusicToken(): Promise<string> {
  const now = Date.now();
  if (cachedToken && tokenExpiresAt > now) {
    return cachedToken;
  }

  try {
    const htmlRes = await fetch('https://music.apple.com/us/browse', {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });
    const html = await htmlRes.text();

    // Look for main app index bundle
    const match = html.match(/src="(\/assets\/index~[a-z0-9]+\.js)"/i) || html.match(/src="(\/assets\/index-[^"]+\.js)"/i);
    if (match) {
      const jsUrl = 'https://music.apple.com' + match[1];
      const jsRes = await fetch(jsUrl, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
      });
      const js = await jsRes.text();

      // Find first valid JWT starting with eyJ
      const tokenMatch = js.match(/(eyJ[A-Za-z0-9\-_=]+\.[A-Za-z0-9\-_=]+\.[A-Za-z0-9\-_=]+)/);
      if (tokenMatch) {
        cachedToken = tokenMatch[1];
        tokenExpiresAt = now + 1000 * 60 * 60 * 12; // 12 hours
        return cachedToken;
      }
    }
  } catch (err) {
    console.warn('[AppleMusicCanvas] Error dynamically fetching Apple Music token, using fallback:', err);
  }

  cachedToken = FALLBACK_TOKEN;
  tokenExpiresAt = now + 1000 * 60 * 60 * 2;
  return FALLBACK_TOKEN;
}

function makeCacheKey(song: string, artist: string, album: string = '', storefront: string = 'us'): string {
  return `${song.trim().toLowerCase()}|${artist.trim().toLowerCase()}|${album.trim().toLowerCase()}|${storefront}`;
}

const BLACKLIST_WORDS = [
  'playlist',
  'set list',
  'essentials',
  'dj mix',
  'mixed',
  'apple music',
  "today's hits",
  'session',
];

function isBlacklisted(name: string, collection: string = ''): boolean {
  const n = (name + ' ' + collection).toLowerCase();
  return BLACKLIST_WORDS.some(word => n.includes(word));
}

function extractEditorialVideoUrl(ev: any): { animatedUrl?: string; tallAnimatedUrl?: string; previewUrl?: string; colors?: any } {
  if (!ev || typeof ev !== 'object') return {};

  const square = ev.motionDetailSquare || ev.motionSquareVideo1x1 || ev.motionDetailRaw;
  const tall = ev.motionDetailTall || ev.motionTallVideo3x4;

  const animatedUrl = square?.video || square?.videoUrl || square?.hlsUrl || square?.url;
  const tallAnimatedUrl = tall?.video || tall?.videoUrl || tall?.hlsUrl || tall?.url;

  const previewFrame = square?.previewFrame || tall?.previewFrame;
  let previewUrl: string | undefined = undefined;
  if (previewFrame?.url) {
    previewUrl = previewFrame.url.replace('{w}x{h}', '1080x1080');
  }

  const colors = previewFrame
    ? {
        bgColor: previewFrame.bgColor ? `#${previewFrame.bgColor}` : undefined,
        textColor1: previewFrame.textColor1 ? `#${previewFrame.textColor1}` : undefined,
        textColor2: previewFrame.textColor2 ? `#${previewFrame.textColor2}` : undefined,
      }
    : undefined;

  return { animatedUrl, tallAnimatedUrl, previewUrl, colors };
}

/**
 * Fetch motion artwork for a specific albumId via AMP API
 */
async function fetchMotionArtwork(
  albumId: string,
  storefront: string,
  fallbackArtist?: string,
  titleOverride?: string
): Promise<CanvasArtwork | null> {
  if (!albumId || albumId.startsWith('pl.')) return null;

  try {
    const token = await getAppleMusicToken();
    const url = `${AMP_BASE_URL}/v1/catalog/${storefront}/albums/${albumId}?extend=editorialVideo`;

    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        Origin: 'https://music.apple.com',
        Referer: 'https://music.apple.com/',
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });

    if (!res.ok) return null;
    const json = await res.json();
    const albumObj = json.data?.[0];
    if (!albumObj) return null;

    const attributes = albumObj.attributes || {};
    const albumName = attributes.name || '';
    const artistName = attributes.artistName || fallbackArtist || '';

    if (isBlacklisted(albumName)) return null;

    const ev = attributes.editorialVideo;
    if (ev) {
      const { animatedUrl, tallAnimatedUrl, previewUrl, colors } = extractEditorialVideoUrl(ev);
      if (animatedUrl || tallAnimatedUrl) {
        return {
          found: true,
          title: titleOverride || albumName,
          artist: artistName,
          albumName,
          albumId,
          animatedUrl: animatedUrl || tallAnimatedUrl,
          tallAnimatedUrl,
          previewUrl,
          colors,
        };
      }
    }
  } catch (err) {
    console.warn(`[AppleMusicCanvas] Failed to fetch album ${albumId}:`, err);
  }
  return null;
}

/**
 * Search and fetch Apple Music Canvas motion artwork
 */
export async function getMotionCanvas(
  song: string,
  artist: string,
  album?: string,
  storefront: string = 'us'
): Promise<CanvasArtwork | null> {
  const cacheKey = makeCacheKey(song, artist, album || '', storefront);
  const cached = memoryCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.value;
  }

  try {
    const token = await getAppleMusicToken();
    let query = song.toLowerCase().includes(artist.toLowerCase()) ? song : `${artist} ${song}`;
    if (album && !query.toLowerCase().includes(album.toLowerCase())) {
      query = `${query} ${album}`;
    }

    const searchUrl = `${AMP_BASE_URL}/v1/catalog/${storefront}/search?term=${encodeURIComponent(
      query
    )}&types=songs,albums&limit=8&extend=editorialVideo&include=albums`;

    const res = await fetch(searchUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        Origin: 'https://music.apple.com',
        Referer: 'https://music.apple.com/',
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });

    if (!res.ok) {
      return null;
    }

    const json = await res.json();
    const songs = json.results?.songs?.data || [];
    const albums = json.results?.albums?.data || [];
    const combined = [...songs, ...albums];

    // Score candidates based on AppleMusicCanvasProvider algorithm
    const scoredCandidates: Array<{ score: number; item: any }> = [];

    for (const item of combined) {
      const attributes = item.attributes || {};
      const resultName = (attributes.name || '').toLowerCase();
      const resultArtist = (attributes.artistName || '').toLowerCase();
      const resultCollection = (attributes.collectionName || '').toLowerCase();

      if (isBlacklisted(resultName, resultCollection)) continue;

      const requestedArtist = artist.toLowerCase();
      const artistMatch = resultArtist === requestedArtist;
      const artistFuzzy = resultArtist.includes(requestedArtist) || requestedArtist.includes(resultArtist);
      if (!artistFuzzy) continue;

      let score = artistMatch ? 10 : 5;

      const requestedSong = song.toLowerCase();
      const nameMatch = resultName === requestedSong;
      const nameFuzzy = resultName.includes(requestedSong) || requestedSong.includes(resultName);
      if (nameMatch) score += 15;
      else if (nameFuzzy) score += 7;
      else score -= 8;

      if (album && resultCollection) {
        const reqAlbum = album.toLowerCase();
        if (resultCollection === reqAlbum) score += 20;
        else if (resultCollection.includes(reqAlbum) || reqAlbum.includes(resultCollection)) score += 10;
      }

      scoredCandidates.push({ score, item });
    }

    scoredCandidates.sort((a, b) => b.score - a.score);

    for (const { score, item } of scoredCandidates) {
      if (score < 10) continue;
      const attributes = item.attributes || {};
      const isSong = item.type === 'songs';

      // 1. Direct editorial video on search item
      const ev = attributes.editorialVideo;
      if (ev) {
        const { animatedUrl, tallAnimatedUrl, previewUrl, colors } = extractEditorialVideoUrl(ev);
        if (animatedUrl || tallAnimatedUrl) {
          const result: CanvasArtwork = {
            found: true,
            title: isSong ? attributes.name : song,
            artist: attributes.artistName || artist,
            albumName: attributes.collectionName || attributes.name,
            albumId: item.id,
            animatedUrl: animatedUrl || tallAnimatedUrl,
            tallAnimatedUrl,
            previewUrl,
            colors,
          };
          memoryCache.set(cacheKey, { value: result, expiresAt: Date.now() + CACHE_TTL_MS });
          return result;
        }
      }

      // 2. Resolve album ID
      let targetAlbumId: string | null = null;
      if (isSong) {
        targetAlbumId =
          item.relationships?.albums?.data?.[0]?.id || attributes.collectionId || null;
        if (!targetAlbumId && attributes.url) {
          const matchId = attributes.url.match(/\/album\/[^/]+\/([0-9]+)/);
          if (matchId) targetAlbumId = matchId[1];
        }
      } else {
        targetAlbumId = item.id;
      }

      if (targetAlbumId) {
        const fetched = await fetchMotionArtwork(
          targetAlbumId,
          storefront,
          attributes.artistName || artist,
          attributes.name
        );
        if (fetched) {
          memoryCache.set(cacheKey, { value: fetched, expiresAt: Date.now() + CACHE_TTL_MS });
          return fetched;
        }
      }
    }
  } catch (err) {
    console.warn('[AppleMusicCanvas] Error searching motion canvas:', err);
  }

  // Cache null for 2 hours to avoid hammering
  memoryCache.set(cacheKey, { value: null, expiresAt: Date.now() + 1000 * 60 * 60 * 2 });
  return null;
}
