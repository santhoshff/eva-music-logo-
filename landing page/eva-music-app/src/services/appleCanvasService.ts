/**
 * EVA Music - Apple Music Motion Canvas Service
 * Implements Apple Music animated motion artwork (HLS Canvas)
 * Based on AppleMusicCanvasProvider.kt
 */

export interface AppleCanvasArtwork {
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

const isDeployed = typeof window !== 'undefined' && 
  window.location.hostname !== 'localhost' && 
  window.location.hostname !== '127.0.0.1';

const API_BASE = isDeployed 
  ? '/api' 
  : ((import.meta as any).env?.VITE_BACKEND_URL || 'http://localhost:8080/api');

const CACHE_KEY = 'eva_apple_canvas_cache_v2';
const memoryCache = new Map<string, AppleCanvasArtwork | null>();

function getCacheKey(title: string, artist: string, album: string = ''): string {
  return `${title.trim().toLowerCase()}|${artist.trim().toLowerCase()}|${album.trim().toLowerCase()}`;
}

class AppleCanvasService {
  private localStore: Record<string, { data: AppleCanvasArtwork | null; expires: number }> = {};

  constructor() {
    this.initStorage();
  }

  private initStorage() {
    if (typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem(CACHE_KEY);
      if (stored) {
        this.localStore = JSON.parse(stored);
      }
    } catch {
      this.localStore = {};
    }
  }

  private saveStorage() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(this.localStore));
    } catch {
      // Ignore quota errors
    }
  }

  public async getCanvas(title: string, artist: string, album?: string): Promise<AppleCanvasArtwork | null> {
    if (!title || !artist) return null;
    const key = getCacheKey(title, artist, album);

    // 1. Check memory cache
    if (memoryCache.has(key)) {
      return memoryCache.get(key) || null;
    }

    // 2. Check localStorage cache
    const cachedItem = this.localStore[key];
    if (cachedItem && cachedItem.expires > Date.now()) {
      memoryCache.set(key, cachedItem.data);
      return cachedItem.data;
    }

    // 3. Query EVA Backend /api/canvas
    try {
      const query = new URLSearchParams({
        title,
        artist,
        album: album || '',
      });

      const res = await fetch(`${API_BASE}/canvas?${query.toString()}`);
      if (res.ok) {
        const json = await res.json();
        if (json && json.found && json.animatedUrl) {
          memoryCache.set(key, json);
          this.localStore[key] = { data: json, expires: Date.now() + 1000 * 60 * 60 * 24 * 7 };
          this.saveStorage();
          return json;
        }
      }
    } catch (err) {
      console.warn('[AppleCanvasService] Backend canvas notice:', err);
    }

    // 4. Client-side fallback if backend was unavailable
    try {
      const direct = await this.fetchClientFallback(title, artist, album);
      if (direct) {
        memoryCache.set(key, direct);
        this.localStore[key] = { data: direct, expires: Date.now() + 1000 * 60 * 60 * 24 * 7 };
        this.saveStorage();
        return direct;
      }
    } catch {
      // Ignore fallback errors
    }

    // Cache null for 1 hour to prevent constant refetching
    memoryCache.set(key, null);
    this.localStore[key] = { data: null, expires: Date.now() + 1000 * 60 * 60 };
    this.saveStorage();
    return null;
  }

  /**
   * Lightweight direct fallback to Apple Music Web API
   */
  private async fetchClientFallback(song: string, artist: string, album?: string): Promise<AppleCanvasArtwork | null> {
    try {
      const token =
        'eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NiIsImtpZCI6IldlYlBsYXlLaWQifQ.eyJpc3MiOiJBTVBXZWJQbGF5IiwiaWF0IjoxNzc0NDU2MzgyLCJleHAiOjE3ODE3MTM5ODIsInJvb3RfaHR0cHNfb3JpZ2luIjpbImFwcGxlLmNvbSJdfQ.4n8qYF4qa18sL1E0G9A3qX35cD8wQ-IJcS9Bh8ZT8JV_yLBtVq46B-9-2ZS3EvWHuw3yK9BYFYAhAdTaDm38vQ';

      const q = `${artist} ${song} ${album || ''}`.trim();
      const url = `https://amp-api.music.apple.com/v1/catalog/us/search?term=${encodeURIComponent(
        q
      )}&types=songs,albums&limit=5&extend=editorialVideo&include=albums`;

      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          Origin: 'https://music.apple.com',
          Referer: 'https://music.apple.com/',
        },
      });

      if (!res.ok) return null;
      const data = await res.json();
      const items = [...(data.results?.songs?.data || []), ...(data.results?.albums?.data || [])];

      for (const item of items) {
        const ev = item.attributes?.editorialVideo;
        if (ev) {
          const square = ev.motionDetailSquare || ev.motionSquareVideo1x1;
          const tall = ev.motionDetailTall || ev.motionTallVideo3x4;
          const videoUrl = square?.video || square?.videoUrl || tall?.video || tall?.videoUrl;
          if (videoUrl) {
            return {
              found: true,
              title: item.attributes?.name || song,
              artist: item.attributes?.artistName || artist,
              albumName: item.attributes?.collectionName || item.attributes?.name,
              animatedUrl: videoUrl,
              previewUrl: square?.previewFrame?.url?.replace('{w}x{h}', '1080x1080'),
              colors: square?.previewFrame?.bgColor ? { bgColor: `#${square.previewFrame.bgColor}` } : undefined,
            };
          }
        }
      }
    } catch {
      // Fallback failed
    }
    return null;
  }

  /**
   * Helper to attach HLS/m3u8 stream to an HTML5 <video> element seamlessly
   */
  public attachHls(videoEl: HTMLVideoElement | null, streamUrl: string): () => void {
    if (!videoEl || !streamUrl) return () => {};

    // 1. Native HLS support (Safari, iOS, WebKit)
    if (videoEl.canPlayType('application/vnd.apple.mpegurl')) {
      videoEl.src = streamUrl;
      videoEl.muted = true;
      videoEl.playsInline = true;
      videoEl.autoplay = true;
      videoEl.loop = true;
      videoEl.play().catch(() => {});
      return () => {
        videoEl.pause();
        videoEl.removeAttribute('src');
        videoEl.load();
      };
    }

    // 2. Use Hls.js dynamically for Chrome / Firefox / Android / Web
    let hlsInstance: any = null;

    const loadAndAttach = async () => {
      try {
        if (!(window as any).Hls) {
          await new Promise<void>((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.8/dist/hls.min.js';
            script.onload = () => resolve();
            script.onerror = () => reject(new Error('Hls.js load failed'));
            document.head.appendChild(script);
          });
        }

        const Hls = (window as any).Hls;
        if (Hls && Hls.isSupported()) {
          hlsInstance = new Hls({
            enableWorker: true,
            lowLatencyMode: true,
            autoStartLoad: true,
          });
          hlsInstance.loadSource(streamUrl);
          hlsInstance.attachMedia(videoEl);
          hlsInstance.on(Hls.Events.MANIFEST_PARSED, () => {
            videoEl.muted = true;
            videoEl.playsInline = true;
            videoEl.autoplay = true;
            videoEl.loop = true;
            videoEl.play().catch(() => {});
          });
        } else {
          videoEl.src = streamUrl;
          videoEl.play().catch(() => {});
        }
      } catch (e) {
        console.warn('[AppleCanvasService] HLS attachment warning:', e);
      }
    };

    loadAndAttach();

    return () => {
      if (hlsInstance) {
        try {
          hlsInstance.destroy();
        } catch {}
      }
    };
  }
}

export const appleCanvasService = new AppleCanvasService();
